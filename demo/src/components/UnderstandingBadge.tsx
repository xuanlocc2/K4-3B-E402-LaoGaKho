/**
 * UnderstandingBadge — compact display of the inferred understanding level.
 *
 * Design principles:
 * - Small and unobtrusive — does NOT dominate the answer area
 * - Level name visible but muted, not a large header
 * - Confidence percentage tiny and grayed out
 * - Only shown once at the BOTTOM of a tutor response
 *
 * Color coding:
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
      <span
        className="inline-flex items-center gap-1 text-xs text-muted-foreground"
        data-level={level}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
        {config.label}
      </span>

      {confidence !== undefined && (
        <span className="text-[10px] text-slate-400 tabular-nums">
          {Math.round(confidence * 100)}%
        </span>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline transition-colors"
        >
          Chỉnh mức
        </button>
      )}
    </div>
  );
}
