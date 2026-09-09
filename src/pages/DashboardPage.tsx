import { useCallback, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Mail,
  Eye,
  MessageCircle,
  ArrowRight,
  Search,
  Sparkles,
  Send,
  TrendingUp,
  Menu,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getMessages, getUserStats } from "@/api/messages.api";
import { getUserProfile } from "@/api/user.api";
import { reactToTarget, removeReaction } from "@/api/reactions.api";
import { MessageCard } from "@/components/MessageCard";
import { MessageCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/States";
import { formatNumber } from "@/utils";
import type { Message, ReactionType } from "@/types";
import { api } from "@/api/axios";
import { toast } from "react-toastify";

// Animation variants for the typewriter effect
const typingContainer = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }, // Typing speed
  },
};

const typingChar = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0 } }, // Instant pop-in like a keyboard
};

export function DashboardPage() {
  const queryClient = useQueryClient();

  // Grab the setMobileOpen function from the parent AppLayout
  const { setMobileOpen } = useOutletContext();
  const [publishModal, setPublishModal] = useState<{
    isOpen: boolean;
    messageId: string | null;
    currentStatus: boolean;
  }>({
    isOpen: false,
    messageId: null,
    currentStatus: false,
  });
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: getUserStats,
  });

  const {
    data,
    isLoading: messagesLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-messages", "dashboard"],
    queryFn: () => getMessages({ limit: 6 }),
  });

  const messages = data?.messages || [];

  const reactionMutation = useMutation({
    mutationFn: async ({
      messageId,
      type,
      isRemoving,
    }: {
      messageId: string;
      type: ReactionType;
      isRemoving: boolean;
    }) => {
      if (isRemoving) {
        return removeReaction({ targetType: "message", targetId: messageId });
      }
      return reactToTarget({
        targetType: "message",
        targetId: messageId,
        type,
      });
    },
    onMutate: async ({ messageId, type, isRemoving }) => {
      await queryClient.cancelQueries({ queryKey: ["my-messages"] });
      const previousMessages = queryClient.getQueryData(["my-messages"]);

      queryClient.setQueryData(["my-messages"], (oldMessages: any) => {
        if (!Array.isArray(oldMessages)) return oldMessages;

        return oldMessages.map((msg: any) => {
          if ((msg._id || msg.id) !== messageId) return msg;

          const currentTypes = msg.reactions?.types || [];
          const oldMyReaction = msg.reactions?.myReaction;

          // Recalculate counts optimistically
          let newTotal = msg.reactions?.total || 0;
          const updatedTypes = currentTypes.map((item: any) => {
            let count = item.count;
            if (item.type === oldMyReaction && item.type !== type)
              count = Math.max(0, count - 1);
            if (
              item.type === type &&
              !isRemoving &&
              item.type !== oldMyReaction
            )
              count += 1;
            if (item.type === type && isRemoving)
              count = Math.max(0, count - 1);
            return { ...item, count };
          });

          if (isRemoving && oldMyReaction) newTotal = Math.max(0, newTotal - 1);
          if (!isRemoving && !oldMyReaction) newTotal += 1;

          return {
            ...msg,
            reactions: {
              total: newTotal,
              types: updatedTypes,
              myReaction: isRemoving ? null : type,
            },
          };
        });
      });

      return { previousMessages };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["my-messages"], context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["my-messages"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({
      messageId,
      shouldPublish,
    }: {
      messageId: string;
      shouldPublish: boolean;
    }) => {
      const endpoint = shouldPublish
        ? `/message/publish/${messageId}`
        : `/message/unPublish/${messageId}`;
      const response = await api.patch(endpoint);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-messages"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
  });

  const handleConfirmPublishToggle = () => {
    if (!publishModal.messageId) return;

    const shouldPublish = !publishModal.currentStatus;

    // Trigger the mutation and wrap it with toast.promise for automated pending/success/error states
    const mutationPromise = togglePublishMutation.mutateAsync({
      messageId: publishModal.messageId,
      shouldPublish,
    });

    toast.promise(mutationPromise, {
      pending: "Taking action...",
      success: shouldPublish
        ? "Message published successfully!"
        : "Message unpublished successfully!",
      error: {
        render({ data }: { data: any }) {
          return (
            data?.response?.data?.message || "Failed to update message status."
          );
        },
      },
    });

    setPublishModal({ isOpen: false, messageId: null, currentStatus: false });
  };

  const handleOpenPublishModal = useCallback(
    (messageId: string) => {
      const message = messages.find(
        (m: Message) => (m._id || m.id) === messageId
      );
      if (!message) return;

      setPublishModal({
        isOpen: true,
        messageId,
        currentStatus: message.isPublic,
      });
    },
    [messages]
  );

  const handleReact = useCallback(
    (messageId: string, type: ReactionType) => {
      // Find the message in the current cache
      const message = messages.find(
        (m: Message) => (m._id || m.id) === messageId
      );

      // Extract the user's active reaction from your backend's nested object structure
      const currentMyReaction =
        message?.reactions?.myReaction || message?.myReaction;

      // If clicking the exact same reaction icon they already picked, remove it
      const isRemoving = currentMyReaction === type;

      reactionMutation.mutate({ messageId, type, isRemoving });
    },
    [messages, reactionMutation]
  );

  const recentMessages = messages;
  const rawName = user?.displayName || user?.userName || "";
  const displayName = rawName.split("@")[0].trim();
  const nameChars = useMemo(() => displayName.split(""), [displayName]);

  return (
    <div className="w-full lg:w-3/4 mx-auto px-5 sm:px-8 py-8 sm:py-12">
      {/* Header with Menu Button & Blur Animation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3">
          {/* MOBILE MENU BUTTON - Right next to the text */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 -ml-2 text-ink-900 bg-white border border-ink-200 hover:bg-ink-50 rounded-xl transition-colors shadow-sm"
          >
            <Menu className="h-6 w-6" />
          </button>

          <h1 className="font-display text-3xl sm:text-4xl font-light text-ink-900 flex items-center flex-wrap gap-2">
            <span>Hello,</span>
            {!userLoading && displayName && (
              <motion.span
                variants={typingContainer}
                initial="hidden"
                animate="show"
                className="italic font-medium inline-flex"
              >
                {nameChars.map((char, i) => (
                  <motion.span key={i} variants={typingChar}>
                    {/* Preserve spaces during mapping */}
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.span>
            )}
          </h1>
        </div>

        <p className="mt-2 text-ink-500 text-pretty md:ml-0 ml-12">
          Here is what people have been saying to you.
        </p>
      </motion.div>

      {/* Stats Section */}
      {statsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="card p-5 animate-pulse bg-paper-50 h-[110px] rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
          <StatCard
            to="/messages"
            icon={<Mail className="h-5 w-5" />}
            label="Received"
            value={stats?.totalMessagesReceived || 0}
            color="ember"
          />
          <StatCard
            to="/messages?tab=public"
            icon={<Eye className="h-5 w-5" />}
            label="Public"
            value={stats?.publicMessages || 0}
            color="moss"
          />
          <StatCard
            to="/messages?tab=sent"
            icon={<Send className="h-5 w-5" />}
            label="Sent"
            value={stats?.sentMessages || 0}
            color="sky"
          />
          <StatCard
            to="/messages?tab=replies"
            icon={<MessageCircle className="h-5 w-5" />}
            label="Replies"
            value={stats?.totalReplies || 0}
            color="ink"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Reactions"
            value={stats?.totalReactions || 0}
            color="ember"
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid lg:grid-cols-2 gap-4 mb-10">
        <Link
          to="/search"
          className="card p-5 flex items-center gap-4 hover:shadow-cardLg transition-all group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ember-100 text-ember-600">
            <Search className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-ink-800">
              Find people
            </h3>
            <p className="text-sm text-ink-500">
              Search by name and send them a message.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-ink-300 group-hover:text-ink-600 group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          to="/messages"
          className="card p-5 flex items-center gap-4 hover:shadow-cardLg transition-all group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-moss-100 text-moss-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-ink-800">
              All your messages
            </h3>
            <p className="text-sm text-ink-500">
              See everything people have sent you.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-ink-300 group-hover:text-ink-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent messages header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink-800">
          Recent messages
        </h2>
        <Link
          to="/messages"
          className="text-sm text-ember-600 hover:text-ember-700 link-underline"
        >
          View all
        </Link>
      </div>

      {/* 2 Message Boxes Per Row Grid */}
      {messagesLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MessageCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<Mail className="h-8 w-8" />}
          title="Could not load messages"
          description={
            error instanceof Error ? error.message : "Failed to load"
          }
          action={
            <button onClick={() => refetch()} className="btn btn-outline">
              Try again
            </button>
          }
        />
      ) : recentMessages.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-8 w-8" />}
          title="No messages yet"
          description="When someone sends you a message, it will show up here."
          action={
            <Link to="/search" className="btn btn-ember">
              Find people to message
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recentMessages.map((m: Message) => (
            <MessageCard
              key={m._id || m.id}
              message={m}
              onReact={(t) => handleReact(m._id || m.id, t)}
              onTogglePublish={() => handleOpenPublishModal(m._id || m.id)}
              linkable
            />
          ))}
        </div>
      )}
      {/* ========================================= */}
      {/* APP-STYLED PUBLISH CONFIRMATION MODAL     */}
      {/* ========================================= */}
      <AnimatePresence>
        {publishModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setPublishModal({
                  isOpen: false,
                  messageId: null,
                  currentStatus: false,
                })
              }
              className="absolute inset-0 bg-ink-900/30 backdrop-blur-md"
            />

            {/* Modal Card matching your design system */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md card bg-white p-6 sm:p-7 shadow-2xl border border-ink-100 z-10 rounded-2xl"
            >
              <h3 className="font-display text-xl font-semibold text-ink-900 mb-2">
                {publishModal.currentStatus
                  ? "Unpublish this message?"
                  : "Publish this message?"}
              </h3>
              <p className="text-sm text-ink-500 mb-6 leading-relaxed">
                {publishModal.currentStatus
                  ? "Are you sure you want to make this message private? It will be removed from your public profile."
                  : "Are you sure you want to make this message public? Anyone visiting your profile will be able to read it."}
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setPublishModal({
                      isOpen: false,
                      messageId: null,
                      currentStatus: false,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPublishToggle}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-ink-900 text-paper-50 hover:bg-ink-800 transition-colors shadow-sm"
                >
                  Yes, {publishModal.currentStatus ? "Unpublish" : "Publish"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "ember" | "moss" | "sky" | "ink";
  to?: string;
}) {
  const colors = {
    ember: "bg-ember-100 text-ember-600",
    moss: "bg-moss-100 text-moss-600",
    sky: "bg-sky-100 text-sky-accent",
    ink: "bg-ink-100 text-ink-600",
  };
  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 sm:p-5 h-full"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]} mb-3`}
      >
        {icon}
      </div>
      <div className="font-display text-2xl sm:text-3xl font-bold text-ink-900 tabular-nums">
        {formatNumber(value)}
      </div>
      <div className="text-xs text-ink-400 font-mono uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </motion.div>
  );
  if (to)
    return (
      <Link
        to={to}
        className="block transition-transform hover:-translate-y-1 rounded-2xl outline-none"
      >
        {CardContent}
      </Link>
    );
  return CardContent;
}
