import { motion } from "motion/react";
import { Mail } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-paper-50 overflow-hidden">
      <div className="relative flex items-center justify-center">
        {/* Soft glowing ambient background */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-32 h-32 bg-ember-100 rounded-full blur-2xl"
        />

        {/* Floating Card */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative card bg-white p-5 rounded-2xl shadow-xl border border-ink-100 z-10 flex items-center justify-center"
        >
          <Mail className="h-8 w-8 text-ember-600" strokeWidth={1.5} />

          {/* Playful rotating sparkle */}
          <motion.div
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -top-3 -right-3 text-moss-500 bg-paper-50 rounded-full p-1 border border-ink-100 shadow-sm"
          >
          </motion.div>
        </motion.div>
      </div>

      {/* Staggered Typography Animation */}
      <div className="mt-10 flex items-center gap-1.5 font-display text-sm sm:text-base font-semibold text-ink-500 uppercase tracking-[0.2em]">
        {["L", "O", "A", "D", "I", "N", "G"].map((letter, i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.15, // Stagger effect
              ease: "easeInOut",
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
