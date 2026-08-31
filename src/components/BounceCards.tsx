import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface BounceCardsProps {
  className?: string;
  reactions?: { icon: string; label: string; color: string; count: string }[];
  containerWidth?: number;
  containerHeight?: number;
  animationDelay?: number;
  animationStagger?: number;
  easeType?: string;
  // Base transforms stored as structured offsets for clean GSAP animation
  cardConfigs?: { rotate: number; x: number; y: number }[];
  enableHover?: boolean;
}

export default function BounceCards({
  className = "",
  reactions = [],
  containerWidth = 500,
  containerHeight = 350,
  animationDelay = 0.2,
  animationStagger = 0.08,
  easeType = "elastic.out(1, 0.7)",
  cardConfigs = [
    { rotate: -8, x: -140, y: 10 },
    { rotate: -3, x: -70, y: -20 },
    { rotate: 3, x: 0, y: 15 },
    { rotate: 6, x: 70, y: -10 },
    { rotate: 10, x: 140, y: 20 },
  ],
  enableHover = true,
}: BounceCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      reactions.forEach((_, idx) => {
        const config = cardConfigs[idx] || { rotate: 0, x: 0, y: 0 };
        gsap.fromTo(
          `.card-${idx}`,
          { scale: 0, opacity: 0, y: config.y + 40 },
          {
            scale: 1,
            opacity: 1,
            x: config.x,
            y: config.y,
            rotate: config.rotate,
            stagger: animationStagger,
            ease: easeType,
            delay: animationDelay,
            overwrite: "auto",
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, [reactions, animationDelay, animationStagger, easeType]);

  const pushSiblings = (hoveredIdx: number) => {
    if (!enableHover || !containerRef.current) return;

    reactions.forEach((_, i) => {
      const selector = `.card-${i}`;
      gsap.killTweensOf(selector);

      const base = cardConfigs[i] || { rotate: 0, x: 0, y: 0 };

      if (i === hoveredIdx) {
        // Hovered card pops up straight, scales up, and brings to front
        gsap.to(selector, {
          x: base.x,
          y: base.y - 15,
          rotate: 0,
          scale: 1.15,
          zIndex: 50,
          duration: 0.35,
          ease: "back.out(1.7)",
          overwrite: "auto",
        });
      } else {
        // Sibling cards push away smoothly based on distance from hovered card
        const offsetX = i < hoveredIdx ? -45 : 45;
        const distance = Math.abs(hoveredIdx - i);
        const delay = distance * 0.03;

        gsap.to(selector, {
          x: base.x + offsetX,
          y: base.y,
          rotate: base.rotate,
          scale: 0.96,
          zIndex: 1,
          duration: 0.35,
          ease: "back.out(1.4)",
          delay,
          overwrite: "auto",
        });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return;

    reactions.forEach((_, i) => {
      const selector = `.card-${i}`;
      gsap.killTweensOf(selector);

      const base = cardConfigs[i] || { rotate: 0, x: 0, y: 0 };

      gsap.to(selector, {
        x: base.x,
        y: base.y,
        rotate: base.rotate,
        scale: 1,
        zIndex: i + 1,
        duration: 0.4,
        ease: "back.out(1.4)",
        overwrite: "auto",
      });
    });
  };

  return (
    <div
      className={`relative flex items-center justify-center mx-auto ${className} `}
      ref={containerRef}
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      {reactions.map((item, idx) => {
        const config = cardConfigs[idx] || { rotate: 0, x: 0, y: 0 };
        return (
          <div
            key={idx}
            className={`card card-${idx} absolute w-[130px] sm:w-[150px] aspect-[4/5] bg-white border-4 border-paper-100 rounded-[28px] overflow-hidden shadow-cardLg flex flex-col items-center justify-center p-4 cursor-pointer interactive`}
            style={{
              // Set initial transform via inline styles matching config to avoid initial layout pop
              transform: `translate(${config.x}px, ${config.y}px) rotate(${config.rotate}deg)`,
              zIndex: idx + 1,
            }}
            onMouseEnter={() => pushSiblings(idx)}
            onMouseLeave={resetSiblings}
          >
            <span className="text-4xl sm:text-5xl mb-3 drop-shadow-md">
              {item.icon}
            </span>
            <span
              className={`text-xs font-bold ${item.color} mb-1 uppercase tracking-wider`}
            >
              {item.label}
            </span>
            <span className="text-[11px] font-mono font-semibold text-ink-400 bg-paper-100 px-2 py-0.5 rounded-full">
              {item.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
