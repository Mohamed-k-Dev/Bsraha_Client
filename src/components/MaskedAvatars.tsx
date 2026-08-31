import React, { useState } from "react";
import { cn } from "@/utils";
import { motion } from "framer-motion";

interface ReactionItem {
  icon: string;
  name: string;
}

export interface MaskedReactionsProps {
  reactions?: ReactionItem[];
  size?: number;
  border?: number;
  column?: number;
  movement?: number;
  transition?: number;
  ringed?: boolean;
  offset?: number;
  blurOnRest?: boolean;
  className?: string;
}

const defaultReactions: ReactionItem[] = [
  { icon: "💀", name: "danger" },
  { icon: "❤️", name: "Heart" },
  { icon: "🔥", name: "Fire" },
  { icon: "😂", name: "Laugh" },
  { icon: "😮", name: "Wow" },
  { icon: "😢", name: "Sad" },
  { icon: "🫡", name: "respect" },
];

export function MaskedAvatars({
  reactions = defaultReactions,
  size = 70,
  border = 0,
  column = 40,
  movement = 0.72,
  transition = 0.18,
  ringed = true,
  offset = -3,
  blurOnRest = true,
  className,
}: MaskedReactionsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { dynamicSize, maskImage } = React.useMemo(() => {
    const dynamicSize = `clamp(${size - 20}px, ${size}px, ${size + 30}px)`;
    const circle = (border * 2 + size) / 2;
    const radX = circle - column - border;
    const maskImage = `radial-gradient(${circle}px ${circle}px at ${radX}px 50%, transparent ${
      circle - 0.5
    }px, white ${circle}px)`;
    return { dynamicSize, maskImage };
  }, [size, border, column]);

  const transitionConfig = React.useMemo(
    () => ({
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    }),
    []
  );

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={
        {
          gap: `min(6vw, ${size * 0.5}px)`,
          "--size": dynamicSize,
        } as React.CSSProperties
      }
      role="group"
      aria-label="Animated reaction group"
    >
      <div className="relative flex items-center justify-center">
        <ul
          className="m-0 p-0 list-none grid grid-flow-col content-end"
          style={{
            height: column,
            gridAutoColumns: column,
            transform: `translateX(${(size - column) * 0.5}px)`,
          }}
          role="list"
        >
          {reactions.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const isPrevHovered = hoveredIndex === index - 1;

            const baseOffset = -size * 1.5;
            const moveOffset = size * movement;

            const maskPosition = isPrevHovered
              ? `0 ${baseOffset - moveOffset}px`
              : isHovered
              ? `0 ${baseOffset + moveOffset}px`
              : `0 ${baseOffset}px`;

            return (
              <motion.li
                key={index}
                className="relative grid content-end outline-none pointer-events-none will-change-transform"
                role="listitem"
                style={{
                  width: dynamicSize,
                  aspectRatio: "1/3",
                  transform: `translate(
                                    ${(size - column) * -0.5}px,
                                    ${(size - column) * 0.5}px
                                )`,
                  zIndex: reactions.length - index,
                }}
                tabIndex={0}
                aria-label={`Reaction ${item.name}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(index)}
              >
                {ringed && (
                  <div
                    className="name absolute left-1/2 text-center uppercase font-mono text-xs font-bold pointer-events-none text-ink-900"
                    aria-hidden="true"
                    style={{
                      width: size,
                      height: size,
                      borderRadius: "50%",
                      bottom: 0,
                      transform: `translate(-50%, ${
                        isHovered ? -movement * 100 : 0
                      }%)`,
                      transition: `transform ${transition}s ease-out`,
                    }}
                  >
                    {item.name.split("").map((char, i) => (
                      <span
                        key={i}
                        className="absolute will-change-transform"
                        style={{
                          offsetPath: "border-box",
                          offsetDistance: `${(offset + i) * 0.75}ch`,
                          offsetAnchor: "50% 130%",
                          transform: isHovered
                            ? "translate(0, 0)"
                            : "translate(0, 100%)",
                          filter: isHovered
                            ? "blur(0px)"
                            : blurOnRest
                            ? "blur(4px)"
                            : "blur(0px)",
                          opacity: isHovered ? 1 : 0,
                          transition: `transform ${transition}s ease-out, opacity ${transition}s ease-out, filter ${transition}s ease-out`,
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                )}

                <div className="avatar-holder absolute inset-0 grid content-end">
                  <motion.span
                    className={cn(
                      "avatar inline-block w-full aspect-square rounded-full relative overflow-hidden pointer-events-auto  bg-paper-100 shadow-sm flex items-center justify-center will-change-transform",
                      "focus:ring-2 focus:ring-offset-2 focus:ring-ember-500"
                    )}
                    role="img"
                    aria-label={item.name}
                    style={{
                      maskImage: index === 0 ? "none" : maskImage,
                      WebkitMaskImage: index === 0 ? "none" : maskImage,
                      maskSize: "100% 400%",
                      WebkitMaskSize: "100% 400%",
                      maskRepeat: "no-repeat",
                    }}
                    animate={{
                      maskPosition: index === 0 ? "0 0" : maskPosition,
                      y: isHovered ? -movement * 100 + "%" : "0%",
                      scale: isHovered ? 1.1 : 1,
                      opacity:
                        hoveredIndex !== null && hoveredIndex !== index
                          ? 0.7
                          : 1,
                    }}
                    transition={transitionConfig}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl select-none">
                      {item.icon}
                    </span>
                  </motion.span>
                </div>

                <div className="absolute bottom-0 w-full aspect-square pointer-events-auto cursor-pointer" />
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default MaskedAvatars;
