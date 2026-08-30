import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MailCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';
import { cn } from '@/utils';

export function VerificationPage() {
  const { user, isVerified, verifyEmail, resendCode } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isVerified) navigate('/dashboard');
  }, [isVerified, navigate]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const next = pasted.split('').concat(Array(6 - pasted.length).fill(''));
      setCode(next);
      inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await verifyEmail(code.join(''));
      navigate('/dashboard');
    } catch {
      setError('Invalid verification code. Try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    await resendCode();
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col items-center text-center mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ember-100 text-ember-600 mb-4"
        >
          <MailCheck className="h-8 w-8" />
        </motion.div>
        <h1 className="font-display text-3xl font-semibold text-ink-900 mb-2">Check your email</h1>
        <p className="text-ink-500 text-pretty">
          We sent a 6-digit code to
          <br />
          <span className="font-mono text-ink-700 font-medium">{user?.displayName ? `your email` : 'your email'}</span>
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={cn(
                'h-14 w-12 rounded-xl border-2 text-center font-display text-2xl font-semibold transition-all',
                digit
                  ? 'border-ember-400 bg-ember-50/50 text-ink-900'
                  : 'border-ink-200 bg-paper-50 text-ink-900 focus:border-ember-400 focus:ring-2 focus:ring-ember-200'
              )}
            />
          ))}
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center">
            {error}
          </motion.div>
        )}

        <button type="submit" disabled={loading || code.join('').length !== 6} className="btn btn-ember w-full py-3 text-base group">
          {loading ? <Spinner size="sm" /> : (
            <>
              Verify email
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-ink-500 mb-2">Did not get the code?</p>
        <button
          onClick={handleResend}
          disabled={resending}
          className="inline-flex items-center gap-2 text-sm text-ember-600 font-medium hover:text-ember-700 link-underline"
        >
          {resending ? <Spinner size="sm" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {resent ? 'Code sent!' : 'Resend code'}
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-ink-400 font-mono">
        Demo: enter any 6 digits to continue
      </p>
    </motion.div>
  );
}
