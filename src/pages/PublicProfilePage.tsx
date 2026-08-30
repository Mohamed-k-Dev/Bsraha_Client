import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Eye, Share2, Calendar } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { mockApi } from '@/services/mockApi';
import { Avatar } from '@/components/Avatar';
import { MessageCard } from '@/components/MessageCard';
import { ComposeMessage } from '@/components/ComposeMessage';
import { MessageCardSkeleton } from '@/components/Skeleton';
import { EmptyState, ErrorState } from '@/components/States';
import { CopyButton, Badge } from '@/components/ui';
import type { User, Message, ReactionType } from '@/types';
import { formatNumber, formatRelativeTime } from '@/utils';

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showCompose, setShowCompose] = useState(false);

  const { loading, error, refetch } = useAsync(async () => {
    const [u, msgs] = await Promise.all([
      mockApi.getUserByUsername(username!),
      mockApi.getUserPublishedMessages(''),
    ]);
    if (u) {
      const published = await mockApi.getUserPublishedMessages(u.id);
      setMessages(published);
    }
    setUser(u);
    return { u, msgs };
  }, [username]);

  const handleReact = useCallback(async (messageId: string, type: ReactionType) => {
    const result = await mockApi.reactToMessage(messageId, type);
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions: result.reactions, myReaction: result.myReaction } : m)));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-20 w-20 rounded-full shimmer-bg" />
          <div className="space-y-2">
            <div className="h-6 w-40 shimmer-bg rounded" />
            <div className="h-4 w-24 shimmer-bg rounded" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <MessageCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) return <div className="max-w-3xl mx-auto px-5 py-12"><ErrorState message={error} onRetry={refetch} /></div>;

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-12">
        <EmptyState icon={<Mail className="h-8 w-8" />} title="Profile not found" description={`No one with the username @${username} exists on Bsraha.`} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      {/* Profile header */}
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

        {/* Actions */}
        <div className="relative mt-6 flex items-center gap-3 flex-wrap">
          <button onClick={() => setShowCompose((v) => !v)} className="btn btn-ember text-sm px-5 py-2.5">
            <Mail className="h-4 w-4" /> Send message
          </button>
          <CopyButton text={`${window.location.origin}/u/${user.username}`} className="text-sm px-4 py-2.5">
            <Share2 className="h-4 w-4" /> Share profile
          </CopyButton>
        </div>
      </motion.div>

      {/* Compose */}
      {showCompose && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 overflow-hidden">
          <ComposeMessage receiverId={user.id} receiverName={user.displayName} onSent={() => setShowCompose(false)} />
        </motion.div>
      )}

      {/* Published messages */}
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-display text-xl font-semibold text-ink-800">Public stories</h2>
        <span className="chip bg-ink-100 text-ink-500 font-mono">{messages.length}</span>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={<Eye className="h-8 w-8" />}
          title="No public stories yet"
          description={`${user.displayName} has not published any messages yet.`}
        />
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <MessageCard key={m.id} message={m} onReact={(t) => handleReact(m.id, t)} linkable showActions={false} />
          ))}
        </div>
      )}
    </div>
  );
}
