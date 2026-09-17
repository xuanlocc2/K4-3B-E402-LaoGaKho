import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import UnderstandingBadge from './UnderstandingBadge';
import TutorResponse from './TutorResponse';
import SegmentWarning from './SegmentWarning';
import type { ChatMessage, TutorResponse as TutorResponseType } from '../types';
import type { Level } from '../types';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ChatBoxProps {
  /** Current persona ID for display in the header. */
  personaId: string;
  /** Display name of the current persona. */
  personaName: string;
  /** Conversation history (appended by App when tutor responds). */
  history: ChatMessage[];
  /** Currently highlighted text in the transcript panel. */
  selectedText: string;
  /** Latest Gemini response (null before first call). */
  lastResponse: TutorResponseType | null;
  /** Heuristic level from inference.ts (used for header badge before first call). */
  inferenceLevel: Level;
  /** Heuristic confidence from inference.ts. */
  inferenceConfidence: number;
  /** True while a Gemini call is in flight. */
  isLoading: boolean;
  /** Called when user clicks "Hỏi tutor" (i.e. requests a new tutor question). */
  onAskTutor: (text: string) => void;
  /** Called when user clicks "Chỉnh mức". */
  onEditLevel: () => void;
}

// ─── ChatBox ─────────────────────────────────────────────────────────────────

export default function ChatBox({
  personaName,
  history,
  selectedText: _selectedText,
  lastResponse,
  inferenceLevel,
  inferenceConfidence,
  isLoading,
  onAskTutor,
  onEditLevel,
}: ChatBoxProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom whenever messages or the response changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, lastResponse]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Sends a free-text question (optional secondary path). */
  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    // Treat the typed question as a selection query
    onAskTutor(trimmed);
  }, [input, isLoading, onAskTutor]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Derive which badge to show ─────────────────────────────────────────────
  const badgeLevel = lastResponse?.level ?? inferenceLevel;
  const badgeConfidence = lastResponse?.confidence ?? inferenceConfidence;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header: persona name + level badge */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
            💬
          </div>
          <div>
            <span className="font-semibold text-foreground">
              Tutor VLearn
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              ({personaName})
            </span>
          </div>
        </div>
        <UnderstandingBadge
          level={badgeLevel}
          confidence={badgeConfidence}
          onEdit={onEditLevel}
        />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Welcome message — only shown when history is empty */}
        <AnimatePresence mode="wait">
          {history.length === 0 && !isLoading && !lastResponse && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <div className="bg-card shadow-sm border border-border px-4 py-3 rounded-xl rounded-tl-sm max-w-[90%]">
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm leading-none mt-0.5">
                    🤖
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      👋 Xin chào! Mình là Tutor VLearn. Bôi đen một đoạn transcript bạn
                      chưa hiểu, rồi nhấn &ldquo;Hỏi tutor&rdquo; để được giải
                      thích phù hợp với trình độ của bạn.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Mình sẽ suy ra mức hiểu từ lịch sử tương tác và điều chỉnh
                      độ sâu câu trả lời.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation history — animated */}
        <AnimatePresence mode="popLayout">
          {history.map((msg) => (
            <TutorResponse key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {/* Tutor response (lastResponse) */}
        <AnimatePresence mode="wait">
          {lastResponse && lastResponse.segment === 'normal' && (
            <motion.div
              key="last-response"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <div className="bg-card shadow-sm border border-border px-4 py-3 rounded-xl rounded-tl-sm max-w-[92%] w-full">
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm leading-none mt-0.5">
                    🤖
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Render answer as Markdown */}
                    <div className="prose prose-sm max-w-none prose-slate text-sm text-foreground [&_p]:mb-2 [&_strong]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_li]:mb-1 [&_ul]:pl-4">
                      <ReactMarkdown>{lastResponse.answer}</ReactMarkdown>
                    </div>

                    {/* Badge + "Chỉnh mức" link */}
                    <div className="mt-3 flex items-center gap-3">
                      <UnderstandingBadge
                        level={lastResponse.level}
                        confidence={lastResponse.confidence}
                        onEdit={onEditLevel}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Broken segment warning */}
        <AnimatePresence mode="wait">
          {lastResponse && lastResponse.segment === 'broken' && (
            <motion.div
              key="segment-warning"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <div className="w-full">
                <SegmentWarning
                  reason={
                    lastResponse.segment_reason === 'grade_missing'
                      ? 'grade_missing'
                      : 'no_evidence'
                  }
                  onTransferGV={() => {
                    alert('Đã chuyển câu hỏi cho giảng viên!');
                  }}
                  onDefaultAnswer={() => {
                    alert('Trả lời mặc định — chế độ không cá nhân hoá.');
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <div className="bg-card shadow-sm border border-border px-4 py-3 rounded-xl rounded-tl-sm">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm">Tutor đang suy luận mức hiểu…</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-4 py-3 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi của bạn, hoặc bôi đen transcript rồi bấm Hỏi tutor…"
            rows={1}
            className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            style={{ maxHeight: '6rem', overflowY: 'auto' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
