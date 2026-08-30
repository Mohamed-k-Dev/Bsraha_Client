import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CornerDownRight } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { mockApi } from '@/services/mockApi';
import { ReplyCard } from '@/components/ReplyCard';
import { Avatar } from '@/components/Avatar';
import { ErrorState, EmptyState } from '@/components/States';
import type { Reply as ReplyType, ReactionType } from '@/types';

export function ReplyThreadPage() {
  const { messageId, replyId } = useParams<{ messageId: string; replyId: string }>();
  const navigate = useNavigate();
  const [replies, setReplies] = useState<ReplyType[]>([]);

  const { loading, error, refetch } = useAsync(async () => {
    const reps = await mockApi.getMessageReplies(messageId!);
    setReplies(reps);
    return reps;
  }, [messageId]);

  // Find the target reply and its ancestors
  const findPath = (nodes: ReplyType[], target: string): ReplyType[] | null => {
    for (const n of nodes) {
      if (n.id === target) return [n];
      const childPath = findPath(n.children, target);
      if (childPath) return [n, ...childPath];
    }
    return null;
  };

  const path = findPath(replies, replyId ?? '');
  const target = path?.[path.length - 1] ?? null;

  const handleReplyReact = async (rid: string, type: ReactionType) => {
    const result = await mockApi.reactToReply(messageId!, rid, type);
    setReplies((prev) => updateReply(prev, rid, (r) => ({ ...r, reactions: result.reactions, myReaction: result.myReaction })));
  };

  const handleDeleteReply = async (rid: string) => {
    await mockApi.deleteReply(messageId!, rid);
    setReplies((prev) => updateReply(prev, rid, (r) => ({ ...r, isDeleted: true, body: '' })));
  };

  const handleToggleVisibility = async (rid: string) => {
    const result = await mockApi.toggleReplyVisibility(messageId!, rid);
    setReplies((prev) => updateReply(prev, rid, (r) => ({ ...r, isHidden: result.isHidden })));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="h-6 w-24 shimmer-bg rounded mb-6" />
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full shimmer-bg" />
            <div className="h-3 w-32 shimmer-bg rounded" />
          </div>
          <div className="h-4 w-full shimmer-bg rounded" />
        </div>
      </div>
    );
  }

  if (error) return <div className="max-w-2xl mx-auto px-5 py-12"><ErrorState message={error} onRetry={refetch} /></div>;

  if (!target) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <EmptyState icon={<CornerDownRight className="h-8 w-8" />} title="Reply not found" description="This reply may have been deleted." action={<button onClick={() => navigate(`/messages/${messageId}`)} className="btn btn-outline">Back to message</button>} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      <button onClick={() => navigate(`/messages/${messageId}`)} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to message
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-light text-ink-900">
          Reply <span className="italic font-medium">thread</span>
        </h1>
        <p className="mt-1 text-sm text-ink-500">Following the conversation from this reply.</p>
      </motion.div>

      {/* Ancestor path */}
      {path && path.length > 1 && (
        <div className="mb-6 space-y-2">
          <p className="text-xs text-ink-400 font-mono uppercase tracking-wider mb-3">Conversation path</p>
          {path.slice(0, -1).map((ancestor, i) => (
            <div key={ancestor.id} className="ml-0" style={{ marginLeft: `${i * 16}px` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Avatar name={ancestor.authorDisplayName} seed={ancestor.authorAvatarSeed} size="xs" />
                <span className="text-xs font-display font-semibold text-ink-700">{ancestor.authorDisplayName}</span>
              </div>
              <p className="text-sm text-ink-600 text-pretty pl-6 border-l-2 border-ink-100">{ancestor.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Target reply + children */}
      <div className="card p-4 sm:p-5">
        <ReplyCard
          reply={target}
          depth={0}
          onReact={handleReplyReact}
          onReply={() => navigate(`/messages/${messageId}`)}
          onDelete={handleDeleteReply}
          onToggleVisibility={handleToggleVisibility}
          isMessageOwner={true}
        />
      </div>
    </div>
  );
}

function updateReply(replies: ReplyType[], id: string, fn: (r: ReplyType) => ReplyType): ReplyType[] {
  return replies.map((r) => {
    if (r.id === id) return fn(r);
    if (r.children.length > 0) return { ...r, children: updateReply(r.children, id, fn) };
    return r;
  });
}
