import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Mail,
  Eye,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import { RootState } from "@/store/store";
import { getMyMessages } from "@/api/messages.api"; // Our new API function
import { MessageCard } from "@/components/MessageCard";
import { MessageCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/States";
import { formatNumber, totalReactions } from "@/utils";
import type { Message, ReactionType } from "@/types";

export function DashboardPage() {
  // Pull authentication state directly from Redux, NOT AuthContext
  const { accessToken } = useSelector((state: RootState) => state.auth);

  // Real API Fetching using React Query
  const {
    data: messages = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-messages"],
    queryFn: getMyMessages,
  });

  // These would ideally be mapped to real mutations later
  const handleReact = useCallback(
    async (messageId: string, type: ReactionType) => {
      console.log("React to message", messageId, type);
    },
    []
  );

  const handleTogglePublish = useCallback(async (messageId: string) => {
    console.log("Toggle publish", messageId);
  }, []);

  const recentMessages = messages.slice(0, 4);
  const totalReactionsCount = messages.reduce(
    (sum: number, m: Message) => sum + totalReactions(m.reactions),
    0
  );
  const publicCount = messages.filter((m: Message) => m.isPublic).length;
  const totalReplies = messages.reduce(
    (sum: number, m: Message) => sum + m.replyCount,
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink-900">
          Hello, <span className="italic font-medium">User</span>{" "}
          {/* We will fetch the real profile next! */}
        </h1>
        <p className="mt-2 text-ink-500 text-pretty">
          Here is what people have been saying to you.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <StatCard
          icon={<Mail className="h-5 w-5" />}
          label="Messages"
          value={messages.length}
          color="ember"
        />
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Public"
          value={publicCount}
          color="moss"
        />
        <StatCard
          icon={<MessageCircle className="h-5 w-5" />}
          label="Replies"
          value={totalReplies}
          color="sky"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Reactions"
          value={totalReactionsCount}
          color="ink"
        />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
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

      {/* Recent messages */}
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

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
          description="When someone sends you a message, it will show up here. Share your profile to get started."
          action={
            <Link to="/search" className="btn btn-ember">
              Find people to message
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {recentMessages.map((m: Message) => (
            <MessageCard
              key={m.id}
              message={m}
              onReact={(t) => handleReact(m.id, t)}
              onTogglePublish={handleTogglePublish}
              linkable
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "ember" | "moss" | "sky" | "ink";
}) {
  const colors = {
    ember: "bg-ember-100 text-ember-600",
    moss: "bg-moss-100 text-moss-600",
    sky: "bg-sky-100 text-sky-accent",
    ink: "bg-ink-100 text-ink-600",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 sm:p-5"
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
}
