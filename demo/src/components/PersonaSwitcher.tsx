import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle2, ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/cn';

/**
 * PersonaSwitcher — dropdown in the top-right corner.
 *
 * Props received from App:
 *   - value    : currently selected persona ID
 *   - onChange : called with the new persona ID when user switches
 *
 * On change: resets chat state via App (App handles all state reset).
 */
interface PersonaSwitcherProps {
  value: string;
  onChange: (personaId: string) => void;
}

const PERSONAS = [
  { id: 'minh',      name: 'Minh',      level: 'beginner' },
  { id: 'lan',       name: 'Lan',        level: 'intermediate' },
  { id: 'anonymous', name: 'Ẩn danh',   level: 'unknown' },
];

const LEVEL_DOTS: Record<string, string> = {
  beginner: 'bg-emerald-500',
  intermediate: 'bg-amber-500',
  advanced: 'bg-rose-500',
  unknown: 'bg-slate-400',
};

export default function PersonaSwitcher({ value, onChange }: PersonaSwitcherProps) {
  const [open, setOpen] = useState(false);
  const selected = PERSONAS.find((p) => p.id === value) ?? PERSONAS[0]!;

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-sm',
          'hover:border-primary/40 hover:bg-accent transition-all shadow-sm',
          open && 'border-primary/50 bg-accent'
        )}
        aria-label="Chọn persona"
        aria-expanded={open}
      >
        <UserCircle2 className="w-4 h-4 text-primary shrink-0" />
        <span className="font-medium text-foreground">{selected.name}</span>
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', LEVEL_DOTS[selected.level])} />
        <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Invisible backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              key="dropdown"
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-card rounded-xl border border-border shadow-lg overflow-hidden"
            >
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border uppercase tracking-wide">
                Chọn học viên
              </div>
              {PERSONAS.map((p) => {
                const isSelected = p.id === value;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onChange(p.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors',
                      isSelected
                        ? 'bg-primary/5 text-primary'
                        : 'text-foreground hover:bg-accent'
                    )}
                  >
                    <span className={cn('shrink-0 w-2 h-2 rounded-full', LEVEL_DOTS[p.level])} />
                    <span className="flex-1 font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">({p.level})</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
