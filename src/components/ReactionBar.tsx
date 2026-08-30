import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ReactionType, Reaction } from '@/types';
import { REACTION_META, REACTION_ORDER, totalReactions, sortReactionsByCount, cn, formatNumber } from '@/utils';

interface ReactionBarProps {
  reactions: Reaction[];
  myReaction: ReactionType | null;
  onReact: (type: ReactionType) => void;
  compact?: boolean;
}

export function ReactionBar({ reactions, myReaction, onReact, compact }: ReactionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const sorted = sortReactionsByCount(reactions);
  const total = totalReactions(reactions);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const handlePick = useCallback(
    (type: ReactionType) => {
      onReact(type);
      setPickerOpen(false);
    },
    [onReact]
  );

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <AnimatePresence>
        {sorted.map((r) => {
          const meta = REACTION_META[r.type];
          const isMine = myReaction === r.type;
          return (
            <motion.button
              key={r.type}
              layout
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => onReact(r.type)}
              className={cn(
                'chip transition-all duration-200 select-none',
                isMine
                  ? 'bg-ember-100 text-ember-800 ring-1 ring-ember-300'
                  : 'bg-ink-100/60 text-ink-700 hover:bg-ink-100'
              )}
            >
              <span className="text-sm leading-none">{meta.emoji}</span>
              <span className="font-mono text-[11px] tabular-nums">{formatNumber(r.count)}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>

      <div className="relative" ref={pickerRef}>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setPickerOpen((v) => !v)}
          className={cn(
            'chip transition-all',
            myReaction
              ? 'bg-ember-500 text-white'
              : 'bg-transparent text-ink-400 hover:bg-ink-100 hover:text-ink-600 border border-dashed border-ink-200'
          )}
          aria-label="Add reaction"
        >
          {myReaction ? (
            <>
              <span className="text-sm leading-none">{REACTION_META[myReaction].emoji}</span>
              <span className="text-[11px]">{REACTION_META[myReaction].label}</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              {!compact && <span className="text-[11px]">React</span>}
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="absolute bottom-full mb-2 left-0 z-50 flex gap-1 rounded-2xl bg-ink-900 px-2 py-1.5 shadow-cardLg"
            >
              {REACTION_ORDER.map((type, i) => (
                <motion.button
                  key={type}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 500, damping: 20 }}
                  whileHover={{ scale: 1.3, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePick(type)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-ink-700 transition-colors"
                  title={REACTION_META[type].label}
                >
                  {REACTION_META[type].emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {total > 0 && compact && (
        <span className="ml-0.5 font-mono text-[11px] text-ink-400 tabular-nums">{formatNumber(total)}</span>
      )}
    </div>
  );
}
