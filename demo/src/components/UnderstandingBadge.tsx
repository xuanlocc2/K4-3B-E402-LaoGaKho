import { motion } from 'framer-motion';
import { CircleDot } from 'lucide-react';

/**
 * UnderstandingBadge — displays the inferred understanding level
 * with a color-coded badge: 🟢 Beginner / 🟡 Intermediate / 🔴 Advanced.
 *
 * @see HV3 §4 Component 1
 *
 * Variants:
 * - beginner  → emerald / green
 * - intermediate → amber / yellow
 * - advanced → rose / red
 * - unknown  → slate / gray
 */
export type BadgeLevel = 'beginner' | 'intermediate' | 'advanced' | 'unknown';

interface UnderstandingBadgeProps {
  level: BadgeLevel;
  confidence?: number;
  onEdit?: () => void;
}

const LEVEL_CONFIG: Record<
  BadgeLevel,
  {
    variant: 'success' | 'warning' | 'destructive' | 'muted';
    label: string;
    dotColor: string;
  }
> = {
  beginner: {
    variant: 'success',
    label: 'Beginner',
    dotColor: 'bg-emerald-500',
  },
  intermediate: {
    variant: 'warning',
    label: 'Intermediate',
    dotColor: 'bg-amber-500',
  },
  advanced: {
    variant: 'destructive',
    label: 'Advanced',
    dotColor: 'bg-rose-500',
  },
  unknown: {
    variant: 'muted',
    label: 'Chưa xác định',
    dotColor: 'bg-slate-400',
  },
};

export default function UnderstandingBadge({
  level,
  confidence,
  onEdit,
}: UnderstandingBadgeProps) {
  const config = LEVEL_CONFIG[level];

  return (
    <div className="flex items-center gap-2">
      <motion.span
        key={`badge-${level}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-transparent"
        data-level={level}
      >
        <CircleDot className={`w-3 h-3 shrink-0 ${config.dotColor.replace('bg-', 'text-')}`} />
        <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
        {config.label}
      </motion.span>

      {confidence !== undefined && (
        <span className="text-xs text-muted-foreground">
          {Math.round(confidence * 100)}% chắc
        </span>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          Chỉnh mức
        </button>
      )}
    </div>
  );
}
