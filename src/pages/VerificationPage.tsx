import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { isAxiosError } from 'axios';

import { Spinner } from '@/components/ui';
import { verifyEmail } from '@/api/auth.api';
import { RootState } from '@/store/store';
import { cn } from '@/utils';

export function VerificationPage() {
  const navigate = useNavigate();
  const emailForVerification = useSelector((state: RootState) => state.auth.emailForVerification);

  if (!emailForVerification) {
    navigate('/signup', { replace: true });
  }

  const [apiError, setApiError] = useState<string | null>(null);
  const [otpBoxes, setOtpBoxes] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: (otp: string) => verifyEmail({ email: emailForVerification!, otp }),
    onSuccess: () => {
      navigate('/login', { state: { message: 'Email verified successfully! Please log in.' } });
    },
    onError: (err) => {
      const msg = isAxiosError(err) 
        ? err.response?.data?.message || 'Invalid or expired OTP.'
        : err?.message;
      setApiError(msg);
    },
  });

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newBoxes = [...otpBoxes];
    newBoxes[index] = value;
    setOtpBoxes(newBoxes);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpBoxes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return; // Only accept 6 digits

    const digits = pasteData.split('');
    setOtpBoxes(digits);
    
    // Focus last input after paste
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpBoxes.join('');
    
    if (fullOtp.length < 6) {
      setApiError('Please enter all 6 digits of the OTP.');
      return;
    }
    
    setApiError(null);
    mutate(fullOtp);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto text-center pb-12">
      <div className="h-16 w-16 bg-ember-50 border border-ember-200 text-ember-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
        <ShieldCheck className="h-8 w-8" />
      </div>

      <h1 className="font-display text-3xl font-semibold text-ink-900 mb-2">Check your email</h1>
      <p className="text-ink-500 mb-8">
        We sent a 6-digit verification code to <span className="font-bold text-ink-900">{emailForVerification}</span>
      </p>

      <AnimatePresence>
        {apiError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium mb-6">
              {apiError}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {otpBoxes.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={cn(
                "w-12 h-14 text-center text-xl font-bold bg-paper-50 border rounded-xl outline-none transition-all shadow-sm focus:border-ember-500 focus:bg-white",
                apiError ? "border-rose-500 bg-rose-50/30" : "border-ink-200"
              )}
            />
          ))}
        </div>

        <button 
          type="submit" 
          disabled={isPending || otpBoxes.join('').length < 6} 
          className="w-full bg-ember-500 hover:bg-ember-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? <Spinner size="sm" /> : (
            <>
              Verify email
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-sm text-ink-500">
        Didn't receive the code?{' '}
        <button 
          type="button"
          onClick={() => alert('New OTP requested')} 
          className="text-ember-600 font-bold hover:text-ember-700 transition-colors inline-flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" /> Resend
        </button>
      </div>
    </motion.div>
  );
}