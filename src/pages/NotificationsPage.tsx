import { useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  CheckCheck,
  Mail,
  MessageCircle,
  Heart,
  UserPlus,
  Eye,
  Menu,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/api/notifications.api";
import { Avatar } from "@/components/Avatar";
import { EmptyState, ErrorState } from "@/components/States";
import { Spinner } from "@/components/ui";
import { formatRelativeTime, cn } from "@/utils";
import type { LayoutContextType } from "@/components/AppLayout";

const iconMap: Record<string, any> = {
  message_received: Mail,
  reply_received: MessageCircle,
  reaction: Heart,
  follow: UserPlus,
  publish: Eye,
};

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setMobileOpen } = useOutletContext<LayoutContextType>();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Handle marking read first, then navigating to the message detail page
  const handleNotificationClick = useCallback(
    async (e: React.MouseEvent, notification: any) => {
      e.preventDefault();
      
      if (!notification.messageId) return;

      // If unread, mark it as read first
      if (!notification.isRead) {
        try {
          await markReadMutation.mutateAsync(notification._id || notification.id);
        } catch (err) {
          console.error("Failed to mark notification read", err);
        }
      }

      // Navigate to the exact message details page
      navigate(`/messages/${notification.messageId}`);
    },
    [markReadMutation, navigate]
  );

  return (
    <div className="w-full lg:w-3/4 mx-auto px-5 sm:px-8 py-8 sm:py-12 relative flex flex-col min-h-screen">
      <div className="flex items-start justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 -ml-2 text-ink-900 bg-white border border-ink-200 hover:bg-ink-50 rounded-xl transition-colors shadow-sm"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-ink-900">
              Notifi<span className="italic font-medium">cations</span>
            </h1>
            <p className="mt-2 text-ink-500 text-pretty">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : "You are all caught up."}
            </p>
          </div>
        </motion.div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="px-4 py-2 rounded-xl border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 text-sm font-medium transition-colors shadow-sm flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {markAllMutation.isPending ? (
              <Spinner size="sm" />
            ) : (
              <>
                <CheckCheck className="h-4 w-4" /> Mark all read
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-4 flex items-center gap-3 bg-white border border-ink-100 rounded-2xl">
                <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 bg-ink-100 animate-pulse rounded" />
                  <div className="h-2.5 w-20 bg-ink-50 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            message={error instanceof Error ? error.message : "Failed to load notifications"}
            onRetry={() => refetch()}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-8 w-8" />}
            title="No notifications"
            description="When someone messages you, replies to your posts, or reacts to your messages, you will see it here."
          />
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map((n: any, i: number) => {
                const Icon = iconMap[n.type] ?? Bell;
                const actorName = n.sender?.displayName || n.sender || "Anonymous";
                const cleanActorName = typeof actorName === "string" ? actorName.split("@")[0] : "Anonymous";
                const isAnonymous = cleanActorName === "Anonymous" || n.sender === "anonymous";

                return (
                  <motion.div
                    key={n._id || n.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div
                      onClick={(e) => handleNotificationClick(e, n)}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl p-4 transition-all border shadow-sm cursor-pointer",
                        n.isRead
                          ? "bg-white border-ink-100 hover:border-ink-200"
                          : "bg-ember-50/40 border-ember-200 hover:bg-ember-50/80"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar
                          name={cleanActorName}
                          seed={n.sender?.userName || cleanActorName}
                          size="md"
                          anonymous={isAnonymous}
                        />
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-ink-200 text-ink-700 shadow-sm">
                          <Icon className="h-3 w-3" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink-700 text-pretty leading-relaxed">
                          <span className="font-display font-semibold text-ink-900">
                            {cleanActorName}
                          </span>{" "}
                          {n.message}
                        </p>
                        <span className="text-xs text-ink-400 font-mono mt-1 block">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>

                      {!n.isRead && (
                        <div className="h-2.5 w-2.5 rounded-full bg-ember-500 shrink-0 shadow-sm" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}