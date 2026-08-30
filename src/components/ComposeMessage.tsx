import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Eye, EyeOff } from 'lucide-react';
import { mockApi } from '@/services/mockApi';
import { cn } from '@/utils';
import { Spinner } from './ui';

interface ComposeMessageProps {
  receiverId: string;
  receiverName: string;
  onSent?: () => void;
  compact?: boolean;
}

export function ComposeMessage({ receiverId, receiverName, onSent, compact }: ComposeMessageProps) {
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const maxLen = 1000;

  const send = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await mockApi.sendMessage(receiverId, body.trim(), isAnonymous);
      setBody('');
      setSuccess(true);
      onSent?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn('card p-4 sm:p-5', compact && 'p-4')}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-sm font-semibold text-ink-700">
          Message {receiverName}
        </span>
        <button
          onClick={() => setIsAnonymous((v) => !v)}
          className={cn(
            'chip transition-all',
            isAnonymous ? 'bg-ink-800 text-paper-100' : 'bg-sky-100 text-sky-accent'
          )}
        >
          {isAnonymous ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {isAnonymous ? 'Anonymous' : 'Visible'}
        </button>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value.slice(0, maxLen))}
        placeholder={isAnonymous ? 'Write without a name. Be honest, be kind, be real.' : 'Write as yourself. They will see your display name.'}
        rows={compact ? 3 : 4}
        className="w-full resize-none rounded-xl border border-ink-200 bg-paper-50 px-4 py-3 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-400 focus:border-transparent transition text-pretty"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-ink-400 font-mono tabular-nums">
          {body.length}/{maxLen}
        </span>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-500">{error}</span>}
          {success && <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-moss-600">Sent!</motion.span>}
          <button onClick={send} disabled={!body.trim() || sending} className="btn btn-ember text-sm px-4 py-2">
            {sending ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
