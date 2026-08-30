import { Link } from 'react-router-dom';
import { cn } from '@/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  to?: string | null;
}

const sizes = {
  sm: { text: 'text-xl', mark: 'h-7 w-7' },
  md: { text: 'text-2xl', mark: 'h-9 w-9' },
  lg: { text: 'text-4xl', mark: 'h-12 w-12' },
};

export function Logo({ size = 'md', className, to = '/' }: LogoProps) {
  const s = sizes[size];
  const content = (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('relative flex items-center justify-center', s.mark)}>
        <svg viewBox="0 0 40 40" className="h-full w-full">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="none" stroke="url(#logoGrad)" strokeWidth="2.5" />
          <path
            d="M12 14 Q12 11 15 11 L25 11 Q28 11 28 14 L28 20 Q28 23 25 23 L18 23 L14 27 L14 23 Q12 23 12 20 Z"
            fill="url(#logoGrad)"
            opacity="0.9"
          />
          <circle cx="17" cy="17" r="1.2" fill="#fdfcf9" />
          <circle cx="23" cy="17" r="1.2" fill="#fdfcf9" />
        </svg>
      </div>
      <span className={cn('font-display font-bold tracking-tight text-ink-900', s.text)}>
        Bsraha
      </span>
    </div>
  );

  if (to === null) return content;
  return <Link to={to}>{content}</Link>;
}
