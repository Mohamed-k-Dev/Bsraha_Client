import { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send, CornerDownRight, Eye, EyeOff, Share2, Lock, Trash2 } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { mockApi } from '@/services/mockApi';
import { MessageCard } from '@/components/MessageCard';
import { ReplyCard } from '@/components/ReplyCard';
import { Avatar } from '@/components/Avatar';
import { Spinner, Badge, CopyButton } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/States';
import type { Message, Reply as ReplyType, ReactionType } from '@/types';
import { cn } from '@/utils';

export function MessageDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState<Message | null>(null);
  const [replies, setReplies] = useState<ReplyType[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loading, error, refetch } = useAsync(async () => {
    const [msg, reps] = await Promise.all([
      mockApi.getMessage(id!),
      mockApi.getMessageReplies(id!),
    ]);
    setMessage(msg);
    setReplies(reps);
    return { msg, reps };
  }, [id]);

  const handleReact = useCallback(async (type: ReactionType) => {
    if (!id) return;
    const result = await mockApi.reactToMessage(id, type);
    setMessage((prev) => (prev ? { ...prev, reactions: result.reactions, myReaction: result.myReaction } : prev));
  }, [id]);

  const handleTogglePublish = useCallback(async () => {
    if (!id) return;
    const result = await mockApi.togglePublish(id);
    setMessage((prev) => (prev ? { ...prev, isPublic: result.isPublic } : prev));
  }, [id]);

  const handleReplyReact = useCallback(async (replyId: string, type: ReactionType) => {
    if (!id) return;
    const result = await mockApi.reactToReply(id, replyId, type);
    setReplies((prev) => updateReply(prev, replyId, (r) => ({ ...r, reactions: result.reactions, myReaction: result.myReaction })));
  }, [id]);

  const handleDeleteReply = useCallback(async (replyId: string) => {
    if (!id) return;
    await mockApi.deleteReply(id, replyId);
    setReplies((prev) => updateReply(prev, replyId, (r) => ({ ...r, isDeleted: true, body: '' })));
  }, [id]);

  const handleToggleReplyVisibility = useCallback(async (replyId: string) => {
    if (!id) return;
    const result = await mockApi.toggleReplyVisibility(id, replyId);
    setReplies((prev) => updateReply(prev, replyId, (r) => ({ ...r, isHidden: result.isHidden })));
  }, [id]);

  const submitReply = async () => {
    if (!replyBody.trim() || !id || submitting) return;
    setSubmitting(true);
    const parentId = replyingTo;
    await mockApi.addReply(id, parentId, replyBody.trim());
    const reps = await mockApi.getMessageReplies(id);
    setReplies(reps);
    setReplyBody('');
    setReplyingTo(null);
    setMessage((prev) => (prev ? { ...prev, replyCount: prev.replyCount + 1 } : prev));
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="h-6 w-24 shimmer-bg rounded mb-6" />
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full shimmer-bg" />
            <div className="space-y-2">
              <div className="h-3 w-32 shimmer-bg rounded" />
              <div className="h-2.5 w-20 shimmer-bg rounded" />
            </div>
          </div>
          <div className="h-4 w-full shimmer-bg rounded" />
          <div className="h-4 w-4/5 shimmer-bg rounded" />
        </div>
      </div>
    );
  }

  if (error) return <div className="max-w-3xl mx-auto px-5 py-12"><ErrorState message={error} onRetry={refetch} /></div>;

  if (!message) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-12">
        <EmptyState icon={<EyeOff className="h-8 w-8" />} title="Message not found" description="This message may have been deleted or never existed." action={<Link to="/messages" className="btn btn-outline">Back to messages</Link>} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Message */}
      <MessageCard message={message} onReact={handleReact} onTogglePublish={handleTogglePublish} linkable={false} showActions={false} />

      {/* Action bar */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button onClick={handleTogglePublish} className={cn('btn text-sm px-4 py-2', message.isPublic ? 'btn-outline text-moss-600' : 'btn-outline')}>
          {message.isPublic ? <><Eye className="h-4 w-4" /> Unpublish</> : <><EyeOff className="h-4 w-4" /> Publish</>}
        </button>
        {message.isPublic && (
          <CopyButton text={`${window.location.origin}/u/you/m/${message.id}`} className="text-sm px-4 py-2">
            <Share2 className="h-4 w-4" /> Share
          </CopyButton>
        )}
        {message.isPublic ? (
          <Badge variant="public"><Eye className="h-3 w-3" /> Public — visible on your profile</Badge>
        ) : (
          <Badge variant="private"><Lock className="h-3 w-3" /> Private — only you can see this</Badge>
        )}
      </div>

      {/* Reply composer */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display text-xl font-semibold text-ink-800">Replies</h2>
          <span className="chip bg-ink-100 text-ink-500 font-mono">{message.replyCount}</span>
          {replyingTo && (
            <button onClick={() => setReplyingTo(null)} className="ml-auto text-xs text-ember-600 hover:text-ember-700 link-underline">
              Cancel reply
            </button>
          )}
        </div>

        {/* Reply box */}
        <div className="card p-4 mb-6">
          {replyingTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-ink-400">
              <CornerDownRight className="h-3.5 w-3.5" />
              Replying to a reply
            </div>
          )}
          <div className="flex items-start gap-3">
            <Avatar name="You" seed="you-seed-9" size="sm" />
            <div className="flex-1">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value.slice(0, 800))}
                placeholder="Write a reply..."
                rows={3}
                className="w-full resize-none rounded-xl border border-ink-200 bg-paper-50 px-4 py-3 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-400 focus:border-transparent transition text-pretty"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-ink-400 font-mono">{replyBody.length}/800</span>
                <button onClick={submitReply} disabled={!replyBody.trim() || submitting} className="btn btn-ember text-sm px-4 py-2">
                  {submitting ? <Spinner size="sm" /> : <><Send className="h-4 w-4" /> Reply</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reply tree */}
        {replies.length === 0 ? (
          <EmptyState
            icon={<CornerDownRight className="h-8 w-8" />}
            title="No replies yet"
            description="Be the first to start a conversation."
            className="py-12"
          />
        ) : (
          <div className="card p-4 sm:p-5">
            {replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                depth={0}
                onReact={handleReplyReact}
                onReply={(parentId) => { setReplyingTo(parentId); document.querySelector('textarea')?.focus(); }}
                onDelete={handleDeleteReply}
                onToggleVisibility={handleToggleReplyVisibility}
                isMessageOwner={true}
              />
            ))}
          </div>
        )}
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
