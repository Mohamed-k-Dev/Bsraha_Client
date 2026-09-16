import { useCallback, useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Mail, Eye, Lock, Menu, UserCheck, ShieldQuestion } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { api } from "@/api/axios";
import { getMessages } from "@/api/messages.api";
import { getUserProfile } from "@/api/user.api"; // NEW IMPORT ADDED
import { reactToTarget, removeReaction } from "@/api/reactions.api";
import { MessageCard } from "@/components/MessageCard";
import { MessageCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/States";
import { cn } from "@/utils";
import type { Message, ReactionType } from "@/types";

type Filter = "all" | "public" | "private" | "anonymous" | "identified";

export function MyMessagesPage() {
  const queryClient = useQueryClient();
  const { setMobileOpen } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentFilter = (searchParams.get("tab") as Filter) || "all";
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [currentFilter]);

  const [publishModal, setPublishModal] = useState<{
    isOpen: boolean;
    messageId: string | null;
    currentStatus: boolean;
  }>({
    isOpen: false,
    messageId: null,
    currentStatus: false,
  });

  // Fetch logged in user to check ownership securely
  const { data: user } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  // Fetch paginated messages
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-messages", currentFilter, page],
    queryFn: () => getMessages({ filter: currentFilter, page, limit: 10 }),
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
        queryKey: ["my-messages", currentFilter, page],
      });
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

    const mutationPromise = togglePublishMutation.mutateAsync({
      messageId: publishModal.messageId,
      shouldPublish,
    });

    toast.promise(mutationPromise, {
      pending: "Updating status...",
      success: shouldPublish ? "Message published!" : "Message unpublished!",
      error: "Failed to update status.",
    });

    setPublishModal({ isOpen: false, messageId: null, currentStatus: false });
  };

  const filters: { key: Filter; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <Mail className="h-4 w-4" /> },
    { key: "public", label: "Public", icon: <Eye className="h-4 w-4" /> },
    { key: "private", label: "Private", icon: <Lock className="h-4 w-4" /> },
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
          <h1 className="font-display text-3xl sm:text-4xl font-light text-ink-900">
            Your <span className="italic font-medium">messages</span>
          </h1>
        </div>
        <p className="mt-2 text-ink-500 text-pretty md:ml-0 ml-12">
          Everything people have sent you — filter and manage visibility.
        </p>
      </motion.div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide flex-wrap ">
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
        ) : error ? (
          <EmptyState
            icon={<Mail className="h-8 w-8" />}
            title="Error loading messages"
            description="Could not fetch data."
            action={
              <button onClick={() => refetch()} className="btn btn-outline">
                Retry
              </button>
            }
          />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<Mail className="h-8 w-8" />}
            title="No messages found"
            description="There are no messages matching this filter."
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {messages.map((m: Message) => (
              <MessageCard
                key={m._id || m.id}
                message={m}
                onReact={(t) =>
                  reactionMutation.mutate({
                    messageId: m._id || m.id,
                    type: t,
                    isRemoving: m.myReaction === t,
                  })
                }
                onTogglePublish={() =>
                  setPublishModal({
                    isOpen: true,
                    messageId: m._id || m.id,
                    currentStatus: m.isPublic,
                  })
                }
                linkable
                currentUserId={user?._id || user?.id} // FIX: NOW IT KNOWS YOU ARE THE OWNER
              />
            ))}
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

      <AnimatePresence>
        {publishModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                  ? "Are you sure you want to make this message private?"
                  : "Are you sure you want to make this message public?"}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
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
                  onClick={handleConfirmPublishToggle}
                  disabled={togglePublishMutation.isPending}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-ink-900 text-paper-50 hover:bg-ink-800 transition-colors shadow-sm disabled:opacity-50"
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
