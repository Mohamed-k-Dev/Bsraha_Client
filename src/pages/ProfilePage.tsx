import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Settings, Share2, Mail, Eye, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { mockApi } from '@/services/mockApi';
import { Avatar } from '@/components/Avatar';
import { MessageCard } from '@/components/MessageCard';
import { CopyButton, Badge } from '@/components/ui';
import { MessageCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/States';
import { formatNumber, formatRelativeTime, totalReactions } from '@/utils';
import type { Message, ReactionType } from '@/types';
import { useState, useCallback } from 'react';

export function ProfilePage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  const { loading, error, refetch } = useAsync(async () => {
    const msgs = await mockApi.getMyMessages('public');
    setMessages(msgs);
    return msgs;
  }, []);

  const handleReact = useCallback(async (messageId: string, type: ReactionType) => {
    const result = await mockApi.reactToMessage(messageId, type);
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions: result.reactions, myReaction: result.myReaction } : m)));
  }, []);

  if (!user) return null;

  const totalRxs = messages.reduce((sum, m) => sum + totalReactions(m.reactions), 0);
  const totalReplies = messages.reduce((sum, m) => sum + m.replyCount, 0);

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-ember-100/50 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={user.displayName} seed={user.avatarSeed} size="2xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">{user.displayName}</h1>
              {user.verified && <Badge variant="moss"><Eye className="h-3 w-3" /> Verified</Badge>}
            </div>
            <p className="text-ink-400 font-mono text-sm">@{user.username}</p>
            <p className="mt-3 text-ink-600 text-pretty max-w-lg">{user.bio}</p>
            <div className="mt-4 flex items-center gap-5 text-sm">
              <div><span className="font-display font-bold text-ink-900">{formatNumber(user.messagesCount)}</span> <span className="text-ink-400">messages</span></div>
              <div><span className="font-display font-bold text-ink-900">{formatNumber(user.followersCount)}</span> <span className="text-ink-400">followers</span></div>
              <div className="hidden sm:flex items-center gap-1 text-ink-400"><Calendar className="h-3.5 w-3.5" /> Joined {formatRelativeTime(user.joinedAt)}</div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex items-center gap-3 flex-wrap">
          <Link to="/settings" className="btn btn-outline text-sm px-4 py-2.5">
            <Settings className="h-4 w-4" /> Edit profile
          </Link>
          <CopyButton text={`${window.location.origin}/u/${user.username}`} className="text-sm px-4 py-2.5">
            <Share2 className="h-4 w-4" /> Share
          </CopyButton>
          <Link to={`/u/${user.username}`} className="text-sm text-ember-600 hover:text-ember-700 link-underline ml-auto">
            View public profile →
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card p-4 text-center">
          <div className="font-display text-2xl font-bold text-ink-900 tabular-nums">{messages.length}</div>
          <div className="text-xs text-ink-400 font-mono uppercase tracking-wider mt-0.5">Published</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-display text-2xl font-bold text-ink-900 tabular-nums">{formatNumber(totalReplies)}</div>
          <div className="text-xs text-ink-400 font-mono uppercase tracking-wider mt-0.5">Replies</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-display text-2xl font-bold text-ink-900 tabular-nums">{formatNumber(totalRxs)}</div>
          <div className="text-xs text-ink-400 font-mono uppercase tracking-wider mt-0.5">Reactions</div>
        </div>
      </div>

      {/* Published messages */}
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-display text-xl font-semibold text-ink-800">Your public stories</h2>
        <span className="chip bg-ink-100 text-ink-500 font-mono">{messages.length}</span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <MessageCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <EmptyState icon={<Mail className="h-8 w-8" />} title="Could not load" description={error} action={<button onClick={refetch} className="btn btn-outline">Try again</button>} />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={<Eye className="h-8 w-8" />}
          title="Nothing published yet"
          description="Open a message you received and tap the eye icon to publish it. Published messages appear here and on your public profile."
          action={<Link to="/messages" className="btn btn-ember">Go to messages</Link>}
        />
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <MessageCard key={m.id} message={m} onReact={(t) => handleReact(m.id, t)} linkable />
          ))}
        </div>
      )}
    </div>
  );
}
