import { useRef, useEffect, useState, useCallback, CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import { gsap } from 'gsap';
import { Shield, MessageCircle } from 'lucide-react';

export interface AccordionMessageItem {
  id: string;
  sender: string;
  tag?: string;
  avatar: string;
  avatarColor: string;
  message: string;
  time: string;
  link?: string;
}

export interface AccordionMessagesGalleryProps {
  items?: AccordionMessageItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  className?: string;
}

const DEFAULT_MESSAGES: AccordionMessageItem[] = [
  {
    id: '1',
    sender: 'Anonymous',
    tag: 'Anon',
    avatar: 'A',
    avatarColor: 'bg-ink-800',
    message: "I've been pretending to enjoy my job for three years. Today I finally admitted I'm only staying out of fear.",
    time: '2h ago',
    link: '#'
  },
  {
    id: '2',
    sender: 'Lina Okafor',
    avatar: 'LO',
    avatarColor: 'bg-[#c47c2b]',
    message: "You responded with more grace than I would have. That is why I wrote to you.",
    time: '3h ago',
    link: '#'
  },
  {
    id: '3',
    sender: 'Sahar Mirzai',
    avatar: 'SM',
    avatarColor: 'bg-[#8b3a2b]',
    message: "This thread is making me reconsider everything I complain about. Thank you both.",
    time: '5h ago',
    link: '#'
  },
  {
    id: '4',
    sender: 'Anonymous',
    tag: 'Anon',
    avatar: 'A',
    avatarColor: 'bg-ember-500',
    message: "Your latest project gave me the push I needed to start my own. Keep building.",
    time: '1d ago',
    link: '#'
  }
];

export function AccordionMessagesGallery({
  items = DEFAULT_MESSAGES,
  defaultIndex = 0,
  accentColor = '#f97316',
  overlayColor = '#120f17',
  textColor = '#ffffff',
  height = 460,
  gap = 12,
  radius = 24,
  expandRatio = 0.55,
  orientation = 'horizontal',
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 6,
  stagger = 0.06,
  trigger = 'hover',
  className = ''
}: AccordionMessagesGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const contentRefs = useRef<(HTMLElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);

  const vertical = orientation === 'vertical';
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1));

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const content = contentRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (content) {
          if (isActive) {
            tl.to(content, { opacity: 1, scale: 1, y: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
          } else {
            tl.to(content, { opacity: 0.3, scale: 0.95, y: 10, duration: dur * 0.6, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    [active, count, expandRatio, duration, ease, vertical, tilt, stagger, prefersReduced]
  );

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    []
  );

  const handleEnter = (i: number) => {
    if (trigger === 'hover') setActive(i);
  };

  const handleClick = (i: number, e: MouseEvent) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`flex ${vertical ? 'flex-col' : 'flex-row'} w-full max-w-full [perspective:1400px] ${className}`}
      style={{ gap: `${gap}px`, height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px` }}
      role="list"
      aria-label="Message accordion gallery"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const Tag = (item.link ? 'a' : 'div') as 'a';
        return (
          <Tag
            key={i}
            ref={(el: HTMLElement | null) => {
              panelRefs.current[i] = el;
            }}
            className={`group relative block min-w-0 min-h-0 flex-[1_1_0] cursor-pointer overflow-hidden bg-[#18141f] p-8 no-underline outline-none [transform-style:preserve-3d] [transform-origin:center] transition-colors ${
              isActive ? 'bg-[#211c2a] border-2 border-ember-500/50' : 'bg-[#120f17] border border-ink-800'
            }`}
            style={
              {
                borderRadius: `${radius}px`,
                willChange: 'flex-grow, transform',
                boxShadow: isActive ? '0 20px 40px -15px rgba(249, 115, 22, 0.2)' : 'none'
              } as CSSProperties
            }
            href={item.link || undefined}
            onClick={e => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={e => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={`Message from ${item.sender}`}
          >
            {/* Background subtle watermark icon */}
            <div className="absolute right-4 bottom-4 text-white/[0.03] pointer-events-none">
              <MessageCircle className="w-32 h-32" />
            </div>

            <div
              ref={(el: HTMLElement | null) => {
                contentRefs.current[i] = el;
              }}
              className="relative z-10 flex flex-col h-full justify-between"
            >
              <div>
                {/* Header details */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-inner ${item.avatarColor}`}>
                      {item.avatar === 'A' ? <Shield className="h-4 w-4" /> : item.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-paper-50">{item.sender}</span>
                        {item.tag && (
                          <span className="bg-ember-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-ink-400">{item.time}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-ember-400 bg-ember-500/10 px-2.5 py-1 rounded-full border border-ember-500/20">
                    #{i + 1}
                  </span>
                </div>

                {/* Message text */}
                <p 
                  className="font-medium text-paper-100 leading-relaxed"
                  style={{ fontSize: isActive ? '1.25rem' : '1rem', transition: 'font-size 0.3s ease' }}
                >
                  "{item.message}"
                </p>
              </div>

              {/* Footer status */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-ink-400">
                <span>{isActive ? 'Active live view' : 'Hover to expand'}</span>
                <span className={isActive ? 'text-ember-400 font-bold' : 'text-ink-500'}>
                  {isActive ? '● Expanded' : '○ Minimized'}
                </span>
              </div>
            </div>
          </Tag>
        );
      })}
    </div>
  );
}
