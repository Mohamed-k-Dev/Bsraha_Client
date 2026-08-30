import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Mail, Eye, EyeOff, Lock } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { mockApi } from '@/services/mockApi';
import { MessageCard } from '@/components/MessageCard';
import { MessageCardSkeleton } from '@/components/Skeleton';
import { EmptyState, ErrorState } from '@/components/States';
import type { Message, ReactionType } from '@/types';
import { cn } from '@/utils';

type Filter = 'all' | 'public' | 'private';

export function MyMessagesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [messages, setMessages] = useState<Message[]>([]);

  const { loading, error, refetch } = useAsync(async () => {
    const msgs = await mockApi.getMyMessages(filter);
    setMessages(msgs);
    return msgs;
  }, [filter]);

  const handleReact = useCallback(async (messageId: string, type: ReactionType) => {
    const result = await mockApi.reactToMessage(messageId, type);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, reactions: result.reactions, myReaction: result.myReaction } : m))
    );
  }, []);

  const handleTogglePublish = useCallback(async (messageId: string) => {
    const result = await mockApi.togglePublish(messageId);
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isPublic: result.isPublic } : m)));
  }, []);

  const filters: { key: Filter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <Mail className="h-4 w-4" /> },
    { key: 'public', label: 'Public', icon: <Eye className="h-4 w-4" /> },
    { key: 'private', label: 'Private', icon: <Lock className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink-900">
          Your <span className="italic font-medium">messages</span>
        </h1>
        <p className="mt-2 text-ink-500 text-pretty">Everything people have sent you — anonymous and visible.</p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all shrink-0',
              filter === f.key
                ? 'bg-ink-900 text-paper-50'
                : 'bg-paper-50 text-ink-600 border border-ink-200 hover:border-ink-400'
            )}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <MessageCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={filter === 'public' ? <EyeOff className="h-8 w-8" /> : <Mail className="h-8 w-8" />}
          title={filter === 'public' ? 'No public messages' : filter === 'private' ? 'No private messages' : 'No messages yet'}
          description={
            filter === 'public'
              ? 'You have not published any messages yet. Open a message and tap the eye icon to share it.'
              : filter === 'private'
              ? 'All your messages are currently public. Switch to the All tab to see everything.'
              : 'When someone sends you a message, it will appear here.'
          }
        />
      ) : (
        <motion.div layout className="space-y-4">
          {messages.map((m) => (
            <MessageCard
              key={m.id}
              message={m}
              onReact={(t) => handleReact(m.id, t)}
              onTogglePublish={handleTogglePublish}
              linkable
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
