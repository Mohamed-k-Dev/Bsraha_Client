import { motion } from 'motion/react';
import { cn } from '@/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center text-center py-20 px-6', className)}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 blur-2xl bg-ember-200/40 rounded-full" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-paper-100 border border-ink-200 text-ink-400">
          {icon}
        </div>
      </div>
      <h3 className="font-display text-2xl font-semibold text-ink-800 text-balance">{title}</h3>
      <p className="mt-2 max-w-sm text-ink-500 text-pretty">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center text-center py-20 px-6', className)}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="font-display text-xl font-semibold text-ink-800">Something went wrong</h3>
      <p className="mt-2 max-w-sm text-ink-500">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline mt-5 px-5 py-3">
          Try again
        </button>
      )}
    </motion.div>
  );
}
