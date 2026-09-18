import { motion } from 'framer-motion';
import { Sparkles, Zap, BookOpen } from 'lucide-react';
import { Dialog } from './ui/dialog';

/**
 * LevelSelector — modal dialog for the user to manually select
 * their understanding level (Beginner / Intermediate / Advanced).
 *
 * @see HV3 §4 Component 3 (LevelSelector)
 *
 * Used when:
 * - AI confidence is low (< 0.4) → asks user to confirm
 * - User clicks "Chỉnh mức hiểu" → opens selector
 * - Correction path in the 4-experience flow
 */
interface LevelSelectorProps {
  currentLevel: string;
  onSelect: (level: string) => void;
  onClose: () => void;
  open?: boolean;
}

const LEVELS = [
  {
    id: 'beginner',
    Icon: Sparkles,
    emoji: '🟢',
    label: 'Mới bắt đầu',
    description: 'Cần giải thích từ gốc, dùng ví dụ đời thường',
    activeBorder: 'border-emerald-500 bg-emerald-50',
    inactiveBorder: 'border-border hover:border-emerald-300',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'intermediate',
    Icon: Zap,
    emoji: '🟡',
    label: 'Trung bình',
    description: 'Hiểu cơ bản, cần giải thích vừa đủ',
    activeBorder: 'border-amber-500 bg-amber-50',
    inactiveBorder: 'border-border hover:border-amber-300',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'advanced',
    Icon: BookOpen,
    emoji: '🔴',
    label: 'Nâng cao',
    description: 'Có nền tảng, cần giải thích chuyên sâu',
    activeBorder: 'border-destructive bg-destructive/5',
    inactiveBorder: 'border-border hover:border-destructive/40',
    iconBg: 'bg-rose-100 text-rose-600',
  },
];

export default function LevelSelector({
  currentLevel,
  onSelect,
  onClose,
  open = true,
}: LevelSelectorProps) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Chọn mức hiểu của bạn
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Mình sẽ điều chỉnh câu trả lời cho phù hợp.
        </p>

        <div className="mt-4 space-y-3">
          {LEVELS.map((level) => {
            const isActive = currentLevel === level.id;
            const { Icon } = level;

            return (
              <motion.button
                key={level.id}
                onClick={() => onSelect(level.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isActive ? level.activeBorder : level.inactiveBorder}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${level.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{level.emoji} {level.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {level.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="ml-auto shrink-0">
                      <div className={`w-2 h-2 rounded-full ${level.id === 'beginner' ? 'bg-emerald-500' : level.id === 'intermediate' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Hủy
        </button>
      </div>
    </Dialog>
  );
}
