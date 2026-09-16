import { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { motion } from "motion/react";
import {
  Send,
  Menu,
  ShieldQuestion,
  UserCheck,
  MessageSquareOff,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { MessageCard } from "@/components/MessageCard";
import { MessageCardSkeleton } from "@/components/Skeleton";
import { EmptyState, ErrorState } from "@/components/States";
import { getSentMessages } from "@/api/messages.api";
import { useAuth } from "@/context/AuthContext";
import { reactToTarget, removeReaction } from "@/api/reactions.api";
import { cn } from "@/utils";
import type { ReactionType } from "@/types";

type Filter = "all" | "anonymous" | "identified";

export function SentMessagesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { setMobileOpen } = useOutletContext<{
    setMobileOpen: (open: boolean) => void;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilter = (searchParams.get("tab") as Filter) || "all";
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [currentFilter]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["sent-messages", currentFilter, page],
    queryFn: () => getSentMessages({ filter: currentFilter, page, limit: 10 }),
  });

  const messages = data?.messages || [];
  const pagination = data?.pagination;

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sent-messages", currentFilter, page],
      });
    },
    onError: () => {
      toast.error("Failed to update reaction.");
    },
  });

  const filters: { key: Filter; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All Sent", icon: <Send className="h-4 w-4" /> },
    {
      key: "anonymous",
      label: "Anonymous",
      icon: <ShieldQuestion className="h-4 w-4" />,
    },
    {
      key: "identified",
      label: "Known",
      icon: <UserCheck className="h-4 w-4" />,
    },
  ];

  if (isError) {
    return (
      <div className="w-full lg:w-3/4 mx-auto px-5 py-12">
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "Failed to load sent messages."
          }
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-3/4 mx-auto px-5 sm:px-8 py-8 sm:py-12 relative flex flex-col min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 -ml-2 text-ink-900 bg-white border border-ink-200 hover:bg-ink-50 rounded-xl"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="h-10 w-10 rounded-xl bg-ember-100 flex items-center justify-center text-ember-600 border border-ember-200 shadow-sm shrink-0">
            <Send className="h-5 w-5 ml-0.5" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-ink-900 flex items-center gap-3">
            Sent <span className="italic font-medium">messages</span>
          </h1>
        </div>
        <p className="mt-2 text-ink-500 text-pretty md:ml-0 ml-[3.25rem]">
          Review the honest thoughts and notes you've shared with others.
        </p>
      </motion.div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setSearchParams({ tab: f.key })}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all shrink-0",
              currentFilter === f.key
                ? "bg-ink-900 text-paper-50 shadow-sm"
                : "bg-white text-ink-600 border border-ink-200 hover:bg-ink-50"
            )}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <MessageCardSkeleton key={i} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<MessageSquareOff className="h-8 w-8" />}
            title="No Sent Messages"
            description={
              currentFilter === "all"
                ? "You haven't sent any messages yet."
                : `You have no sent messages matching the '${currentFilter}' filter.`
            }
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {messages.map((msg: any) => {
              const messageId = msg._id || msg.id;

              const receiverName = msg.receiver?.displayName
                ? msg.receiver.displayName.replace(/@Bsraha/gi, "").trim()
                : "Unknown User";

              const displayMessage = {
                ...msg,
                _id: messageId,
                sender: {
                  ...msg.receiver,
                  displayName: `${receiverName}`,
                  userName: msg.receiver?.userName,
                },
                isAnonymous: false,
              };

              const getNormalizedReactions = (m: any) => {
                if (
                  Array.isArray(m.reactions?.types) &&
                  m.reactions.types.length > 0
                )
                  return m.reactions.types;
                const summaryTypes = m.reactionSummary?.types;
                if (summaryTypes && typeof summaryTypes === "object") {
                  return Object.entries(summaryTypes)
                    .filter(
                      ([key, count]) =>
                        key !== "_id" && typeof count === "number" && count > 0
                    )
                    .map(([type, count]) => ({ type, count }));
                }
                if (Array.isArray(m.reactions)) return m.reactions;
                return [];
              };

              const activeReaction =
                msg.reactions?.myReaction ||
                msg.myReaction ||
                msg.reactionSummary?.myReaction ||
                null;
              const totalComments =
                msg.repliesCount ??
                msg.replyCount ??
                msg.commentsCount ??
                msg.replySummary?.total ??
                0;

              displayMessage.reactions = {
                ...(msg.reactions || {}),
                myReaction: activeReaction,
                types: getNormalizedReactions(msg),
              };
              displayMessage.myReaction = activeReaction;
              displayMessage.repliesCount = totalComments;

              return (
                <div key={messageId} className="relative group">
                  <div className="absolute -top-2.5 right-4 z-10 flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border bg-paper-50">
                    {msg.isAnonymous ? (
                      <span className="text-ink-500 border-ink-200">
                        Secretly Sent
                      </span>
                    ) : (
                      <span className="text-moss-600 border-moss-200">
                        Identified
                      </span>
                    )}
                  </div>

                  <MessageCard
                    message={displayMessage}
                    currentUserId={user?._id}
                    showActions={true}
                    onReact={(t) =>
                      reactionMutation.mutate({
                        messageId,
                        type: t as ReactionType,
                        isRemoving: activeReaction === t,
                      })
                    }
                  />
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-between border-t border-ink-100 pt-6">
          <button
            disabled={!pagination.hasPreviousPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-ink-200 bg-white text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-ink-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-ink-200 bg-white text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
