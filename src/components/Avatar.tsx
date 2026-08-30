import { avatarGradient, initials, cn } from '@/utils';

interface AvatarProps {
  name: string;
  seed: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  anonymous?: boolean;
  className?: string;
}

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
  '2xl': 'h-28 w-28 text-3xl',
};

export function Avatar({ name, seed, size = 'md', anonymous, className }: AvatarProps) {
  if (anonymous) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-mono font-semibold text-paper-50 shrink-0',
          sizes[size],
          className
        )}
        style={{ background: 'linear-gradient(135deg, #3f3624, #100c07)' }}
        aria-label="Anonymous"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-1/2 w-1/2 opacity-70" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z" />
          <path d="M5 14a7 7 0 0 0 14 0" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center justify-center rounded-full font-display font-semibold text-white shrink-0 shadow-sm', sizes[size], className)}
      style={{ background: avatarGradient(seed) }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
