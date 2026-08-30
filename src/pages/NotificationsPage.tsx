import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck, Mail, MessageCircle, Heart, Flame, UserPlus, Eye } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { mockApi } from '@/services/mockApi';
import { Avatar } from '@/components/Avatar';
import { EmptyState, ErrorState } from '@/components/States';
import { Spinner } from '@/components/ui';
import type { Notification } from '@/types';
import { formatRelativeTime, cn } from '@/utils';

const iconMap = {
  message: Mail,
  reply: MessageCircle,
  reaction: Heart,
  follow: UserPlus,
  publish: Eye,
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [markingAll, setMarkingAll] = useState(false);

  const { loading, error, refetch } = useAsync(async () => {
    const notifs = await mockApi.getNotifications();
    setNotifications(notifs);
    return notifs;
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = useCallback(async (id: string) => {
    await mockApi.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const handleMarkAll = useCallback(async () => {
    setMarkingAll(true);
    await mockApi.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarkingAll(false);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      <div className="flex items-start justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-ink-900">
            Notifi<span className="italic font-medium">cations</span>
          </h1>
          <p className="mt-2 text-ink-500 text-pretty">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}
          </p>
        </motion.div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} disabled={markingAll} className="btn btn-outline text-sm px-4 py-2">
            {markingAll ? <Spinner size="sm" /> : <><CheckCheck className="h-4 w-4" /> Mark all read</>}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full shimmer-bg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-48 shimmer-bg rounded" />
                <div className="h-2.5 w-20 shimmer-bg rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="No notifications"
          description="When someone messages you, replies to your posts, or reacts to your messages, you will see it here."
        />
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence>
            {notifications.map((n, i) => {
              const Icon = iconMap[n.type] ?? Bell;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={n.link}
                    onClick={() => !n.read && handleMarkRead(n.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl p-3 transition-all border',
                      n.read
                        ? 'bg-paper-50 border-transparent hover:bg-paper-100'
                        : 'bg-ember-50/50 border-ember-200/50 hover:bg-ember-50'
                    )}
                  >
                    <div className="relative">
                      <Avatar name={n.actorName} seed={n.actorAvatarSeed} size="md" anonymous={n.actorName === 'Anonymous'} />
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-paper-50 border border-ink-100">
                        <Icon className="h-3 w-3 text-ink-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-700 text-pretty">
                        <span className="font-display font-semibold text-ink-900">{n.actorName}</span>{' '}
                        {n.body}
                      </p>
                      <span className="text-xs text-ink-400 font-mono">{formatRelativeTime(n.createdAt)}</span>
                    </div>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-ember-500 shrink-0" />}
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
