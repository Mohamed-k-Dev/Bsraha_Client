import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '@/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, label, size = 'md' }: ToggleProps) {
  const dims = size === 'sm' ? { w: 'w-9', h: 'h-5', knob: 'h-4 w-4', tx: 'translate-x-4' } : { w: 'w-11', h: 'h-6', knob: 'h-5 w-5', tx: 'translate-x-5' };

  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn('relative inline-flex items-center rounded-full transition-colors duration-300 shrink-0', dims.w, dims.h, checked ? 'bg-moss-500' : 'bg-ink-200')}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn('inline-block rounded-full bg-white shadow-sm', dims.knob, checked ? dims.tx : 'translate-x-0.5')}
      />
    </button>
  );
}

interface CopyButtonProps {
  text: string;
  className?: string;
  children?: React.ReactNode;
}

export function CopyButton({ text, className, children }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button onClick={copy} className={cn('btn btn-outline', className)}>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="copied" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-moss-600">
            <Check className="h-4 w-4" /> Copied
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
            {children ?? 'Copy link'}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'anonymous' | 'visible' | 'public' | 'private' | 'moss' | 'ember';
  className?: string;
}

const badgeStyles = {
  default: 'bg-ink-100 text-ink-600',
  anonymous: 'bg-ink-800 text-paper-100',
  visible: 'bg-sky-100 text-sky-accent',
  public: 'bg-moss-100 text-moss-700',
  private: 'bg-ink-100 text-ink-500',
  moss: 'bg-moss-500 text-white',
  ember: 'bg-ember-500 text-white',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return <span className={cn('chip', badgeStyles[variant], className)}>{children}</span>;
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const dims = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-3' };
  return <div className={cn('animate-spin rounded-full border-ink-200 border-t-ember-500', dims[size], className)} />;
}
