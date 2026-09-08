import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
  useInView,
} from "motion/react";
import {
  ArrowRight,
  Shield,
  EyeOff,
  Eye,
  MessageCircle,
  Sparkles,
  Heart,
  Send,
  Bell,
  Search,
  Lock,
  Ban,
  Globe,
  CornerDownRight,
  MousePointer2,
  ShieldCheck,
  Fingerprint,
  LockOpen,
  Flame,
  VenetianMask,
  Sprout,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import StrokeText from "../components/StrokeText";
import FoldText from "../components/FoldText";
import BlurText from "../components/BlurText";
import BorderGlow from "../components/BorderGlow";
import { cn } from "@/utils";
import ShinyText from "@/components/ShinyText";
import { MaskedAvatars } from "@/components/MaskedAvatars";
import Navbar from "@/Ui/Navbar";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Custom Interactive Cursor
// ─────────────────────────────────────────────────────────────────────────────
function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("button, a, .interactive")) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-ember-500 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? "rgba(249, 115, 22, 0.2)" : "transparent",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Magnetic Button Component
// ─────────────────────────────────────────────────────────────────────────────
function MagneticButton({
  children,
  className,
  to,
}: {
  children: React.ReactNode;
  className?: string;
  to?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.4);
    y.set(middleY * 0.4);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center justify-center cursor-pointer interactive",
        className
      )}
    >
      {children}
    </motion.div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Animated Counter Component
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedNumber({ value, label }: { value: number; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center p-6 bg-paper-50 rounded-3xl border border-ink-200 shadow-card"
    >
      <div className="text-4xl md:text-5xl font-display font-black text-ink-900 mb-2">
        {count.toLocaleString()}
        {value > 1000 ? "+" : ""}
      </div>
      <div className="text-sm font-mono text-ink-500 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Border Glow Card Component
// ─────────────────────────────────────────────────────────────────────────────
function BorderGlowCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative p-[2px] rounded-[2rem] overflow-hidden group interactive",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-ember-500 via-amber-400 to-sky-500 opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow" />
      <div className="relative bg-paper-50 p-8 rounded-[1.9rem] h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Drift Wall Section (Streaming Messages)
// ─────────────────────────────────────────────────────────────────────────────
// function DriftWallSection() {
//   const driftMessages = [
//     "I've been pretending to enjoy my job for three years.",
//     "Your words made me call my mother after 2 years of silence.",
//     "I was jealous of your art. I am sorry for my comment.",
//     "The bravest thing someone said to me was without a name.",
//     "I lost my dad last year. That fire reaction was all I could give.",
//     "Thank you for creating the most honest space on the internet.",
//   ];

//   return (
//     <section className="py-24 bg-[#16120c] text-paper-50 overflow-hidden relative">
//       <div className="max-w-6xl mx-auto px-5 text-center mb-12">
//         <h2 className="text-4xl md:text-5xl font-display font-bold">
//           Unfiltered thoughts drifting by in real-time
//         </h2>
//       </div>

//       <div className="flex flex-col gap-6 overflow-hidden py-4">
//         <motion.div
//           animate={{ x: ["0%", "-50%"] }}
//           transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
//           className="flex gap-6 whitespace-nowrap"
//         >
//           {[...driftMessages, ...driftMessages, ...driftMessages].map(
//             (msg, i) => (
//               <div
//                 key={i}
//                 className="bg-[#211b11] border border-[#3f3624] px-8 py-5 rounded-2xl text-paper-100 font-medium text-lg shadow-2xl shrink-0 flex items-center gap-3"
//               >
//                 <span className="h-2.5 w-2.5 rounded-full bg-ember-500 animate-pulse" />
//                 "{msg}"
//               </div>
//             )
//           )}
//         </motion.div>

//         <motion.div
//           animate={{ x: ["-50%", "0%"] }}
//           transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
//           className="flex gap-6 whitespace-nowrap"
//         >
//           {[...driftMessages.reverse(), ...driftMessages, ...driftMessages].map(
//             (msg, i) => (
//               <div
//                 key={i}
//                 className="bg-[#1f1910] border border-[#3f3624] px-8 py-5 rounded-2xl text-paper-300 font-medium text-lg shadow-2xl shrink-0 flex items-center gap-3"
//               >
//                 <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />"{msg}"
//               </div>
//             )
//           )}
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// ─────────────────────────────────────────────────────────────────────────────
// 6. Masonry User Profiles & Stories Grid
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Dummy Data
// ─────────────────────────────────────────────────────────────────────────────
const MESSAGES = [
  {
    id: "1",
    author: "Anonymous",
    isAnon: true,
    avatarColor: "bg-ink-800",
    time: "2h ago",
    text: "I've been pretending to enjoy my corporate job for three years. Today I realized I'm only staying because I'm terrified of failure.",
    likes: 142,
    replies: 12,
  },
  {
    id: "2",
    author: "Lina Okafor",
    isAnon: false,
    avatarColor: "bg-[#c47c2b]",
    time: "5h ago",
    text: "You responded with more grace than I expected. That simple message changed how I view online conversations entirely.",
    likes: 89,
    replies: 4,
  },
  {
    id: "3",
    author: "Anonymous",
    isAnon: true,
    avatarColor: "bg-ember-500",
    time: "6h ago",
    text: "I sent a harsh text years ago and never apologized. Seeing people communicate honestly here finally gave me the courage to fix it.",
    likes: 215,
    replies: 34,
  },
  {
    id: "4",
    author: "Sahar Mirzai",
    isAnon: false,
    avatarColor: "bg-[#8b3a2b]",
    time: "1d ago",
    text: "Building in public is lonely until someone sends an honest note saying 'keep going'. It changes the whole week.",
    likes: 412,
    replies: 28,
  },
  {
    id: "5",
    author: "Anonymous",
    isAnon: true,
    avatarColor: "bg-sky-600",
    time: "1d ago",
    text: "I finally finished the project I was procrastinating on for 6 months. Just wanted to tell someone without bragging.",
    likes: 88,
    replies: 5,
  },
  {
    id: "6",
    author: "Marcus James",
    isAnon: false,
    avatarColor: "bg-emerald-600",
    time: "2d ago",
    text: "This app made me realize how much we filter ourselves to sound 'professional' all the time. It's exhausting.",
    likes: 156,
    replies: 19,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Message Card Component (Now with BorderGlow)
// ─────────────────────────────────────────────────────────────────────────────
function MessageCard({ msg }: { msg: (typeof MESSAGES)[0] }) {
  return (
    <BorderGlow
      className="w-[350px] md:w-[420px] flex-shrink-0 p-6  hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full"
      backgroundColor="#ffffff"
      glowColor="25 95 50" // Ember HSL equivalent
      colors={["#f97316", "#f59e0b", "#0ea5e9"]} // Ember, Amber, Sky
      borderRadius={32}
      edgeSensitivity={40}
    >
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-inner text-sm",
                msg.avatarColor
              )}
            >
              {msg.isAnon ? (
                <Shield className="h-4 w-4" />
              ) : (
                msg.author.charAt(0)
              )}
            </div>
            <div>
              <h4 className="font-bold text-ink-900 text-sm flex items-center gap-2">
                {msg.author}
                {msg.isAnon && (
                  <span className="bg-ink-100 text-ink-600 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                    Anon
                  </span>
                )}
              </h4>
              <p className="text-xs font-mono text-ink-400">{msg.time}</p>
            </div>
          </div>
          <p className="text-ink-800 font-medium text-base leading-relaxed mb-6">
            "{msg.text}"
          </p>
        </div>
        <div className="flex items-center gap-4 pt-4 border-t border-ink-100 text-ink-500 mt-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold group-hover:text-rose-500 transition-colors">
            <Heart className="h-4 w-4" /> {msg.likes}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold group-hover:text-sky-500 transition-colors">
            <MessageCircle className="h-4 w-4" /> {msg.replies}
          </div>
        </div>
      </div>
    </BorderGlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Marquee Row Component
// ─────────────────────────────────────────────────────────────────────────────
function MarqueeRow({
  items,
  direction = "left",
  speed = 40,
}: {
  items: typeof MESSAGES;
  direction?: "left" | "right";
  speed?: number;
}) {
  // Duplicate items to create a seamless infinite loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="relative flex w-full overflow-visible py-6 group">
      <motion.div
        className="flex gap-6 w-max"
        animate={{
          x: direction === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"],
        }}
        transition={{
          ease: "linear",
          duration: speed,
          repeat: Infinity,
        }}
        // Pause animation when the user hovers over the row
        whileHover={{ animationPlayState: "paused" }}
      >
        {duplicatedItems.map((msg, idx) => (
          <motion.div
            key={`${msg.id}-${idx}`}
            whileHover={{
              scale: 1.05,
              zIndex: 50,
              rotate: idx % 2 === 0 ? 1 : -1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative flex"
          >
            <MessageCard msg={msg} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Section Component
// ─────────────────────────────────────────────────────────────────────────────
export function MasonryUsersSection() {
  return (
    <section className="py-32 bg-[#fdfcf9] text-ink-900 relative overflow-hidden border-y border-ink-200">
      {/* Background radial gradient to give depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-ember-100/40 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-ember-500 font-mono text-sm tracking-widest uppercase mb-4 block">
            04. The Honest Feed
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-ink-900">
            A stream of unspoken truths.
          </h2>
          <p className="text-xl text-ink-600 max-w-2xl mx-auto">
            Explore authentic thoughts flowing through the network. Hover over
            any message to pause the stream and read.
          </p>
        </div>
      </div>

      {/* Marquee Container with Gradient Mask for fading edges */}
      <div
        className="relative w-full flex flex-col gap-4 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        {/* Row 1: Normal speed, going left */}
        <MarqueeRow items={MESSAGES} direction="left" speed={45} />

        {/* Row 2: Reverse direction, slightly offset data, slightly faster */}
        <MarqueeRow
          items={[...MESSAGES].reverse()}
          direction="right"
          speed={55}
        />

        {/* Row 3: Scrambled data, going left, slower */}
        <MarqueeRow
          items={[...MESSAGES?.slice(3), ...MESSAGES?.slice(0, 3)]}
          direction="left"
          speed={65}
        />
      </div>
    </section>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// 7. Scroll Expand Section
// ─────────────────────────────────────────────────────────────────────────────
function ScrollExpandSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const width = useTransform(scrollYProgress, [0.1, 0.6], ["60%", "100%"]);
  const borderRadius = useTransform(
    scrollYProgress,
    [0.1, 0.6],
    ["2rem", "0rem"]
  );

  return (
    <section ref={ref} className="py-20 flex justify-center">
      <motion.div
        style={{ width, borderRadius }}
        className="bg-gradient-to-br from-[#100c07] to-[#1f1910] text-paper-50 py-32 px-8 md:px-20 text-center overflow-hidden shadow-2xl"
      >
        <span className="text-ember-400 font-mono text-sm tracking-widest uppercase mb-4 block">
          Scroll Expand Experience
        </span>
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
          Designed for depth, <br />
          not just scrolling.
        </h2>
        <p className="text-xl text-paper-300 max-w-2xl mx-auto font-light leading-relaxed">
          Every interaction on Bsraha is crafted to make you feel closer to the
          truth. No distractions, no algorithmic noise—just pure, human
          connection.
        </p>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW SECTIONS FOR THE 16 IDEAS
// ─────────────────────────────────────────────────────────────────────────────

// Idea 3: How Bsraha Works
function HowItWorksSection() {
  return (
    <section className="py-32 px-5 w-9/12 mx-auto ">
      <div className="text-center mb-20">
        <h2 className="text-5xl font-display font-bold mb-6 text-ink-900">
          How it works
        </h2>
        <p className="text-xl text-ink-600">
          Three simple steps to honest conversations.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            step: "01",
            title: "Find someone",
            desc: "Search for a friend, creator, or colleague using their username or display name.",
            icon: <Search className="h-8 w-8 text-sky-500" />,
          },
          {
            step: "02",
            title: "Write honestly",
            desc: "Type your message and choose your mask: show your real identity or stay completely anonymous.",
            icon: <MessageCircle className="h-8 w-8 text-ember-500" />,
          },
          {
            step: "03",
            title: "Start a conversation",
            desc: "They receive your message and can reply directly, sparking an ongoing thread.",
            icon: <Sparkles className="h-8 w-8 text-amber-500" />,
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.2 }}
            className="h-full"
          >
            <BorderGlow
              className="flex flex-col items-center text-center p-10 h-full shadow-card w-full"
              backgroundColor="#ffffff"
              glowColor="25 95 50" /* Ember HSL equivalent */
              colors={["#f97316", "#f59e0b"]} /* Ember, Amber, Sky */
              borderRadius={32}
              edgeSensitivity={40}
            >
              <div className="h-16 w-full  rounded-full flex items-center justify-center mb-6 z-10">
                {item.icon}
              </div>
              <span className="text-ember-500 font-mono font-bold text-lg mb-2 z-10">
                {item.step}
              </span>
              <h3 className="text-2xl font-bold text-ink-900 mb-4 z-10">
                {item.title}
              </h3>
              <p className="text-ink-600 font-medium z-10">{item.desc}</p>
            </BorderGlow>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
// Idea 6 & 7 & 8: Public Messages, Profile & Visibility Control
export function PublicControlSection() {
  const [isPublished, setIsPublished] = useState(true);
  const [showReplies, setShowReplies] = useState(true);

  return (
    <section className="py-32 px-5 bg-ink-900 text-paper-50 overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Controls Column */}
        <div>
          <span className="text-sky-400 font-mono text-sm tracking-widest uppercase mb-4 block">
            Public Profiles & Control
          </span>
          <h2 className="text-5xl font-display font-bold mb-6">
            Your words. Your profile.
          </h2>
          <p className="text-xl text-paper-300 mb-8 leading-relaxed">
            Some messages deserve to be heard by everyone. Publish the best
            truths to your public profile.
            <strong> You control what becomes public.</strong> Toggle visibility
            and control replies dynamically.
          </p>
          <div className="flex flex-col gap-4">
            {/* Toggle 1: Publish Message */}
            <div
              onClick={() => setIsPublished(!isPublished)}
              className="flex items-center justify-between p-4 bg-ink-800 rounded-xl border border-ink-700 cursor-pointer select-none transition-colors hover:border-ink-600"
            >
              <span className="font-bold text-lg">Publish Message</span>
              <div
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                  isPublished ? "bg-ember-500" : "bg-ink-600"
                }`}
              >
                <motion.div
                  layout
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  animate={{ left: isPublished ? "26px" : "4px" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </div>

            {/* Toggle 2: Show Replies Publicly */}
            <div
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center justify-between p-4 bg-ink-800 rounded-xl border border-ink-700 cursor-pointer select-none transition-colors hover:border-ink-600"
            >
              <span className="font-bold text-lg">Show Replies Publicly</span>
              <div
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                  showReplies ? "bg-ember-500" : "bg-ink-600"
                }`}
              >
                <motion.div
                  layout
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  animate={{ left: showReplies ? "26px" : "4px" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white text-ink-900 p-8 rounded-[2rem] shadow-2xl relative h-[420px] flex flex-col justify-between"
        >
          <div className="absolute -top-6 -right-6 bg-sky-500 text-white p-4 rounded-full shadow-lg transform rotate-12">
            <Globe className="h-8 w-8" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-ink-100">
              <div className="h-12 w-12 bg-gradient-to-br from-ember-400 to-amber-500 rounded-full flex items-center justify-center text-xl text-white font-bold shadow-md">
                A
              </div>
              <div>
                <h3 className="font-bold text-lg">Ahmed's Public Profile</h3>
                <p className="text-xs font-mono text-ink-400">
                  @ahmed • Live Feed
                </p>
              </div>
            </div>

            {/* Root Published Message with AnimatePresence for show/disappear */}
            <AnimatePresence>
              {isPublished && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 bg-paper-50 rounded-2xl border border-ink-200 mb-4 shadow-sm">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-ink-500 mb-1">
                      <Shield className="h-3 w-3" /> Anonymous Message
                    </div>
                    <p className="font-bold text-lg mb-3 text-ink-900">
                      "You're more capable than you think. Don't stop building."
                    </p>

                    {/* Replies Container (Muted vs Normal vs Hidden) */}
                    <motion.div
                      animate={{
                        opacity: showReplies ? 1 : 0.35,
                        filter: showReplies
                          ? "grayscale(0%)"
                          : "grayscale(100%)",
                      }}
                      transition={{ duration: 0.3 }}
                      className="pl-4 border-l-2 border-ember-400 mt-4 space-y-3"
                    >
                      <div className="text-xs">
                        <span className="font-bold text-ember-600">
                          Ahmed (You):
                        </span>
                        <span className="text-ink-700 ml-1">
                          Thank you, this means everything right now.
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-ink-500">
                          Anonymous:
                        </span>
                        <span className="text-ink-700 ml-1">
                          We see the hard work behind the scenes.
                        </span>
                      </div>
                    </motion.div>

                    <div className="flex justify-between items-center text-xs font-mono text-ink-400 pt-4 mt-4 border-t border-ink-100">
                      <span>❤️ 24 Reactions</span>
                      <span
                        className={
                          showReplies
                            ? "text-emerald-600 font-bold"
                            : "text-amber-600 font-bold"
                        }
                      >
                        {showReplies
                          ? "Replies Public: ON"
                          : "Replies Public: MUTED"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State if Unpublished */}
            {!isPublished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center text-ink-400 font-mono text-sm border-2 border-dashed border-ink-200 rounded-2xl"
              >
                🔒 Message is currently private. Turn on "Publish Message" to
                show it on your profile.
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
// Idea 10: Notifications
export function NotificationsSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const FLIP_WORDS = [
    "Never miss",
    "Stay notified of",
    "Keep track of",
    "Always know",
  ];
  // Flip word animation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % FLIP_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 px-5 bg-paper-100 relative overflow-hidden border-t border-ink-200">
      <div className="max-w-6xl mx-auto">
        {/* Header with Flip Text Animation */}
        <div className="text-center mb-16">
          <span className="text-ember-500 font-mono text-sm tracking-widest uppercase mb-4 block">
            05. Live Alerts
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-ink-900 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex h-[1.2em] overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="inline-block text-ember-600"
                >
                  {FLIP_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <span>what people have to say.</span>
          </h2>
          <p className="text-xl text-ink-600 max-w-2xl mx-auto mt-4">
            Real-time pushes and organized activity logs ensure you never lose
            track of an honest thought.
          </p>
        </div>

        {/* Dynamic Multi-layered Notification Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Interactive Notification Card Stack */}
          <div className="lg:col-span-7 relative min-h-[380px] flex items-center justify-center">
            {/* Background Decorative Blur Card */}
            <div className="absolute w-[90%] h-full bg-ember-100/55 rounded-[2.5rem] transform -rotate-2 scale-95 border border-ember-200" />

            {/* Main Interactive Push Notification Simulation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="relative z-10 bg-white border border-ink-200 shadow-2xl rounded-3xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-ember-500 text-white rounded-2xl flex items-center justify-center shadow-md">
                    <Bell className="h-5 w-5 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink-900 text-sm">
                      New Honest Reply
                    </h4>
                    <p className="text-xs text-ink-400 font-mono">
                      Just now • Bsraha Alert
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Live Feed
                </span>
              </div>

              {/* Notification Body Content */}
              <div className="bg-paper-50 p-4 rounded-2xl border border-ink-100 space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-ink-900 text-white flex items-center justify-center text-[10px] font-bold">
                    <Shield className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-bold text-ink-900">
                    Anonymous replied to your thread
                  </span>
                </div>
                <p className="text-sm font-medium text-ink-800 italic pl-8">
                  "This completely shifted how I view my workflow. Thank you for
                  sharing."
                </p>
              </div>

              {/* Action Buttons inside notification */}
              <div className="flex items-center gap-3">
                <button className="flex-1 bg-ink-900 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-ink-800 transition-colors">
                  <CornerDownRight className="h-3.5 w-3.5" /> Reply Back
                </button>
                <button className="px-4 py-2.5 bg-paper-100 text-ink-700 rounded-xl font-bold text-xs hover:bg-paper-200 transition-colors">
                  <Heart className="h-3.5 w-3.5 inline text-rose-500 mr-1" />{" "}
                  Like
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right: Feature Highlights */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl border border-ink-200 shadow-sm">
              <h3 className="font-bold text-lg text-ink-900 mb-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-ember-500" />{" "}
                Instant Push Delivery
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                Get notified instantly when someone leaves a message, adds a
                reaction, or continues your nested thread.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-ink-200 shadow-sm">
              <h3 className="font-bold text-lg text-ink-900 mb-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Smart
                Summary Ticker
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                Filter out noise with customizable alerts. Choose whether to
                show identities or remain entirely anonymous on updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Idea 12 & 13: Privacy, Security, Block & Report
// ─────────────────────────────────────────────────────────────────────────────
// Interactive Card 1: Identity Masking
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Shared Visual Toggle (Reacts to Hover State)
// ─────────────────────────────────────────────────────────────────────────────
function VisualToggle({
  checked,
  label,
  color = "bg-ember-500",
}: {
  checked: boolean;
  label: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between w-full bg-paper-50 border border-ink-100 px-4 py-2.5 rounded-xl z-10 relative">
      <span className="text-sm font-bold text-ink-900">{label}</span>
      <div
        className={cn(
          "w-10 h-6 rounded-full relative transition-colors duration-300",
          checked ? color : "bg-ink-200"
        )}
      >
        <motion.div
          layout
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
          animate={{ left: checked ? "22px" : "4px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Absolute Anonymity
// ─────────────────────────────────────────────────────────────────────────────
function AnonymityCard() {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="col-span-1 bg-white border border-ink-200 px-5 py-2 rounded-3xl shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col h-30 cursor-default w-1/4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <VisualToggle
        checked={isHovered}
        label="Absolute Anonymity"
        color="bg-sky-500"
      />
      <div className="flex-1 flex items-center justify-center mt-4">
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.div
              key="real"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="h-16 w-16 bg-gradient-to-br from-amber-400 to-ember-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 shadow-md">
                A
              </div>
              <span className="font-bold text-ink-900">Ahmed M.</span>
            </motion.div>
          ) : (
            <motion.div
              key="anon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="h-16 w-16 bg-sky-50 border border-sky-200 rounded-full flex items-center justify-center text-sky-500 mb-3">
                <EyeOff className="h-8 w-8" />
              </div>
              <span className="font-bold text-sky-600">Anonymous</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. End-to-End Encrypted
// ─────────────────────────────────────────────────────────────────────────────
function EncryptionCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [cipherText, setCipherText] = useState("Hey, I wanted to tell you...");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      let ticks = 0;
      interval = setInterval(() => {
        setCipherText(
          Array.from({ length: 28 })
            .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
            .join("")
        );
        ticks++;
        if (ticks > 6) {
          clearInterval(interval);
          setCipherText("0x9F4A... E2E_LOCKED_PAYLOAD");
        }
      }, 50);
    } else {
      setCipherText("Hey, I wanted to tell you...");
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div
      className="col-span-1 bg-white border border-ink-200 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col h-full cursor-default w-1/4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <VisualToggle
        checked={isHovered}
        label="E2E Encrypted"
        color="bg-emerald-500"
      />
      <div className="flex-1 flex flex-col items-center justify-center mt-4 w-full">
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4"
            >
              <LockOpen className="h-8 w-8 text-ink-400" />
            </motion.div>
          ) : (
            <motion.div
              key="closed"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4"
            >
              <Lock className="h-8 w-8 text-emerald-500" />
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className={cn(
            "w-full px-3 py-2 rounded-lg font-mono text-[10px] sm:text-xs text-center transition-colors duration-300 break-all",
            isHovered
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-paper-50 text-ink-600 border border-ink-200"
          )}
        >
          {cipherText}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Publish Control
// ─────────────────────────────────────────────────────────────────────────────
function PublishCard() {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="col-span-1 bg-white border border-ink-200 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:border-ember-300 transition-all duration-300 flex flex-col h-full cursor-default w-2/4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <VisualToggle
        checked={isHovered}
        label="Publish Control"
        color="bg-ember-500"
      />
      <div className="flex-1 flex flex-col justify-center mt-4">
        <motion.div
          layout
          className={cn(
            "p-4 rounded-2xl border transition-colors duration-300",
            isHovered
              ? "bg-ember-50 border-ember-200"
              : "bg-paper-50 border-ink-200"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            {isHovered ? (
              <Globe className="h-4 w-4 text-ember-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-ink-400" />
            )}
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isHovered ? "text-ember-600" : "text-ink-400"
              )}
            >
              {isHovered ? "Live on Profile" : "Hidden in Inbox"}
            </span>
          </div>
          <p className="text-ink-900 font-medium text-xs leading-relaxed">
            "This is the most honest thing anyone has ever sent me."
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Show Replies
// ─────────────────────────────────────────────────────────────────────────────
function RepliesCard() {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="col-span-1 bg-white border border-ink-200 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col h-full cursor-default w-2/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <VisualToggle
        checked={isHovered}
        label="Show Replies"
        color="bg-blue-500"
      />
      <div className="flex-1 flex flex-col justify-end mt-4 bg-paper-50 border border-ink-200 p-3 rounded-xl">
        <p className="font-bold text-xs text-ink-900 border-b border-ink-200 pb-2">
          "This project is amazing."
        </p>
        <div className="min-h-[50px] flex flex-col justify-end">
          <AnimatePresence mode="wait">
            {isHovered ? (
              <motion.div
                key="on"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 space-y-2"
              >
                <div className="text-[10px] bg-white p-2 rounded-lg border border-ink-100 flex items-center gap-2">
                  <MessageCircle className="h-3 w-3 text-blue-500" /> "Keep
                  building."
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="off"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-2"
              >
                <span className="text-[10px] font-bold text-ink-400 bg-ink-100 px-2 py-1 rounded-full flex items-center gap-1.5 w-fit">
                  <Ban className="h-3 w-3" /> Replies disabled
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Scramble IP
// ─────────────────────────────────────────────────────────────────────────────
function FootprintCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [ipText, setIpText] = useState("IP: 192.168.1.4");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered) {
      let ticks = 0;
      interval = setInterval(() => {
        setIpText(
          "IP: " +
            Array.from({ length: 11 })
              .map(() => Math.floor(Math.random() * 10))
              .join(".")
              .slice(0, 11)
        );
        ticks++;
        if (ticks > 8) {
          clearInterval(interval);
          setIpText("IP: [PURGED]");
        }
      }, 50);
    } else {
      setIpText("IP: 192.168.1.4");
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div
      className="col-span-1 bg-white border border-ink-200 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:border-violet-300 transition-all duration-300 flex flex-col h-[200px] cursor-default w-1/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <VisualToggle
        checked={isHovered}
        label="Scramble IP"
        color="bg-violet-500"
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-3 mt-4">
        <Fingerprint
          className={cn(
            "h-10 w-10 transition-colors duration-300",
            isHovered ? "text-violet-500" : "text-ink-300"
          )}
        />
        <span
          className={cn(
            "font-mono font-bold text-xs transition-all duration-300 px-3 py-1.5 rounded-lg",
            isHovered
              ? "text-violet-600 bg-violet-50"
              : "text-ink-500 bg-paper-50"
          )}
        >
          {ipText}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Burn Message (Takes 2 Columns)
// ─────────────────────────────────────────────────────────────────────────────
function DestructCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="col-span-1 md:col-span-2 bg-white h-[200px] border border-ink-200 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 flex flex-col cursor-default w-2/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <VisualToggle
        checked={isHovered}
        label="Burn Message"
        color="bg-rose-500"
      />
      <div className="flex-1 flex items-center justify-center mt-4 overflow-hidden relative ">
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.div
              key="msg"
              exit={{ scale: 0.5, opacity: 0, y: 20, filter: "blur(10px)" }}
              transition={{ duration: 0.4 }}
              className="bg-paper-50 border border-ink-200 p-5 rounded-xl text-sm font-medium text-ink-900 w-full shadow-sm max-w-sm text-center relative z-10"
            >
              "Some secrets are better left unsaid. Delete this when you read
              it."
            </motion.div>
          ) : (
            <motion.div
              key="ash"
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col items-center text-rose-500 relative z-10"
            >
              <Flame className="h-12 w-12 mb-2 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Incinerated permanently
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative Background Flames when hovered */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent pointer-events-none rounded-xl"
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Security Section Layout
// ─────────────────────────────────────────────────────────────────────────────
export function SecuritySection() {
  return (
    <section className="py-32 px-4 md:px-8 bg-[#fdfcf9] text-ink-900 relative overflow-hidden border-t border-ink-200">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-ember-500 font-mono text-sm tracking-widest uppercase mb-4 block">
            05. The Privacy Vault
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-ink-900 flex items-center justify-center gap-3">
            <Lock className="h-10 w-10 md:h-12 md:w-12 text-ember-500" />
            You hold the keys.
          </h2>
          <p className="text-xl text-ink-600 max-w-2xl mx-auto mb-10">
            We built our architecture on the principle of absolute control.{" "}
            <strong className="text-ink-900">
              Hover over the modules below
            </strong>{" "}
            to see exactly how we protect your boundaries.
          </p>
        </div>

        {/* 2-Row Grid (7 Boxes total) */}
        <div className="  mb-3">
          {/* ROW 1: 4 Boxes */}
          <div className="flex gap-4">
            <EncryptionCard />
            <PublishCard />
            <AnonymityCard />
          </div>

          {/* ROW 2: 3 Boxes (Last one spans 2 columns) */}
          <div className="flex gap-4 mt-4">
            <DestructCard />
            <FootprintCard />
            <RepliesCard />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Security Section
// ─────────────────────────────────────────────────────────────────────────────

// Idea 14: The Experience Section (Interactive Mock Conversation)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export function InteractiveExperienceSection() {
  return (
    <section className="py-32 px-4 md:px-8 bg-[#fdfcf9] w-full overflow-hidden border-y border-ink-200">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <span className="text-ember-500 font-mono text-sm tracking-widest uppercase mb-4 block">
            The Experience
          </span>
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 text-ink-900">
            A space for honest words.
          </h2>
          <p className="text-xl text-ink-600 max-w-2xl mx-auto">
            Watch exactly how messages, threads, and controls work in real-time.
          </p>
        </div>

        {/* Bento Grid with Fixed Heights to prevent animation layout jumps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* BOX 1: Sending a Message (Span 8) */}
          <div className="lg:col-span-8 h-[450px]">
            <SimulationSend />
          </div>

          {/* BOX 2 (Now Publish): Publishing & Visibility Control (Span 4) */}
          <div className="lg:col-span-4 h-[450px]">
            <SimulationPublish />
          </div>

          {/* BOX 3: Reacting (Span 4) - Moved up to balance the grid */}
          <div className="lg:col-span-4 h-[320px]">
            <SimulationReact />
          </div>

          {/* BOX 4 (Now Reply): Replying to a Message (Span 8 - Wider Box) */}
          <div className="lg:col-span-8 h-[330px]">
            <SimulationReply />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation Box 1: Sending a Message
// ─────────────────────────────────────────────────────────────────────────────
function SimulationSend() {
  const fullText = "I've always admired your work ethic.";
  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState(0);
  // 0: idle, 1: typing, 2: identity toggled, 3: sending, 4: sent

  useEffect(() => {
    let typeInterval: NodeJS.Timeout;
    let t1: NodeJS.Timeout,
      t2: NodeJS.Timeout,
      t3: NodeJS.Timeout,
      t4: NodeJS.Timeout;

    const run = () => {
      setPhase(0);
      setTypedText("");

      // Start typing after 1 second
      t1 = setTimeout(() => {
        setPhase(1);
        let i = 0;
        typeInterval = setInterval(() => {
          setTypedText(fullText.slice(0, i + 1));
          i++;
          if (i >= fullText.length) clearInterval(typeInterval);
        }, 50);
      }, 1000);

      // Toggle Identity
      t2 = setTimeout(() => setPhase(2), 4000);
      // Click Send
      t3 = setTimeout(() => setPhase(3), 5500);
      // Sent Success
      t4 = setTimeout(() => setPhase(4), 6500);

      // Loop
      setTimeout(run, 9500);
    };

    run();
    return () => {
      clearInterval(typeInterval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="bg-white border border-ink-200 shadow-xl rounded-[2rem] p-6 md:p-8 h-full flex flex-col relative overflow-hidden">
      <span className="absolute top-6 right-6 text-xs font-mono font-bold text-ink-400 uppercase tracking-widest bg-paper-100 px-3 py-1 rounded-full">
        1. Send
      </span>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 bg-gradient-to-br from-amber-400 to-ember-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
          M
        </div>
        <div>
          <h3 className="font-bold text-lg text-ink-900">Send to Mohamed</h3>
          <p className="text-sm text-ink-500 font-mono">mohamed@Bsraha</p>
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {phase < 4 ? (
            <motion.div
              key="composing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              <div className="w-full flex-1 min-h-[140px] bg-paper-50 rounded-2xl border border-ink-100 p-4 relative mb-4">
                <span
                  className={`text-lg transition-opacity ${
                    typedText.length > 0
                      ? "text-ink-900"
                      : "opacity-40 text-ink-400"
                  }`}
                >
                  {typedText.length > 0
                    ? typedText
                    : "Write an honest message..."}
                </span>
                {phase < 3 && (
                  <motion.div
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-0.5 h-5 bg-ember-500 ml-1 translate-y-1"
                  />
                )}
              </div>

              <div className="flex items-center justify-between">
                {/* Real Identity Toggle */}
                <div className="flex bg-paper-100 p-1 rounded-full relative w-64">
                  <motion.div
                    layout
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm"
                    animate={{ left: phase >= 2 ? "50%" : "4px" }}
                  />
                  <div
                    className={`flex-1 text-center py-2 text-xs font-bold z-10 transition-colors ${
                      phase < 2 ? "text-ink-900" : "text-ink-400"
                    }`}
                  >
                    <Shield className="inline h-3 w-3 mr-1" /> Anonymous
                  </div>
                  <div
                    className={`flex-1 text-center py-2 text-xs font-bold z-10 transition-colors ${
                      phase >= 2 ? "text-ink-900" : "text-ink-400"
                    }`}
                  >
                    <Eye className="inline h-3 w-3 mr-1" /> Justin Mason
                  </div>
                </div>

                <button
                  className={`px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-colors ${
                    phase === 3
                      ? "bg-ember-300 text-white"
                      : "bg-ember-500 text-white"
                  }`}
                >
                  {phase === 3 ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white z-10"
            >
              <div className="h-16 w-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-display font-bold text-2xl text-ink-900 mb-2">
                Message Sent
              </h3>
              <p className="text-ink-500">
                Mohamed will receive this from <br />
                <strong className="text-ink-900">Justin Mason</strong>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation Box 4 (Wider Box): Replying in Thread
// ─────────────────────────────────────────────────────────────────────────────
function SimulationReply() {
  const replyText =
    "I agree! Threads like this are the reason I open this app.";
  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState(0);
  // 0: idle, 1: cursor hovers reply, 2: input opens, 3: typing, 4: sent

  useEffect(() => {
    let typeInterval: NodeJS.Timeout;
    let t1: NodeJS.Timeout,
      t2: NodeJS.Timeout,
      t3: NodeJS.Timeout,
      t4: NodeJS.Timeout;

    const run = () => {
      setPhase(0);
      setTypedText("");

      t1 = setTimeout(() => setPhase(1), 1000); // hover reply
      t2 = setTimeout(() => setPhase(2), 2500); // click reply, input appears
      t3 = setTimeout(() => {
        setPhase(3);
        let i = 0;
        typeInterval = setInterval(() => {
          setTypedText(replyText.slice(0, i + 1));
          i++;
          if (i >= replyText.length) clearInterval(typeInterval);
        }, 30);
      }, 3500); // start typing

      t4 = setTimeout(() => setPhase(4), 6000); // click send -> nested reply appears
      setTimeout(run, 9000);
    };
    run();
    return () => {
      clearInterval(typeInterval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="bg-white border border-ink-200 shadow-xl rounded-[2rem] p-6 md:p-8 h-full flex flex-col relative overflow-hidden">
      <span className="absolute top-6 right-6 text-xs font-mono font-bold text-ink-400 uppercase tracking-widest bg-paper-100 px-3 py-1 rounded-full z-10">
        2. Reply
      </span>

      <div className="flex-1 flex flex-col">
        {/* Parent Thread Message */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 bg-[#c47c2b] text-white rounded-full flex items-center justify-center font-bold text-[10px]">
              LO
            </div>
            <span className="font-bold text-ink-900 text-sm">Lina Okafor</span>
            <span className="text-xs font-mono text-ink-400">2h ago</span>
          </div>
          <p className="text-ink-800 font-medium">
            You responded with more grace than I would have. That is why I wrote
            to you.
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              <ReactionPill icon="❤️" count="34" active />
              <ReactionPill icon="😮" count="5" />
            </div>
            <div className="flex items-center gap-3 text-ink-400 relative">
              {/* Ghost Cursor interacting with Reply */}
              <motion.div
                animate={{
                  opacity: phase >= 1 && phase < 2 ? 1 : 0,
                  scale: phase === 2 ? 0.8 : 1,
                  x: phase >= 1 ? 0 : 30,
                  y: phase >= 1 ? 0 : 30,
                }}
                className="absolute -left-3 top-2 pointer-events-none z-20"
              >
                <MousePointer2 className="h-5 w-5 text-ink-900 fill-white" />
              </motion.div>

              <button
                className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                  phase >= 1 && phase < 2
                    ? "text-ember-500"
                    : "hover:text-ink-900"
                }`}
              >
                <CornerDownRight className="h-3.5 w-3.5" /> Reply
              </button>
            </div>
          </div>
        </div>

        {/* Existing Nested Thread OR Input Box */}
        <div className="pl-6 md:pl-8 border-l-2 border-ember-400 relative flex-1 flex flex-col">
          <AnimatePresence mode="popLayout">
            {phase < 2 && (
              <motion.div
                key="existing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 bg-[#8b3a2b] text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                    SM
                  </div>
                  <span className="font-bold text-ink-900 text-sm">
                    Sahar Mirzai
                  </span>
                  <span className="text-xs font-mono text-ink-400">1h ago</span>
                </div>
                <p className="text-ink-800">
                  This thread is making me reconsider everything.
                </p>
              </motion.div>
            )}

            {phase >= 2 && phase < 4 && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex flex-col gap-3"
              >
                <div className="bg-paper-50 border-[1.5px] border-ember-300 rounded-xl p-3 min-h-[80px] text-sm relative">
                  <span className={typedText ? "text-ink-900" : "text-ink-400"}>
                    {typedText || "Write a reply..."}
                  </span>
                  <motion.div
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-0.5 h-4 bg-ember-500 ml-1 translate-y-1"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-ink-500 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Anon
                  </span>
                  <button className="bg-[#fdb082] text-white px-5 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                    <Send className="h-3.5 w-3.5" /> Reply
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 4 && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 bg-ink-800 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                    <Shield className="h-3 w-3" />
                  </div>
                  <span className="font-bold text-ink-900 text-sm">
                    Anonymous
                  </span>
                  <span className="bg-ink-900 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                    Anon
                  </span>
                  <span className="text-xs font-mono text-ink-400">
                    Just now
                  </span>
                </div>
                <p className="text-ink-900 font-medium">{replyText}</p>
                <div className="flex items-center mt-3">
                  <ReactionPill icon="⚪" count="0" empty />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation Box 3: Reacting (Confused Cursor, White BG)
// ─────────────────────────────────────────────────────────────────────────────
function SimulationReact() {
  const [activeReaction, setActiveReaction] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 150, y: 150, scale: 1 });

  useEffect(() => {
    let t1: NodeJS.Timeout,
      t2: NodeJS.Timeout,
      t3: NodeJS.Timeout,
      t4: NodeJS.Timeout;
    const run = () => {
      setActiveReaction(null);
      setCursorPos({ x: 150, y: 150, scale: 1 }); // Start outside

      // Move to Reaction 1 (😮) but don't click
      t1 = setTimeout(() => setCursorPos({ x: 95, y: -5, scale: 1 }), 1000);

      // Move to Reaction 2 (❤️) but don't click
      t2 = setTimeout(() => setCursorPos({ x: 30, y: -5, scale: 1 }), 2500);

      // Move to Reaction 3 (🔥) and click
      t3 = setTimeout(() => {
        setCursorPos({ x: 150, y: -5, scale: 0.8 }); // Click scale down
        setActiveReaction(3); // Set 🔥 active
      }, 4000);

      // Release click and move away
      t4 = setTimeout(() => {
        setCursorPos({ x: 200, y: 50, scale: 1 });
      }, 4300);

      setTimeout(run, 7000);
    };
    run();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="bg-white border border-ink-200 shadow-xl rounded-[2rem] p-6 h-full flex flex-col relative overflow-hidden">
      <span className="absolute top-6 right-6 text-xs font-mono font-bold text-ink-400 uppercase tracking-widest bg-paper-100 px-3 py-1 rounded-full z-10">
        3. React
      </span>

      <div className="flex-1 flex flex-col justify-center gap-6 mt-4">
        {/* Parent Message */}
        <div>
          <p className="text-ink-900 font-medium text-lg mb-4">
            "This app changed how I talk to my friends."
          </p>
          <div className="flex gap-2 relative">
            {/* Reactions Container relative to cursor positioning */}
            <div className="flex gap-2 relative">
              <ReactionPill icon="❤️" count="124" />
              <ReactionPill icon="😮" count="8" />
              <ReactionPill
                icon="🔥"
                count={activeReaction === 3 ? "43" : "42"}
                active={activeReaction === 3}
              />

              {/* Ghost Cursor */}
              <motion.div
                animate={{
                  x: cursorPos.x,
                  y: cursorPos.y,
                  scale: cursorPos.scale,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="absolute top-0 left-0 z-20 pointer-events-none"
              >
                <MousePointer2 className="h-5 w-5 text-ink-900 fill-white" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Reply Message */}
        <div className="pl-6 border-l-2 border-ember-500">
          <p className="text-ink-800 font-medium mb-3">
            "Totally agree. It feels safe."
          </p>
          <div className="flex gap-2 relative">
            <ReactionPill icon="❤️" count="1" />
            <ReactionPill icon="⚪" count="0" empty />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation Box 2: Publishing & Visibility (Span 4 now, Stacked layout)
// ─────────────────────────────────────────────────────────────────────────────
function SimulationPublish() {
  const [showReplies, setShowReplies] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowReplies((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-ink-200 shadow-xl rounded-[2rem] p-6 h-full flex flex-col relative overflow-hidden">
      <span className="absolute top-6 right-6 text-xs font-mono font-bold text-ink-400 uppercase tracking-widest bg-paper-100 px-3 py-1 rounded-full z-10">
        4. Publish
      </span>

      {/* Control Panel */}
      <div className="border-b border-ink-100 pb-4 mb-4 mt-8">
        <h3 className="font-bold text-xl text-ink-900 mb-1">
          Visibility Controls
        </h3>

        <div className="flex flex-col gap-2 mt-4">
          <div className="bg-paper-50 p-3 rounded-xl border border-ink-100 flex justify-between items-center">
            <span className="font-bold text-ink-900 text-sm">
              Publish Message
            </span>
            <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>

          <div className="bg-paper-50 p-3 rounded-xl border border-ink-100 relative overflow-hidden flex justify-between items-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0, 0.3, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-ink-900 rounded-full"
            />
            <span className="font-bold text-ink-900 text-sm">Show Replies</span>
            <div
              className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${
                showReplies ? "bg-ember-500" : "bg-ink-300"
              }`}
            >
              <motion.div
                layout
                animate={{ left: showReplies ? "18px" : "4px" }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-3">
          <div className="text-[10px] font-bold text-ink-500 mb-1 flex items-center gap-1">
            <Shield className="h-3 w-3" /> Anonymous
          </div>
          <p className="text-md font-medium text-ink-900">
            Your latest project is incredible.
          </p>
        </div>

        <motion.div
          animate={{
            opacity: showReplies ? 1 : 0.2,
            filter: showReplies ? "grayscale(0%)" : "grayscale(100%)",
          }}
          transition={{ duration: 0.5 }}
          className="pl-4 border-l-2 border-ink-200 flex flex-col gap-3"
        >
          <div>
            <div className="text-[10px] font-bold text-ember-600 mb-1 flex items-center gap-1">
              Ahmed (You)
            </div>
            <p className="text-xs font-medium text-ink-800">
              Thank you! It took months to finish.
            </p>
          </div>
          <div>
            <div className="text-[10px] font-bold text-ink-500 mb-1 flex items-center gap-1">
              <Shield className="h-3 w-3" /> Anonymous
            </div>
            <p className="text-xs font-medium text-ink-800">
              It shows. Keep it up.
            </p>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: showReplies ? 0 : 1 }}
          className="text-center mt-auto text-[10px] font-bold text-ink-400 absolute bottom-4 left-0 right-0"
        >
          Replies hidden from public view
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function ReactionPill({
  icon,
  count,
  active,
  empty,
}: {
  icon: string;
  count: string;
  active?: boolean;
  empty?: boolean;
}) {
  if (empty) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-ink-100 text-xs font-bold text-ink-400 bg-white border-dashed">
        <span className="opacity-50">{icon}</span> <span>{count}</span>
      </div>
    );
  }
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition-transform ${
        active
          ? "bg-rose-100 border-rose-200 text-rose-700 scale-110 shadow-sm"
          : "bg-paper-100 border-ink-200 text-ink-600 shadow-sm"
      }`}
    >
      <span className={active ? "animate-bounce" : ""}>{icon}</span>{" "}
      <span>{count}</span>
    </div>
  );
}

function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative rounded-[2.5rem] border border-ink-200 bg-white shadow-sm overflow-hidden",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, rgba(249, 115, 22, 0.1), transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}

export function WhyBsrahaSection() {
  return (
    <section className="py-32 px-4 md:px-8 bg-[#fdfcf9] text-ink-900 relative overflow-hidden border-t border-ink-200">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-ember-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Sparkles className="h-4 w-4 text-ember-500 animate-pulse" />
            <span className="text-ember-500 font-mono text-sm tracking-widest uppercase block font-bold">
              06. The Philosophy
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold mb-6 text-ink-900"
          >
            Because superficial is exhausting.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-ink-600 max-w-2xl mx-auto leading-relaxed"
          >
            Social media forces us to curate the perfect persona. We built
            Bsraha because we believe the most meaningful connections happen
            when you take the mask off.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpotlightCard className="p-8 md:p-10 flex flex-col h-full group">
            <div className="mb-12 flex items-start justify-between">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="h-14 w-14 bg-paper-100 border border-ink-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-ember-50 group-hover:border-ember-300 transition-colors"
              >
                <VenetianMask className="h-6 w-6 text-ember-500" />
              </motion.div>
              <span className="text-6xl font-display font-bold text-ink-200 select-none group-hover:text-ember-500/20 transition-colors duration-500">
                01
              </span>
            </div>
            <div className="mt-auto">
              <h3 className="text-2xl font-bold text-ink-900 mb-4">
                Radical Authenticity
              </h3>
              <p className="text-ink-600 leading-relaxed text-sm md:text-base">
                Strip away the pressure of likes, followers, and curated feeds.
                By removing identity from the equation, Bsraha gives people the
                freedom to say what they actually mean without fear of judgment.
              </p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-8 md:p-10 flex flex-col h-full group">
            <div className="mb-12 flex items-start justify-between">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="h-14 w-14 bg-paper-100 border border-ink-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-emerald-50 group-hover:border-emerald-300 transition-colors"
              >
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </motion.div>
              <span className="text-6xl font-display font-bold text-ink-200 select-none group-hover:text-emerald-500/20 transition-colors duration-500">
                02
              </span>
            </div>
            <div className="mt-auto">
              <h3 className="text-2xl font-bold text-ink-900 mb-4">
                Psychological Safety
              </h3>
              <p className="text-ink-600 leading-relaxed text-sm md:text-base">
                Anonymity shouldn't mean anarchy. We paired untraceable
                messaging with smart AI moderation to ruthlessly block toxicity,
                hate speech, and spam, ensuring feedback remains constructive.
              </p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-8 md:p-10 flex flex-col h-full group">
            <div className="mb-12 flex items-start justify-between">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="h-14 w-14 bg-paper-100 border border-ink-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-sky-50 group-hover:border-sky-300 transition-colors"
              >
                <Sprout className="h-6 w-6 text-sky-600" />
              </motion.div>
              <span className="text-6xl font-display font-bold text-ink-200 select-none group-hover:text-sky-500/20 transition-colors duration-500">
                03
              </span>
            </div>
            <div className="mt-auto">
              <h3 className="text-2xl font-bold text-ink-900 mb-4">
                Meaningful Growth
              </h3>
              <p className="text-ink-600 leading-relaxed text-sm md:text-base">
                Whether you're seeking honest evaluations on a project,
                collecting team feedback, or just learning how others perceive
                you, true growth only happens in the light of reality.
              </p>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  return (
    <div className="min-h-screen bg-paper-100 text-ink-900 overflow-x-hidden font-sans selection:bg-ember-200 selection:text-ink-900">
      <CustomCursor />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section (Idea 1 included here) */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-5 overflow-hidden">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center mt-10"
        >
          <h1 className="flex flex-col items-center justify-center mb-8 text-balance w-full">
            <StrokeText
              text="Say it."
              strokeColor="#000000"
              fillColor="#000000"
              strokeWidth={1}
              drawDuration={1}
              fillDelay={0.2}
              stagger={0.05}
              ease="power2.out"
              trigger="mount"
              fillMode="wipe"
              fontSize={110}
              fontWeight={900}
              letterSpacing={-2}
            />
            <div className="my-4">
              <FoldText
                text="Without the pressure."
                splitBy="word"
                hinge="top"
                trigger="mount"
                duration={0.65}
                stagger={0.07}
                ease="power3.out"
                perspective={700}
                creaseShading={0}
                fontSize="clamp(2.5rem, 7vw, 6rem)"
                fontWeight={900}
                color="#f97316"
              />
            </div>
          </h1>
          <BlurText
            text="Send honest messages. Stay anonymous when you want. Your words speak louder than your identity."
            delay={100}
            animateBy="words"
            direction="top"
            className="text-2xl text-center md:text-2xl text-ink-600 max-w-4xl mx-auto mb-12 font-medium leading-relaxed text-pretty"
          />

          <div className="flex gap-16">
            <MagneticButton
              to="/signup"
              className="bg-ember-500 text-white px-8 py-4 rounded-full font-black text-xl flex items-center gap-3 shadow-float group"
            >
              Get Started{" "}
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
            <MagneticButton
              to="#how-it-works"
              className="bg-paper-200 text-ink-900 px-8 py-4 rounded-full font-black text-xl flex items-center gap-3 hover:bg-paper-300 transition-colors"
            >
              See How It Works
            </MagneticButton>
          </div>

          {/* Typing Transfer Animation visual */}
          <div className="mt-20 flex items-center justify-center gap-8 opacity-50">
            <div className="bg-paper-200 p-4 rounded-2xl">
              <span className="font-mono text-sm font-bold">
                You (Typing...)
              </span>
            </div>
            <motion.div
              animate={{ x: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex-1 w-20 border-t-2 border-dashed border-ink-300 relative"
            >
              <Send className="absolute -top-3 left-1/3 h-5 w-5 text-ink-400" />
            </motion.div>
            <div className="bg-paper-200 p-4 rounded-2xl">
              <span className="font-mono text-sm font-bold">Ahmed@Bsraha</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Idea 3: How It Works */}
      <div id="how-it-works">
        <HowItWorksSection />
      </div>

      {/* Idea 2 & 5: Identity Toggle Section */}
      <section className="py-32 px-5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <InteractiveIdentityCard />
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-ember-500 font-mono text-sm tracking-widest uppercase mb-4 block">
              01. Identity Control
            </span>

            <ShinyText
              text="One message. Two identities."
              speed={2}
              delay={0}
              color="#100c07 "
              shineColor="#ffffff52 "
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
              disabled={false}
              className="text-5xl font-display font-bold mb-6 text-ink-900"
            />
            <p className="text-xl text-ink-600 leading-relaxed mb-8">
              Be yourself. Or don't. Every single message and reply has its own
              identity mode. Sometimes you want people to know it's you.
              Sometimes you don't. Your message. Your choice.
            </p>
            <ul className="space-y-4">
              {[
                "Choose your identity per message",
                "Clear visual indicators for the receiver",
                "Complete cryptographic privacy for anon messages",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-ink-800 font-medium text-lg"
                >
                  <div className="h-6 w-6 rounded-full bg-moss-100 flex items-center justify-center text-moss-600 shrink-0">
                    ✓
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Idea 14: Interactive Chat Mockup */}
      <InteractiveExperienceSection />

      {/* Idea 4: Thread Sequence Section */}
      <ThreadScrollSequence />

      {/* Idea 9: Reactions Showcase (Floating) */}
      <section className="py-40 px-5 bg-paper-100 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <span className="text-sky-accent font-mono text-sm tracking-widest uppercase mb-2 block">
            03. Expressive Feedback
          </span>
          <h2 className="text-5xl font-display font-bold mb-6 text-ink-900">
            Say something without saying anything.
          </h2>
          <p className="text-xl text-ink-600 mb-16 max-w-2xl mx-auto">
            React to messages and replies with the emotion that says it all.
          </p>

          {/* Masked Avatars Component integrated for Reactions / Community feedback */}
          <div className="p-8 rounded-3xl  inline-flex flex-col items-center w-1/3 mt-20">
            <MaskedAvatars size={100} border={1} column={50} />
          </div>
        </div>
      </section>
      {/* Idea 6, 7, 8: Public Control & Profiles */}
      <PublicControlSection />

      {/* Idea 10: Notifications */}
      <NotificationsSection />

      {/* Drift Wall Section (Keep as requested) */}
      {/* <DriftWallSection /> */}

      {/* Masonry Users & Stories Grid (Profile variations) */}
      <MasonryUsersSection />

      {/* Idea 12 & 13: Privacy & Block/Report */}
      <SecuritySection />

      {/* Scroll Expand Section (Keep as requested) */}
      <ScrollExpandSection />

      {/* Idea 15: Why Bsraha */}
      <WhyBsrahaSection />

      {/* Animated Counters Section */}
      <section className="py-20 px-5 max-w-5xl mx-auto border-t border-ink-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedNumber value={42000} label="Messages Sent" />
          <AnimatedNumber value={89} label="Anonymous Rate (%)" />
          <AnimatedNumber value={3200} label="Public Stories" />
        </div>
      </section>

      {/* Idea 16: Final Scaling CTA */}
      <ScaleUpCTA />

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#100c07] text-paper-300 text-center">
        <Logo
          size="md"
          to={null}
          className="justify-center mb-6 [&_span]:text-paper-50"
        />
        <div className="flex items-center justify-center gap-6 mb-8 text-sm font-semibold">
          <Link to="/login" className="hover:text-white transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="hover:text-white transition-colors">
            Sign up
          </Link>
        </div>
        <p className="text-sm font-mono opacity-60">
          © 2026 Bsraha. Built for honesty.
        </p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────────────────────
function InteractiveIdentityCard() {
  const [isAnon, setIsAnon] = useState(true);

  return (
    <div className="flex flex-col gap-8 max-w-md mx-auto">
      <div
        className="flex items-center justify-between p-2 bg-paper-200 rounded-full relative cursor-pointer interactive shadow-inner"
        onClick={() => setIsAnon(!isAnon)}
      >
        <motion.div
          layout
          className="absolute top-2 bottom-2 w-[calc(50%-8px)] bg-paper-50 rounded-full shadow-sm"
          animate={{ left: isAnon ? "8px" : "calc(50%)" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        <div
          className={`relative z-10 flex-1 text-center py-3 font-bold transition-colors ${
            isAnon ? "text-ink-900" : "text-ink-500"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <EyeOff className="h-4 w-4" /> Anonymous
          </div>
        </div>
        <div
          className={`relative z-10 flex-1 text-center py-3 font-bold transition-colors ${
            !isAnon ? "text-ink-900" : "text-ink-500"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Eye className="h-4 w-4" /> Visible
          </div>
        </div>
      </div>

      <div className="p-8 bg-paper-50 rounded-3xl border border-ink-200 shadow-cardLg relative h-64 flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          {isAnon ? (
            <motion.div
              key="anon"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-ink-900 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-paper-50" />
                </div>
                <div>
                  <div className="font-bold text-2xl text-ink-900">
                    Anonymous
                  </div>
                  <div className="text-sm font-mono text-ink-500">
                    Identity completely hidden
                  </div>
                </div>
              </div>
              <div className="w-full h-3 bg-ink-100 rounded-full mb-3 w-3/4" />
              <div className="w-full h-3 bg-ink-100 rounded-full w-1/2" />
            </motion.div>
          ) : (
            <motion.div
              key="visible"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-gradient-to-br from-ember-400 to-sky-500 rounded-full shadow-lg" />
                <div>
                  <div className="font-bold text-2xl text-ink-900">
                    Justin Mason
                  </div>
                  <div className="text-sm font-mono text-ink-500">
                    Real name is shown
                  </div>
                </div>
              </div>
              <div className="w-full h-3 bg-ink-100 rounded-full mb-3 w-3/4" />
              <div className="w-full h-3 bg-ink-100 rounded-full w-1/2" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ScaleUpCTA() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);

  return (
    <section
      ref={ref}
      className="h-screen flex flex-col items-center justify-center overflow-hidden bg-ember-500 text-ink-900 px-5 relative"
    >
      <motion.div
        style={{ scale, opacity }}
        className="text-center z-10 flex flex-col items-center"
      >
        <h2 className="text-6xl md:text-[7rem] font-display font-black leading-none mb-4 tracking-tighter text-paper-50 max-w-4xl">
          Ready to say what you really think?
        </h2>
        <p className="text-2xl font-bold text-amber-200 mb-10">
          No pressure. Just say it.
        </p>
        <MagneticButton
          to="/signup"
          className="bg-ink-900 text-paper-50 px-12 py-6 rounded-full text-3xl font-black shadow-float hover:scale-105 transition-transform"
        >
          Iam Ready
        </MagneticButton>
      </motion.div>
    </section>
  );
}

type ReactionData = {
  type: string;
  icon: string;
  count: number;
  active: boolean;
};
type ThreadNode = {
  id: string;
  author: string;
  tag?: string;
  avatar: React.ReactNode;
  avatarColor: string;
  time: string;
  text: string;
  reactions: ReactionData[];
  replies: ThreadNode[];
};

const BORDER_COLORS = [
  "border-[#8b9fc4]",
  "border-[#e6a15c]",
  "border-[#69b076]",
  "border-[#c48b52]",
];

// 1. EXTRACTED OUTSIDE to maintain stable component lifecycle and stop typing reversal
interface ThreadItemProps {
  node: ThreadNode;
  depth: number;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyInputs: { [key: string]: string };
  setReplyInputs: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  handleToggleReaction: (targetId: string, reactionType: string) => void;
  submitReply: (parentId: string) => void;
}

function ThreadItem({
  node,
  depth,
  replyingTo,
  setReplyingTo,
  replyInputs,
  setReplyInputs,
  handleToggleReaction,
  submitReply,
}: ThreadItemProps) {
  const isReplying = replyingTo === node.id;
  const borderClass = BORDER_COLORS[(depth - 1) % BORDER_COLORS.length];
  const currentText = replyInputs[node.id] || "";

  return (
    <div className="w-full">
      <div className="py-3 group">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm",
              node.avatarColor
            )}
          >
            {node.avatar}
          </div>
          <span className="font-bold text-sm text-ink-900">{node.author}</span>
          {node.tag && (
            <span
              className={cn(
                "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                node.tag === "You"
                  ? "bg-ember-500 text-white"
                  : "bg-ink-900 text-white"
              )}
            >
              {node.tag}
            </span>
          )}
          <span className="text-xs font-mono text-ink-400">{node.time}</span>
        </div>

        <p className="text-ink-800 text-[15px] font-medium leading-relaxed mb-3">
          {node.text}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {node.reactions.map((rx) => (
              <button
                key={rx.type}
                onClick={() => handleToggleReaction(node.id, rx.type)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition-all hover:scale-105",
                  rx.active
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-paper-50 border-ink-200 text-ink-600 hover:bg-paper-100"
                )}
              >
                <span>{rx.icon}</span> <span>{rx.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-ink-400">
            <button
              onClick={() => setReplyingTo(isReplying ? null : node.id)}
              className="hover:text-ink-900 flex items-center gap-1 text-xs font-bold transition-colors"
            >
              <CornerDownRight className="h-3.5 w-3.5" /> Reply
            </button>
          </div>
        </div>

        {/* Stable Inline Reply Input */}
        {isReplying && (
          <div className="mt-3">
            <div className="flex gap-2 items-start bg-white p-2 rounded-xl border border-ink-200 shadow-sm">
              <textarea
                autoFocus
                dir="ltr"
                value={currentText}
                onChange={(e) => {
                  const val = e.target.value;
                  setReplyInputs((prev) => ({ ...prev, [node.id]: val }));
                }}
                placeholder="Write a reply..."
                className="w-full bg-transparent resize-none outline-none text-sm font-medium text-ink-900 p-2 min-h-[60px]"
                style={{
                  direction: "ltr",
                  textAlign: "left",
                  unicodeBidi: "normal",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitReply(node.id);
                  }
                }}
              />
              <div className="flex flex-col gap-2 justify-between h-full pt-1 pr-1">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-ink-400 hover:text-ink-900 p-1 text-xs"
                >
                  ✕
                </button>
                <button
                  onClick={() => submitReply(node.id)}
                  disabled={!currentText.trim()}
                  className="bg-[#fdb082] disabled:bg-ink-200 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {node.replies.length > 0 && (
        <div
          className={cn(
            "ml-3 pl-4 md:ml-4 md:pl-5 border-l-[1.5px]",
            borderClass
          )}
        >
          {node.replies.map((child) => (
            <div key={child.id}>
              <ThreadItem
                node={child}
                depth={depth + 1}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyInputs={replyInputs}
                setReplyInputs={setReplyInputs}
                handleToggleReaction={handleToggleReaction}
                submitReply={submitReply}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ThreadScrollSequence() {
  const [threads, setThreads] = useState<ThreadNode[]>([
    {
      id: "root-1",
      author: "You",
      tag: "You",
      avatar: "Y",
      avatarColor: "bg-[#8b7355]",
      time: "2h ago",
      text: "This is the most honest thing anyone has ever sent me. I am saving it. Thank you for trusting me with it.",
      reactions: [
        { type: "heart", icon: "❤️", count: 67, active: true },
        { type: "fire", icon: "🔥", count: 12, active: false },
        { type: "wow", icon: "😮", count: 8, active: false },
      ],
      replies: [
        {
          id: "reply-1",
          author: "Lina Okafor",
          avatar: "LO",
          avatarColor: "bg-[#c47c2b]",
          time: "2h ago",
          text: "You responded with more grace than I would have. That is why I wrote to you.",
          reactions: [
            { type: "heart", icon: "❤️", count: 34, active: true },
            { type: "wow", icon: "😮", count: 5, active: false },
          ],
          replies: [
            {
              id: "reply-1-1",
              author: "Sahar Mirzai",
              avatar: "SM",
              avatarColor: "bg-[#8b3a2b]",
              time: "1h ago",
              text: "This thread is making me reconsider everything I complain about. Thank you both.",
              reactions: [
                { type: "heart", icon: "❤️", count: 22, active: true },
                { type: "sad", icon: "😢", count: 4, active: false },
              ],
              replies: [
                {
                  id: "reply-1-1-1",
                  author: "Nadia Farouk",
                  avatar: "NF",
                  avatarColor: "bg-[#e05626]",
                  time: "1h ago",
                  text: "Threads like this are the reason I open this app.",
                  reactions: [
                    { type: "heart", icon: "❤️", count: 18, active: true },
                    { type: "fire", icon: "🔥", count: 3, active: false },
                  ],
                  replies: [],
                },
              ],
            },
          ],
        },
        {
          id: "reply-2",
          author: "marcus james",
          avatar: "LO",
          avatarColor: "bg-[#c47c2b]",
          time: "2h ago",
          text: "i am saving it. Thank you for trusting me with it and i believe in you to make it happen",
          reactions: [
            { type: "heart", icon: "💀", count: 34, active: true },
            { type: "wow", icon: "😉", count: 5, active: false },
          ],
          replies: [],
        },
      ],
    },
  ]);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});

  const toggleReactionRecursive = (
    nodes: ThreadNode[],
    targetId: string,
    reactionType: string
  ): ThreadNode[] => {
    return nodes.map((node) => {
      if (node.id === targetId) {
        let hasActive = node.reactions.some(
          (rx) => rx.active && rx.type === reactionType
        );

        const updatedReactions = node.reactions.map((rx) => {
          if (rx.type === reactionType) {
            return {
              ...rx,
              count: rx.active ? rx.count - 1 : rx.count + 1,
              active: !rx.active,
            };
          }
          if (rx.active) {
            return { ...rx, count: rx.count - 1, active: false };
          }
          return rx;
        });

        if (
          !hasActive &&
          !updatedReactions.some((rx) => rx.type === reactionType)
        ) {
          updatedReactions.forEach((rx) => {
            if (rx.active) {
              rx.count -= 1;
              rx.active = false;
            }
          });
          updatedReactions.push({
            type: reactionType,
            icon: reactionType === "fire" ? "🔥" : "❤️",
            count: 1,
            active: true,
          });
        }

        return { ...node, reactions: updatedReactions };
      }
      if (node.replies.length > 0) {
        return {
          ...node,
          replies: toggleReactionRecursive(
            node.replies,
            targetId,
            reactionType
          ),
        };
      }
      return node;
    });
  };

  const handleToggleReaction = (targetId: string, reactionType: string) => {
    setThreads((prev) => toggleReactionRecursive(prev, targetId, reactionType));
  };

  const addReplyRecursive = (
    nodes: ThreadNode[],
    targetId: string,
    newReply: ThreadNode
  ): ThreadNode[] => {
    return nodes.map((node) => {
      if (node.id === targetId) {
        return { ...node, replies: [...node.replies, newReply] };
      }
      if (node.replies.length > 0) {
        return {
          ...node,
          replies: addReplyRecursive(node.replies, targetId, newReply),
        };
      }
      return node;
    });
  };

  const submitReply = (parentId: string) => {
    const text = replyInputs[parentId];
    if (!text || !text.trim()) return;

    const newNode: ThreadNode = {
      id: `new-${Date.now()}`,
      author: "You",
      tag: "You",
      avatar: "Y",
      avatarColor: "bg-[#8b7355]",
      time: "Just now",
      text: text,
      reactions: [],
      replies: [],
    };

    setThreads((prev) => addReplyRecursive(prev, parentId, newNode));
    setReplyingTo(null);
    setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
  };

  return (
    <section className="py-40 px-5 bg-[#fdfcf9] text-ink-900 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
        <span className="text-ember-500 font-mono text-sm tracking-widest uppercase mb-4 block">
          02. Living Conversations
        </span>
        <h2 className="text-5xl font-display font-bold mb-6">
          A message can become a conversation.
        </h2>
        <p className="text-xl text-ink-600">
          Reply to a message. Reply to a reply. Keep the conversation going.
          Infinite nested replies allow conversations to branch out and deepen.
        </p>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-ink-100">
        {threads.map((rootNode) => (
          <ThreadItem
            key={rootNode.id}
            node={rootNode}
            depth={0}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyInputs={replyInputs}
            setReplyInputs={setReplyInputs}
            handleToggleReaction={handleToggleReaction}
            submitReply={submitReply}
          />
        ))}
      </div>
    </section>
  );
}
