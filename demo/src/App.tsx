/**
 * Root App — CiteTutor demo.
 *
 * State lives here (lifted from ChatBox / SlideView) and flows down:
 *   currentPersonaId  → PersonaSwitcher (read) + SlideView (read) + ChatBox (read)
 *   history           → ChatBox (read/write)
 *   selectedText      → SlideView (set) + ChatBox (on "Hỏi tutor")
 *   lastResponse      → ChatBox (read, used to render UnderstandingBadge + answer)
 *   overrideLevel     → ChatBox (read) + LevelSelector modal
 *
 * Flow when user clicks "Hỏi tutor":
 *   1. SlideView → App.onAskTutor(selectedText)
 *   2. App runs detectSegment (broken? → warning path)
 *   3. App calls callGemini (real or mock)
 *   4. App sets lastResponse → ChatBox re-renders answer
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SlideView from './components/SlideView';
import ChatBox from './components/ChatBox';
import PersonaSwitcher from './components/PersonaSwitcher';
import LevelSelector from './components/LevelSelector';
import { callGemini } from './lib/gemini';
import { detectSegment } from './lib/segment-detect';
import { inferLevel } from './lib/inference';
import { getMockResponse } from './lib/gemini-mock';
import type { TutorResponse } from './types';
import type { ChatMessage } from './types';
import transcriptData from './data/transcript-03.json';

// ─── Persona map ───────────────────────────────────────────────────────────────

/** Hardcoded persona data (mirrors data/personas.json). */
const PERSONA_MAP: Record<string, { id: string; name: string; level: string; history: Array<{ role: string; text: string }>; grade_missing: boolean }> = {
  minh: {
    id: 'minh',
    name: 'Minh',
    level: 'beginner',
    history: [
      { role: 'user', text: 'attention là gì?' },
      { role: 'user', text: 'giải thích đơn giản hơn' },
      { role: 'user', text: 'cho ví dụ' },
    ],
    grade_missing: false,
  },
  lan: {
    id: 'lan',
    name: 'Lan',
    level: 'intermediate',
    history: [
      { role: 'user', text: 'self-attention khác gì cross-attention?' },
      { role: 'user', text: 'QKV là gì?' },
    ],
    grade_missing: false,
  },
  anonymous: {
    id: 'anonymous',
    name: 'Ẩn danh',
    level: 'unknown',
    history: [],
    grade_missing: true,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flat transcript text for word-overlap detection. */
const TRANSCRIPT_TEXT = transcriptData.map((p) => p.text).join(' ');

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentPersonaId, setCurrentPersonaId] = useState<string>('minh');
  const [selectedText, setSelectedText] = useState<string>('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [lastResponse, setLastResponse] = useState<TutorResponse | null>(null);
  const [overrideLevel, setOverrideLevel] = useState<string | null>(null);
  const [showLevelSelector, setShowLevelSelector] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ── Derived: current persona (guaranteed non-null via fallback to 'minh') ──
  const currentPersona = PERSONA_MAP[currentPersonaId] ?? PERSONA_MAP['minh']!;

  // ── Pre-compute understanding inference (for confidence display) ────────────
  const inference = useMemo(
    () =>
      inferLevel(
        currentPersona.history as Array<{ role: 'user' | 'tutor'; text: string }>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPersonaId]
  );

  // ── Handler: "Hỏi tutor" clicked in SlideView ───────────────────────────────
  const handleAskTutor = useCallback(
    async (text: string) => {
      setSelectedText(text);
      setLastResponse(null);

      // Step 1: Segment detection (runs synchronously, no API call needed)
      const seg = detectSegment({
        history: currentPersona.history,
        selectedText: text,
        gradeMissing: currentPersona.grade_missing,
        transcriptText: TRANSCRIPT_TEXT,
      });

      // ── Broken segment path ────────────────────────────────────────────────
      if (seg.isBroken) {
        const warningResponse: TutorResponse = {
          level: 'unknown',
          confidence: 0,
          segment: 'broken',
          segment_reason: seg.reason,
          answer: '',
          warning:
            seg.reason === 'grade_missing'
              ? 'Bạn chưa có điểm trong hệ thống VLearn và mình không có lịch sử tương tác. Mình không thể suy ra mức hiểu của bạn một cách chính xác.'
              : 'Mình không có căn cứ trong transcript cho đoạn này và không có lịch sử tương tác.',
          options: ['Chuyển giảng viên', 'Trả lời mặc định'],
        };
        setLastResponse(warningResponse);
        return;
      }

      // ── Normal path — call Gemini ──────────────────────────────────────────
      setIsLoading(true);

      try {
        const effectiveLevel = overrideLevel ?? currentPersona.level;

        const response = await callGemini(
          text,
          currentPersona.history as Array<{ role: 'user' | 'tutor'; text: string }>,
          currentPersona.id,
          currentPersona.name,
          effectiveLevel
        );

        // If user manually overrode the level, re-call with the forced level
        if (overrideLevel && response.level !== overrideLevel) {
          const forced = await callGemini(
            text,
            currentPersona.history as Array<{ role: 'user' | 'tutor'; text: string }>,
            currentPersona.id,
            currentPersona.name,
            overrideLevel
          );
          setLastResponse(forced);
        } else {
          setLastResponse(response);
        }

        // Add exchange to chat history
        const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: `Hỏi về: "${text.slice(0, 80)}${text.length > 80 ? '…' : ''}"`,
        };
        const tutorMsg: ChatMessage = {
          id: `tutor-${Date.now()}`,
          role: 'tutor',
          content:
            `**Mức hiểu: ${response.level}** (${Math.round(response.confidence * 100)}% chắc)\n\n` +
            response.answer,
        };
        setHistory((prev) => [...prev, userMsg, tutorMsg]);
      } catch (err) {
        // Graceful degradation — never let an error crash the UI
        console.error('[App] Unexpected error in handleAskTutor:', err);
        const fallback = getMockResponse(currentPersona.id, text);
        setLastResponse(fallback);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPersona, overrideLevel]
  );

  // ── Handler: user changes persona ──────────────────────────────────────────
  const handlePersonaChange = useCallback((newId: string) => {
    setCurrentPersonaId(newId);
    setSelectedText('');
    setLastResponse(null);
    setHistory([]);
    setOverrideLevel(null);
    setShowLevelSelector(false);
  }, []);

  // ── Handler: "Chỉnh mức" clicked ─────────────────────────────────────────
  const handleEditLevel = useCallback(() => {
    setShowLevelSelector(true);
  }, []);

  // ── Handler: user selects a level in the modal ──────────────────────────────
  const handleLevelSelect = useCallback(
    async (level: string) => {
      setShowLevelSelector(false);
      if (level === overrideLevel) return;

      setOverrideLevel(level);
      setIsLoading(true);

      try {
        const response = await callGemini(
          selectedText,
          currentPersona.history as Array<{ role: 'user' | 'tutor'; text: string }>,
          currentPersona.id,
          currentPersona.name,
          level
        );
        setLastResponse(response);

        const noteMsg: ChatMessage = {
          id: `note-${Date.now()}`,
          role: 'tutor',
          content: `*(User manually set level → **${level}**, re-calling Gemini)*`,
        };
        setHistory((prev) => [...prev, noteMsg]);
      } catch (err) {
        console.error('[App] Error re-calling Gemini after level override:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPersona, selectedText, overrideLevel]
  );

  // ── Derived: dev-mode banner ───────────────────────────────────────────────
  const isMockMode =
    import.meta.env.DEV &&
    (!import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_GEMINI_API_KEY.startsWith('your-'));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 overflow-hidden">
      {/* Mock-mode dev banner */}
      <AnimatePresence>
        {isMockMode && (
          <motion.div
            key="mock-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-amber-100 border-b border-amber-300 shrink-0"
          >
            <div className="px-4 py-1.5 text-xs text-amber-800 flex items-center gap-2">
              <span>🔑</span>
              <span>
                Mock mode — VITE_GEMINI_API_KEY chưa được cấu hình. Sử dụng dữ
                liệu mock cho demo.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <header
        className={`flex items-center justify-between px-6 py-3 bg-card border-b border-border shrink-0 ${isMockMode ? '' : ''}`}
        style={isMockMode ? {} : {}}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-base">
            📚
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              CiteTutor
            </h1>
            <p className="text-xs text-muted-foreground leading-none">
              Tutor biết KHI NÀO không biết
            </p>
          </div>
          <div className="ml-3 px-2.5 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-xs text-primary font-medium">
            K4-3B-E402 · A1c
          </div>
        </div>
        <PersonaSwitcher value={currentPersonaId} onChange={handlePersonaChange} />
      </header>

      {/* Main: 2-column grid 60/40 */}
      <main className="flex-1 grid grid-cols-5 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left: Slide View */}
        <section className="col-span-3 min-h-0 flex flex-col">
          <SlideView
            personaId={currentPersonaId}
            onAskTutor={handleAskTutor}
          />
        </section>

        {/* Right: Chat Box */}
        <section className="col-span-2 min-h-0 flex flex-col">
          <ChatBox
            personaId={currentPersonaId}
            personaName={currentPersona.name}
            history={history}
            selectedText={selectedText}
            lastResponse={lastResponse}
            inferenceLevel={inference.level}
            inferenceConfidence={inference.confidence}
            isLoading={isLoading}
            onAskTutor={handleAskTutor}
            onEditLevel={handleEditLevel}
          />
        </section>
      </main>

      {/* Footer bar */}
      <footer className="shrink-0 px-6 py-2 border-t border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            5 phút pitch
          </span>
          <span className="text-border/50">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            3 persona
          </span>
          <span className="text-border/50">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            4 path
          </span>
        </div>
      </footer>

      {/* Level Selector Modal */}
      <LevelSelector
        currentLevel={overrideLevel ?? currentPersona.level}
        onSelect={handleLevelSelect}
        onClose={() => setShowLevelSelector(false)}
        open={showLevelSelector}
      />
    </div>
  );
}
