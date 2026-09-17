import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import transcriptData from '../data/transcript-03.json';

/**
 * SlideView — left panel (3/5 width).
 *
 * Props received from App:
 *   - personaId   : current persona (not used in view but useful for debugging)
 *   - onAskTutor : called with the selected text when user clicks "Hỏi tutor"
 *
 * Local state: selectedText (highlighted text) lives here so the user can
 * see the excerpt before committing to asking the tutor.
 */
export interface SlideViewProps {
  personaId: string;
  onAskTutor: (text: string) => void;
}

export default function SlideView({ personaId: _personaId, onAskTutor }: SlideViewProps) {
  const [selectedText, setSelectedText] = useState<string>('');

  /**
   * Reads `window.getSelection()` on mouse-up and updates local state.
   * Trimmed to avoid capturing trailing whitespace.
   */
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();
    setSelectedText(text);
  }, []);

  /**
   * Clears the local selection (so a new selection can be started).
   * Called after "Hỏi tutor" is clicked.
   */
  const handleAskTutor = useCallback(() => {
    const trimmed = selectedText.trim();
    if (!trimmed) return;
    onAskTutor(trimmed);
    // Clear selection so the highlight disappears after asking
    window.getSelection()?.removeAllRanges();
    setSelectedText('');
  }, [selectedText, onAskTutor]);

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="text-sm font-medium text-muted-foreground">
          Buổi 2 · Soi bài toán các nhóm
        </span>
        <span className="text-xs text-muted-foreground/60">transcript-03</span>
      </div>

      {/* Selection hint bar — shown only when text is highlighted */}
      <AnimatePresence>
        {selectedText.length > 0 && (
          <motion.div
            key="selection-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden border-b border-amber-200 bg-amber-50 shrink-0"
          >
            <div className="flex items-center gap-2 px-4 py-2.5">
              <span className="text-xs text-amber-700 italic truncate flex-1 leading-relaxed">
                &ldquo;{selectedText.slice(0, 80)}
                {selectedText.length > 80 ? '…' : ''}&rdquo;
              </span>
              <button
                onClick={handleAskTutor}
                className="shrink-0 px-4 py-1.5 text-xs font-medium text-white bg-primary rounded-full hover:bg-primary/90 transition-colors shadow-sm"
              >
                Hỏi tutor
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript paragraphs */}
      <div
        className="flex-1 overflow-y-auto p-4 select-text"
        onMouseUp={handleMouseUp}
      >
        <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">
          3.1 Giới thiệu giảng viên và định hướng khoá học
        </h2>
        {transcriptData.map((paragraph) => (
          <p
            key={paragraph.id}
            className="text-sm text-muted-foreground leading-relaxed mb-3 hover:bg-accent/50 rounded px-1 cursor-text transition-colors"
          >
            {paragraph.text}
          </p>
        ))}

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground/60 italic">
            👆 Bôi đen đoạn bạn chưa hiểu, rồi nhấn &ldquo;Hỏi tutor&rdquo; để
            được giải thích phù hợp với trình độ của bạn.
          </p>
        </div>
      </div>
    </div>
  );
}
