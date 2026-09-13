import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Send,
  CornerDownRight,
  Eye,
  EyeOff,
  Share2,
  Lock,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { api } from "@/api/axios";
import {
  getMessageById,
  getMessageReplies,
  createMessageReply,
  createReplyToReply,
  deleteMessageReply,
} from "@/api/messages.api";
import { MessageCard } from "@/components/MessageCard";
import { ReplyCard } from "@/components/ReplyCard";
import { Avatar } from "@/components/Avatar";
import { Spinner, Badge, CopyButton } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/States";
import type { Message, Reply as ReplyType, ReactionType } from "@/types";
import { cn } from "@/utils";

export function MessageDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [isAnonymousReply, setIsAnonymousReply] = useState(true);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState<string | null>(null);

  const {
    data: message,
    isLoading: messageLoading,
    error: messageError,
    refetch: refetchMessage,
  } = useQuery({
    queryKey: ["message", id],
    queryFn: () => getMessageById(id!),
    enabled: !!id,
  });

  const {
    data: repliesData,
    isLoading: repliesLoading,
    error: repliesError,
    refetch: refetchReplies,
  } = useQuery({
    queryKey: ["message-replies", id],
    queryFn: () => getMessageReplies(id!),
    enabled: !!id,
  });

  const replies = repliesData?.replies || [];

  const replyMutation = useMutation({
    mutationFn: (content: string) => {
      if (replyingTo) {
        return createReplyToReply({
          replyId: replyingTo,
          content,
          isAnonymous: isAnonymousReply,
        });
      } else {
        return createMessageReply({
          messageId: id!,
          content,
          isAnonymous: isAnonymousReply,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-replies"] });
      queryClient.invalidateQueries({ queryKey: ["reply-replies"] });
      queryClient.invalidateQueries({ queryKey: ["message", id] });
      setReplyBody("");
      setReplyingTo(null);
      toast.success("Reply posted successfully!");
    },
    onError: (err) => {
      toast.error("Failed to post reply.");
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (replyId: string) => deleteMessageReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-replies"] });
      queryClient.invalidateQueries({ queryKey: ["reply-replies"] });
      queryClient.invalidateQueries({ queryKey: ["message", id] });
      toast.success("Reply deleted successfully.");
      setReplyToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete reply.");
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async () => {
      if (!message) return;
      const endpoint = message.isPublic
        ? `/message/unPublish/${id}`
        : `/message/publish/${id}`;
      const res = await api.patch(endpoint);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message", id] });
      queryClient.invalidateQueries({ queryKey: ["my-messages"] });
    },
  });

  const handleTogglePublishConfirm = () => {
    toast
      .promise(togglePublishMutation.mutateAsync(), {
        pending: message?.isPublic ? "Unpublishing..." : "Publishing...",
        success: `Message ${message?.isPublic ? "unpublished" : "published"}!`,
        error: "Failed to update publish status.",
      })
      .finally(() => {
        setIsPublishModalOpen(false);
      });
  };

  // --- REACTION MUTATIONS ---

  const handleMessageReaction = useMutation({
    mutationFn: async (type: string) => {
      if (message?.myReaction === type) {
        return api.delete(`/reaction/message/${id}`);
      } else {
        return api.post(`/reaction/message/${id}`, { type });
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["message", id] }),
  });

  const handleReplyReaction = useMutation({
    mutationFn: async ({
      replyId,
      type,
      currentReaction,
    }: {
      replyId: string;
      type: string;
      currentReaction: string | null;
    }) => {
      if (currentReaction === type) {
        return api.delete(`/reaction/reply/${replyId}`);
      } else {
        return api.post(`/reaction/reply/${replyId}`, { type });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-replies"] });
      queryClient.invalidateQueries({ queryKey: ["reply-replies"] });
    },
  });

  // Action wrappers with Toasts
  const onReactToMessage = (type: string) => {
    toast.promise(handleMessageReaction.mutateAsync(type), {
      pending: "Updating reaction...",
      success: "Reaction updated!",
      error: "Failed to react.",
    });
  };

  const onReactToReply = (
    replyId: string,
    type: string,
    currentReaction: string | null
  ) => {
    toast.promise(
      handleReplyReaction.mutateAsync({ replyId, type, currentReaction }),
      {
        pending: "Updating reaction...",
        success: "Reaction updated!",
        error: "Failed to react.",
      }
    );
  };

  const handleSubmitReply = () => {
    if (!replyBody.trim() || !id || replyMutation.isPending) return;
    replyMutation.mutate(replyBody.trim());
  };

  const loading = messageLoading || repliesLoading;
  const error = messageError || repliesError;

  if (loading) {
    return (
      <div className="w-full lg:w-3/5 mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="h-6 w-24 bg-ink-100 animate-pulse rounded mb-6" />
        <div className="card p-6 space-y-4 bg-white border border-ink-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-32 bg-ink-100 animate-pulse rounded" />
              <div className="h-2.5 w-20 bg-ink-50 animate-pulse rounded" />
            </div>
          </div>
          <div className="h-4 w-full bg-ink-100 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-12">
        <ErrorState
          message={error instanceof Error ? error.message : "Failed to load"}
          onRetry={() => {
            refetchMessage();
            refetchReplies();
          }}
        />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-12">
        <EmptyState
          icon={<EyeOff className="h-8 w-8" />}
          title="Message not found"
          description="This message may have been deleted or never existed."
          action={
            <Link to="/messages" className="btn btn-outline">
              Back to messages
            </Link>
          }
        />
      </div>
    );
  }

  const messageId = message._id || message.id;

  return (
    <div className="w-full lg:w-3/5 mx-auto px-5 sm:px-8 py-8 sm:py-12 relative">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <MessageCard
        message={message}
        onReact={onReactToMessage}
        onTogglePublish={() => setIsPublishModalOpen(true)}
        linkable={false}
        showActions={false}
      />

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setIsPublishModalOpen(true)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
            message.isPublic
              ? "border-moss-200 bg-moss-50 text-moss-700 hover:bg-moss-100"
              : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
          )}
        >
          {message.isPublic ? (
            <>
              <Eye className="h-4 w-4 inline mr-1.5" /> Unpublish
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 inline mr-1.5" /> Publish
            </>
          )}
        </button>

        {message.isPublic && (
          <CopyButton
            text={`${window.location.origin}/u/you/m/${messageId}`}
            className="text-sm px-4 py-2 rounded-xl border border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
          >
            <Share2 className="h-4 w-4 inline mr-1.5" /> Share
          </CopyButton>
        )}

        {message.isPublic ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-moss-50 text-moss-700 border border-moss-200">
            <Eye className="h-3 w-3" /> Public — visible on your profile
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-ink-100 text-ink-600 border border-ink-200">
            <Lock className="h-3 w-3" /> Private — only you can see this
          </span>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display text-xl font-semibold text-ink-800">
            Replies
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-ink-100 text-ink-600 font-mono">
            {message.repliesCount || replies.length}
          </span>
          {replyingTo && (
            <button
              onClick={() => setReplyingTo(null)}
              className="ml-auto text-xs text-ember-600 hover:text-ember-700 underline"
            >
              Cancel reply
            </button>
          )}
        </div>

        <div className="card p-4 sm:p-5 mb-6 bg-white border border-ink-100 rounded-2xl shadow-sm">
          {replyingTo && (
            <div className="flex items-center gap-2 mb-3 text-xs text-ink-400">
              <CornerDownRight className="h-3.5 w-3.5" />
              Replying to thread
            </div>
          )}

          <div className="mb-4">
            <label className="block text-[15px] font-bold tracking-wider text-ink-400 uppercase mb-2">
              Reply as
            </label>
            <div className="flex flex-col lg:flex-row gap-y-3 gap-x-5 lg:gap-y-0 py-3 lg:py-2 p-1.5 bg-ink-50 rounded-xl border border-ink-100">
              <button
                type="button"
                onClick={() => setIsAnonymousReply(true)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 px-3 rounded-lg text-xs font-medium transition-all text-[14px]",
                  isAnonymousReply
                    ? "bg-ember-500 text-white shadow-sm"
                    : "text-ink-600 hover:text-ink-900 hover:bg-ink-100/50"
                )}
              >
                Secret (Anonymous)
              </button>
              <button
                type="button"
                onClick={() => setIsAnonymousReply(false)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 px-3 rounded-lg text-xs font-medium transition-all text-[14px]",
                  !isAnonymousReply
                    ? "bg-ink-900 text-white shadow-sm"
                    : "text-ink-600 hover:text-ink-900 hover:bg-ink-100/50"
                )}
              >
                Identified
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Avatar name="You" seed="you-seed-9" size="sm" />
            <div className="flex-1">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value.slice(0, 800))}
                placeholder="Write a reply..."
                rows={3}
                className="w-full resize-none rounded-xl border border-ink-200 bg-paper-50 px-4 py-3 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-400 focus:border-transparent transition text-sm"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-ink-400 font-mono">
                  {replyBody.length}/800
                </span>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyBody.trim() || replyMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-ember-500 text-white hover:bg-ember-600 shadow-sm text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {replyMutation.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {replies.length === 0 ? (
          <EmptyState
            icon={<CornerDownRight className="h-8 w-8" />}
            title="No replies yet"
            description="Be the first to start a conversation."
            className="py-12"
          />
        ) : (
          <div className="card p-4 sm:p-5 bg-white border border-ink-100 rounded-2xl shadow-sm space-y-4">
            {replies.map((reply: ReplyType) => (
              <ReplyCard
                key={reply.id || reply._id}
                reply={reply}
                depth={0}
                messageId={id!}
                onReact={onReactToReply}
                onReply={(parentId) => {
                  setReplyingTo(parentId);
                  document.querySelector("textarea")?.focus();
                }}
                onDelete={(replyId) => setReplyToDelete(replyId)}
                onToggleVisibility={() => {}}
                isMessageOwner={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Publish Confirmation Modal */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-cardLg border border-ink-100"
            >
              <div className="flex items-center gap-3 mb-3 text-ink-900">
                <AlertTriangle className="h-6 w-6 text-ember-500" />
                <h3 className="font-display font-semibold text-lg">
                  {message?.isPublic
                    ? "Unpublish Message?"
                    : "Publish Message?"}
                </h3>
              </div>
              <p className="text-sm text-ink-600 mb-6 text-pretty">
                {message?.isPublic
                  ? "This message will be removed from your public profile and will only be visible to you."
                  : "This message will be added to your public profile and visible to anyone who visits it."}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTogglePublishConfirm}
                  disabled={togglePublishMutation.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-ink-900 text-white hover:bg-ink-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {togglePublishMutation.isPending && <Spinner size="sm" />}
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Reply Confirmation Modal */}
      <AnimatePresence>
        {replyToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-cardLg border border-ink-100"
            >
              <div className="flex items-center gap-3 mb-3 text-ink-900">
                <Trash2 className="h-6 w-6 text-red-500" />
                <h3 className="font-display font-semibold text-lg">
                  Delete Reply?
                </h3>
              </div>
              <p className="text-sm text-ink-600 mb-6 text-pretty">
                Are you sure you want to delete this reply? This action cannot
                be undone and will hide the content from view.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setReplyToDelete(null)}
                  disabled={deleteReplyMutation.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteReplyMutation.mutate(replyToDelete)}
                  disabled={deleteReplyMutation.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteReplyMutation.isPending && <Spinner size="sm" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
