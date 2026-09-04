import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export function AuthLayout() {
  // const { user, status } = useAuth();

  // if (status === 'authenticated' && user) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-paper-100">
      {/* Left: visual panel */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-ink-900 grain">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950" />
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-ember-500/20 blur-[100px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-moss-500/15 blur-[80px] animate-float-slow" />

        <div className="relative z-10 max-w-md px-12 text-paper-100">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Logo size="lg" to={null} className="[&_span]:text-paper-50" />
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <p className="font-display text-3xl font-light leading-snug text-pretty text-paper-100">
              "The bravest thing someone ever said to me — they said it without a name."
            </p>
            <footer className="mt-6 text-sm text-paper-300 font-mono">
              — a message left on Bsraha
            </footer>
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center gap-6 text-sm text-paper-300"
          >
            <div>
              <div className="font-display text-2xl text-paper-50">42K</div>
              <div className="text-xs">messages sent</div>
            </div>
            <div className="w-px h-10 bg-paper-300/20" />
            <div>
              <div className="font-display text-2xl text-paper-50">89%</div>
              <div className="text-xs">anonymous</div>
            </div>
            <div className="w-px h-10 bg-paper-300/20" />
            <div>
              <div className="font-display text-2xl text-paper-50">3.2K</div>
              <div className="text-xs">public stories</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden p-6">
          <Logo size="md" to={null} />
        </div>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
