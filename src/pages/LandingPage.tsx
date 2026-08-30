import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowRight, Heart, MessageCircle, Reply as ReplyIcon, Search, Eye, EyeOff, Flame, Laugh, Frown, Angry, Meh, Sparkles } from 'lucide-react';
import { Logo } from '@/components/Logo';

// ─────────────────────────────────────────────────────────────────────────────
// Floating message bubbles for the hero
// ─────────────────────────────────────────────────────────────────────────────

const heroBubbles = [
  { text: "I never told anyone this...", x: -180, y: -60, delay: 0, anon: true, rotate: -4 },
  { text: "Your words made me call my mom.", x: 200, y: -100, delay: 0.4, anon: false, rotate: 3 },
  { text: "Say it. Without saying who.", x: -220, y: 80, delay: 0.8, anon: true, rotate: 2 },
  { text: "I was wrong. I was jealous.", x: 180, y: 120, delay: 1.2, anon: true, rotate: -3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper with scroll reveal
// ─────────────────────────────────────────────────────────────────────────────

function RevealSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ y, opacity }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reaction float icons
// ─────────────────────────────────────────────────────────────────────────────

const reactionFloats = [
  { emoji: '❤️', x: '8%', y: '20%', delay: 0, duration: 7 },
  { emoji: '🔥', x: '85%', y: '15%', delay: 1, duration: 8 },
  { emoji: '😂', x: '15%', y: '70%', delay: 2, duration: 6 },
  { emoji: '😮', x: '90%', y: '60%', delay: 0.5, duration: 9 },
  { emoji: '😢', x: '75%', y: '85%', delay: 1.5, duration: 7.5 },
  { emoji: '😡', x: '5%', y: '45%', delay: 2.5, duration: 8.5 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Landing Page
// ─────────────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroProgress, [0, 1], [0, 200]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  return (
    <div className="bg-paper-100 overflow-x-hidden">
      {/* ─── Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-ink-100/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 py-3.5">
          <Logo size="sm" to={null} />
          <div className="hidden sm:flex items-center gap-8 text-sm text-ink-600">
            <a href="#how" className="link-underline hover:text-ink-900">How it works</a>
            <a href="#stories" className="link-underline hover:text-ink-900">Stories</a>
            <a href="#voices" className="link-underline hover:text-ink-900">Voices</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost text-sm">Log in</Link>
            <Link to="/signup" className="btn btn-ember text-sm">Join Bsraha</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ink-900 grain pt-20">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900 via-ink-800 to-ink-900" />
        <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-ember-500/20 blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-moss-500/10 blur-[100px] animate-float-slow" />

        {/* Floating bubbles */}
        {heroBubbles.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 0.7, y: 0, scale: 1 }}
            transition={{ delay: b.delay + 0.5, duration: 0.8 }}
            className="absolute hidden lg:block"
            style={{ left: `calc(50% + ${b.x}px)`, top: `calc(50% + ${b.y}px)` }}
          >
            <motion.div
              animate={{ y: [0, -16, 0], rotate: [b.rotate, b.rotate + 2, b.rotate] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
              className={`max-w-[200px] rounded-2xl px-4 py-3 text-sm shadow-cardLg ${b.anon ? 'bg-ink-700/80 text-paper-100' : 'bg-paper-50/90 text-ink-800'}`}
            >
              <p className="text-pretty leading-snug">{b.text}</p>
              <div className={`mt-2 text-[10px] font-mono ${b.anon ? 'text-paper-300' : 'text-ink-400'}`}>
                {b.anon ? '— Anonymous' : '— Lina O.'}
              </div>
            </motion.div>
          </motion.div>
        ))}

        {/* Hero content */}
        <motion.div
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 chip bg-ember-500/10 text-ember-300 border border-ember-500/20 mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-mono text-xs">Anonymous messaging, reimagined</span>
          </motion.div>

          <h1 className="font-display font-light text-paper-50 text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-balance">
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="block"
            >
              Say it.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="block italic font-medium"
              style={{ background: 'linear-gradient(135deg, #fb923c, #fdba74)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Without saying who.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-lg sm:text-xl text-paper-300 max-w-xl mx-auto text-pretty leading-relaxed font-light"
          >
            Bsraha is where honesty lives without a name. Send messages, spark conversations, and let the words speak louder than the sender.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-10 flex items-center justify-center gap-4 flex-wrap"
          >
            <Link to="/signup" className="btn btn-ember text-base px-6 py-3 group">
              Start sending
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#how" className="btn text-base px-6 py-3 text-paper-200 border border-paper-300/20 hover:bg-paper-50/10 transition">
              See how it works
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-paper-400"
          >
            <span className="text-xs font-mono uppercase tracking-widest">Scroll</span>
            <div className="h-10 w-px bg-gradient-to-b from-paper-300/40 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Anonymous Messages section ─── */}
      <RevealSection className="relative py-32 px-6" id="how">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="chip bg-ink-100 text-ink-600 font-mono text-xs mb-6">01 — Anonymous Messages</span>
              <h2 className="font-display text-4xl sm:text-5xl font-light text-ink-900 leading-tight text-balance">
                The mask is not for hiding.
                <br />
                <span className="italic font-medium">It is for speaking.</span>
              </h2>
              <p className="mt-6 text-lg text-ink-600 leading-relaxed text-pretty">
                Choose to send as yourself or as Anonymous — every single time. No pressure, no pretense. Just you, deciding how much of you the world gets to see.
              </p>
              <div className="mt-8 space-y-4">
                <FeatureRow icon={<Eye className="h-5 w-5" />} title="Visible or Anonymous" desc="Toggle your identity per message. The receiver always knows the rules." />
                <FeatureRow icon={<MessageCircle className="h-5 w-5" />} title="One-to-one messaging" desc="Send directly to any profile. No threads, no noise, just the message." />
              </div>
            </div>

            {/* Interactive message demo */}
            <DemoAnonymousToggle />
          </div>
        </div>
      </RevealSection>

      {/* ─── Real Conversations / Replies ─── */}
      <RevealSection className="relative py-32 px-6 bg-paper-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="chip bg-ink-100 text-ink-600 font-mono text-xs mb-6">02 — Real Conversations</span>
            <h2 className="font-display text-4xl sm:text-5xl font-light text-ink-900 leading-tight text-balance">
              One message becomes <span className="italic font-medium">a conversation</span>.
              <br />
              A conversation becomes <span className="italic font-medium">a tree</span>.
            </h2>
            <p className="mt-6 text-lg text-ink-600 max-w-2xl mx-auto text-pretty">
              Unlimited nested replies. Every message can grow into a living thread — branching, deepening, becoming something bigger than where it started.
            </p>
          </div>

          <DemoReplyTree />
        </div>
      </RevealSection>

      {/* ─── Public Stories ─── */}
      <RevealSection className="relative py-32 px-6" id="stories">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <DemoPublicStory />
            </div>
            <div className="order-1 lg:order-2">
              <span className="chip bg-ink-100 text-ink-600 font-mono text-xs mb-6">03 — Public Stories</span>
              <h2 className="font-display text-4xl sm:text-5xl font-light text-ink-900 leading-tight text-balance">
                Some messages deserve
                <br />
                <span className="italic font-medium">to be heard by more than one.</span>
              </h2>
              <p className="mt-6 text-lg text-ink-600 leading-relaxed text-pretty">
                The receiver decides what goes public. Published messages become shareable stories — with their full reply tree intact. You control visibility. Always.
              </p>
              <div className="mt-8 space-y-4">
                <FeatureRow icon={<Eye className="h-5 w-5" />} title="Publish with one tap" desc="Turn any message you received into a public story." />
                <FeatureRow icon={<ReplyIcon className="h-5 w-5" />} title="Replies inherit visibility" desc="Public messages carry their reply trees with them." />
                <FeatureRow icon={<Sparkles className="h-5 w-5" />} title="Clean shareable URLs" desc="Every public story has a link worth sending to someone." />
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ─── Reactions ─── */}
      <RevealSection className="relative py-32 px-6 bg-ink-900 grain overflow-hidden" id="voices">
        {/* Floating reactions */}
        {reactionFloats.map((r, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-20 pointer-events-none"
            style={{ left: r.x, top: r.y }}
            animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
            transition={{ duration: r.duration, repeat: Infinity, delay: r.delay, ease: 'easeInOut' }}
          >
            {r.emoji}
          </motion.div>
        ))}

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="chip bg-ember-500/10 text-ember-300 border border-ember-500/20 font-mono text-xs mb-6">04 — Reactions</span>
          <h2 className="font-display text-4xl sm:text-5xl font-light text-paper-50 leading-tight text-balance">
            Sometimes words are not enough.
            <br />
            <span className="italic font-medium" style={{ color: '#fb923c' }}>React instead.</span>
          </h2>
          <p className="mt-6 text-lg text-paper-300 max-w-xl mx-auto text-pretty">
            Six reactions. Lightweight, animated, honest. Tap one — or tap it again to take it back. Reactions sort by what the crowd loves most.
          </p>

          {/* Reaction showcase */}
          <div className="mt-12 flex items-center justify-center gap-3 flex-wrap">
            {[
              { emoji: '❤️', label: 'Heart', count: '2.4K', icon: Heart },
              { emoji: '🔥', label: 'Fire', count: '891', icon: Flame },
              { emoji: '😂', label: 'Laugh', count: '445', icon: Laugh },
              { emoji: '😮', label: 'Wow', count: '203', icon: Meh },
              { emoji: '😢', label: 'Sad', count: '178', icon: Frown },
              { emoji: '😡', label: 'Angry', count: '54', icon: Angry },
            ].map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.08, y: -4 }}
                className="flex flex-col items-center gap-2 rounded-2xl bg-ink-700/50 border border-ink-600/50 px-5 py-4 backdrop-blur"
              >
                <span className="text-3xl">{r.emoji}</span>
                <span className="text-xs text-paper-300 font-mono">{r.label}</span>
                <span className="text-sm text-paper-100 font-display font-semibold tabular-nums">{r.count}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ─── Profiles & Search ─── */}
      <RevealSection className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="chip bg-ink-100 text-ink-600 font-mono text-xs mb-6">05 — Profiles & Search</span>
            <h2 className="font-display text-4xl sm:text-5xl font-light text-ink-900 leading-tight text-balance">
              Your profile is a <span className="italic font-medium">collection of stories</span>,
              <br />
              not a collection of likes.
            </h2>
            <p className="mt-6 text-lg text-ink-600 max-w-2xl mx-auto text-pretty">
              A clean, shareable page with your published messages. Find people by name, discover new voices, leave them something real.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <DemoProfileCard />
            <DemoSearchCard />
          </div>
        </div>
      </RevealSection>

      {/* ─── Final CTA ─── */}
      <section className="relative py-32 px-6 overflow-hidden bg-ink-900 grain">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-ember-500/20 blur-[120px]" />
        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <h2 className="font-display text-5xl sm:text-6xl font-light text-paper-50 leading-tight text-balance">
              The internet has enough
              <br />
              <span className="italic font-medium" style={{ color: '#fb923c' }}>carefully curated selves.</span>
            </h2>
            <p className="mt-8 text-xl text-paper-300 text-pretty font-light">
              Bsraha is for the rest of it. The honest parts. The unfiltered parts. The parts you have not figured out how to sign your name to yet.
            </p>
            <Link to="/signup" className="btn btn-ember text-lg px-8 py-4 mt-10 group">
              Say your first thing
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-6 text-sm text-paper-400 font-mono">Free. Always anonymous if you want it to be.</p>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-ink-950 text-paper-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <Logo size="md" to={null} className="[&_span]:text-paper-50" />
              <p className="mt-3 text-sm text-paper-400 max-w-xs">Say it. Without saying who.</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link to="/login" className="link-underline hover:text-paper-50">Log in</Link>
              <Link to="/signup" className="link-underline hover:text-paper-50">Sign up</Link>
              <a href="#how" className="link-underline hover:text-paper-50">How it works</a>
              <a href="#stories" className="link-underline hover:text-paper-50">Stories</a>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-ink-800 text-xs text-paper-400 font-mono flex items-center justify-between">
            <span>Bsraha — built for honesty</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ember-100 text-ember-600">
        {icon}
      </div>
      <div>
        <h3 className="font-display font-semibold text-ink-800">{title}</h3>
        <p className="text-ink-500 text-sm mt-0.5 text-pretty">{desc}</p>
      </div>
    </div>
  );
}

function DemoAnonymousToggle() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="relative"
    >
      <div className="card p-6 shadow-cardLg max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-ink-800 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-paper-100 opacity-70">
                <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z" />
                <path d="M5 14a7 7 0 0 0 14 0" />
              </svg>
            </div>
            <div>
              <div className="font-display font-semibold text-ink-800 text-sm">Anonymous</div>
              <div className="text-xs text-ink-400 font-mono">just now</div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="chip bg-ink-800 text-paper-100"
          >
            Anon
          </motion.div>
        </div>
        <p className="text-ink-800 text-pretty leading-relaxed">
          "I have been pretending to enjoy my job for three years. Today I finally admitted it to myself."
        </p>
        <div className="mt-4 flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} className="chip bg-ember-100 text-ember-700">❤️ 142</motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="chip bg-ink-100 text-ink-600">😢 67</motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="chip bg-ink-100 text-ink-600">🔥 38</motion.div>
        </div>
      </div>

      {/* Decorative toggle */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute -top-6 -right-2 sm:right-4 flex items-center gap-2 rounded-full bg-paper-50 shadow-cardLg px-4 py-2 border border-ink-100"
      >
        <Eye className="h-4 w-4 text-moss-500" />
        <span className="text-xs font-medium text-ink-700">Visible</span>
        <div className="h-4 w-px bg-ink-200" />
        <EyeOff className="h-4 w-4 text-ink-800" />
        <span className="text-xs font-medium text-ink-800">Anonymous</span>
      </motion.div>
    </motion.div>
  );
}

function DemoReplyTree() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-2xl mx-auto space-y-3"
    >
      {/* Root message */}
      <div className="card p-5 border-l-[3px] border-l-ink-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-ink-800" />
          <span className="font-display text-sm font-semibold text-ink-800">Anonymous</span>
          <span className="text-xs text-ink-400 font-mono">3h ago</span>
        </div>
        <p className="text-ink-700 text-sm">"Your post about failure made me cry in a café."</p>
      </div>

      {/* Reply level 1 */}
      <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="ml-6 sm:ml-10 pl-4 border-l-2 border-sky-accent/30">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-7 w-7 rounded-full" style={{ background: 'linear-gradient(135deg, #fb923c, #c2410c)' }} />
            <span className="font-display text-sm font-semibold text-ink-800">You</span>
            <span className="text-xs text-ink-400 font-mono">2h ago</span>
          </div>
          <p className="text-ink-700 text-sm">"This is the most honest thing anyone has ever sent me. Thank you for trusting me with it."</p>
        </div>

        {/* Reply level 2 */}
        <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mt-3 ml-3 sm:ml-5 pl-4 border-l-2 border-ember-300">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-7 w-7 rounded-full" style={{ background: 'linear-gradient(135deg, #6ab05b, #4a9437)' }} />
              <span className="font-display text-sm font-semibold text-ink-800">Lina O.</span>
              <span className="text-xs text-ink-400 font-mono">1h ago</span>
            </div>
            <p className="text-ink-700 text-sm">"You responded with more grace than I would have. That is why I wrote to you."</p>
          </div>

          {/* Reply level 3 */}
          <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }} className="mt-3 ml-3 sm:ml-5 pl-4 border-l-2 border-moss-400">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-7 w-7 rounded-full" style={{ background: 'linear-gradient(135deg, #2563a8, #1e4d8a)' }} />
                <span className="font-display text-sm font-semibold text-ink-800">Sahar M.</span>
                <span className="text-xs text-ink-400 font-mono">45m ago</span>
              </div>
              <p className="text-ink-700 text-sm">"This thread is making me reconsider everything I complain about."</p>
              <div className="mt-2 flex gap-1.5">
                <span className="chip bg-ember-100 text-ember-700 text-[10px]">❤️ 22</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="text-center text-sm text-ink-400 font-mono pt-4"
      >
        ↳ unlimited nesting, always readable
      </motion.p>
    </motion.div>
  );
}

function DemoPublicStory() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="card p-6 ring-1 ring-moss-200/50 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-ink-800" />
            <div>
              <div className="font-display font-semibold text-ink-800 text-sm">Anonymous</div>
              <div className="text-xs text-ink-400 font-mono">2w ago</div>
            </div>
          </div>
          <span className="chip bg-moss-100 text-moss-700">
            <Eye className="h-3 w-3" /> Public
          </span>
        </div>
        <p className="text-ink-800 text-pretty leading-relaxed">
          "Your words made me call my mother for the first time in two years."
        </p>
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="chip bg-ember-100 text-ember-700">❤️ 521</span>
          <span className="chip bg-ink-100 text-ink-600">😢 98</span>
          <span className="chip bg-ink-100 text-ink-600">🔥 43</span>
        </div>
        <div className="mt-4 pt-4 border-t border-ink-100 flex items-center justify-between">
          <span className="text-xs text-ink-400 font-mono">bsraha.app/u/you/m/12</span>
          <span className="chip bg-ink-100 text-ink-600 text-[10px]">18 replies</span>
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -bottom-5 -left-3 sm:left-6 flex items-center gap-2 rounded-full bg-moss-500 shadow-float px-4 py-2 text-white"
      >
        <Eye className="h-4 w-4" />
        <span className="text-xs font-semibold">Now public</span>
      </motion.div>
    </motion.div>
  );
}

function DemoProfileCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card p-6"
    >
      <div className="flex items-center gap-4 mb-5">
        <div className="h-16 w-16 rounded-full" style={{ background: 'linear-gradient(135deg, #6ab05b, #4a9437)' }} />
        <div>
          <h3 className="font-display text-xl font-semibold text-ink-800">Sahar Mirzai</h3>
          <p className="text-sm text-ink-400 font-mono">@saharmz</p>
        </div>
      </div>
      <p className="text-sm text-ink-600 mb-4 text-pretty">Poet, pharmacist, and a little bit of a ghost. Leave me a verse.</p>
      <div className="flex items-center gap-6 text-sm">
        <div><span className="font-display font-bold text-ink-800">389</span> <span className="text-ink-400">messages</span></div>
        <div><span className="font-display font-bold text-ink-800">2.1K</span> <span className="text-ink-400">followers</span></div>
      </div>
      <div className="mt-5 pt-5 border-t border-ink-100 space-y-3">
        <div className="rounded-xl bg-paper-200/50 p-3 text-sm text-ink-700 text-pretty border-l-2 border-ink-800">
          "I was wrong. I was just jealous. I am sorry."
        </div>
        <div className="rounded-xl bg-paper-200/50 p-3 text-sm text-ink-700 text-pretty border-l-2 border-ink-800">
          "Every time you post about loneliness I feel like you are writing to me."
        </div>
      </div>
    </motion.div>
  );
}

function DemoSearchCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card p-6"
    >
      <div className="flex items-center gap-3 mb-5 rounded-xl border border-ink-200 bg-paper-50 px-4 py-3">
        <Search className="h-5 w-5 text-ink-400" />
        <span className="text-ink-400 text-sm">Search people by name...</span>
        <span className="ml-auto text-xs text-ink-300 font-mono">⌘K</span>
      </div>
      <div className="space-y-3">
        {[
          { name: 'Lina Okafor', username: 'linaokafor', seed: '#fb923c', messages: '203' },
          { name: 'Marc Devereaux', username: 'marcdvx', seed: '#2563a8', messages: '156' },
          { name: 'Iris Lindqvist', username: 'irisl', seed: '#6ab05b', messages: '512' },
        ].map((u, i) => (
          <motion.div
            key={u.username}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i }}
            className="flex items-center gap-3 rounded-xl p-2 hover:bg-paper-200/50 transition-colors cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full" style={{ background: `linear-gradient(135deg, ${u.seed}, ${u.seed}aa)` }} />
            <div className="min-w-0">
              <div className="font-display text-sm font-semibold text-ink-800">{u.name}</div>
              <div className="text-xs text-ink-400 font-mono">@{u.username}</div>
            </div>
            <span className="ml-auto text-xs text-ink-400">{u.messages} msgs</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-4 text-xs text-ink-400 font-mono text-center">Designed for autocomplete + fuzzy search</p>
    </motion.div>
  );
}
