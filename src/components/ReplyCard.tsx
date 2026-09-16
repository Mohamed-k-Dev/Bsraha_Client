import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trash2,
  EyeOff,
  Eye,
  CornerDownRight,
  MessageSquare,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import type { Reply as ReplyType, ReactionType } from "@/types";
import { getReplyReplies } from "@/api/messages.api";
import { Avatar } from "./Avatar";
import { ReactionBar } from "./ReactionBar";
import { Badge } from "./ui";
import { formatRelativeTime, cn } from "@/utils";

interface ReplyCardProps {
  reply: ReplyType | any;
  depth: number;
  messageId: string;
  onReact: (
    replyId: string,
    type: ReactionType,
    currentReaction: string | null
  ) => void;
  onReply: (parentId: string, content: string) => void;
  onDelete?: (replyId: string) => void;
  onToggleVisibility?: (replyId: string) => void;
  isMessageOwner: boolean;
  currentUserId?: string | null;
}

export function ReplyCard({
  reply,
  depth,
  messageId,
  onReact,
  onReply,
  onDelete,
  onToggleVisibility,
  isMessageOwner,
  currentUserId,
}: ReplyCardProps) {
  const [expanded, setExpanded] = useState(false);

  // FIX: Extract global reactions properly from reactionSummary.types object if reactions.types is empty
  const extractReactionsList = (replyData: any) => {
    // If reactions.types has items, use it
    if (
      Array.isArray(replyData.reactions?.types) &&
      replyData.reactions.types.length > 0
    ) {
      return replyData.reactions.types;
    }
    // Otherwise, parse them from reactionSummary.types object (e.g., { heart: 1, angry: 1, ... })
    const summaryTypes = replyData.reactionSummary?.types;
    if (summaryTypes && typeof summaryTypes === "object") {
      return Object.entries(summaryTypes)
        .filter(
          ([key, count]) =>
            key !== "_id" && typeof count === "number" && count > 0
        )
        .map(([type, count]) => ({ type, count }));
    }
    return [];
  };

  const [optMyReaction, setOptMyReaction] = useState<string | null>(
    reply.reactions?.myReaction || reply.myReaction || null
  );

  const [optReactions, setOptReactions] = useState<any[]>(
    extractReactionsList(reply)
  );

  useEffect(() => {
    setOptMyReaction(reply.reactions?.myReaction || reply.myReaction || null);
    setOptReactions(extractReactionsList(reply));
  }, [reply]);

  const handleOptimisticReact = (type: string) => {
    const prevReaction = optMyReaction;
    const isRemoving = prevReaction === type;
    const newReaction = isRemoving ? null : type;

    setOptMyReaction(newReaction);

    let updatedReactions = [...optReactions];
    if (prevReaction) {
      const prevIdx = updatedReactions.findIndex(
        (r) => r.type === prevReaction
      );
      if (prevIdx > -1)
        updatedReactions[prevIdx].count = Math.max(
          0,
          updatedReactions[prevIdx].count - 1
        );
    }
    if (newReaction) {
      const newIdx = updatedReactions.findIndex((r) => r.type === newReaction);
      if (newIdx > -1) updatedReactions[newIdx].count += 1;
      else updatedReactions.push({ type: newReaction, count: 1 });
    }
    setOptReactions(updatedReactions.filter((r) => r.count > 0));

    onReact(reply.id || reply._id, type as ReactionType, prevReaction);
  };

  const replyId = reply.id || reply._id;
  const bodyText = reply.body || reply.content;
  const authorName = reply.isAnonymous
    ? "Anonymous"
    : reply.authorDisplayName || reply.sender?.displayName || "User";
  const avatarSeed = reply.sender?.userName || reply.authorAvatarSeed || "seed";

  const replySenderId =
    reply.sender?._id ||
    reply.sender?.id ||
    reply.authorId ||
    (typeof reply.sender === "string" ? reply.sender : null);

  const isMine = Boolean(currentUserId && replySenderId === currentUserId);
  const canModerate = isMessageOwner || isMine;

  const { data: subRepliesData, isLoading: loadingSubReplies } = useQuery({
    queryKey: ["reply-replies", replyId],
    queryFn: () => getReplyReplies(replyId),
    enabled: expanded,
  });

  const children = subRepliesData?.replies || reply.children || [];
  const fetchedTotal = subRepliesData?.pagination?.total;
  const replyCount =
    fetchedTotal ?? reply.replyCount ?? reply.repliesCount ?? children.length;

  const hasExplicitCount =
    reply.replyCount !== undefined ||
    reply.repliesCount !== undefined ||
    fetchedTotal !== undefined;
  const showRepliesButton = replyCount > 0 || !hasExplicitCount || expanded;

  const indentColors = [
    "border-l-ink-200",
    "border-l-sky-500",
    "border-l-ember-500",
    "border-l-moss-500",
  ];
  const indentColor = indentColors[depth % indentColors.length];

  return (
    <div className={cn("relative", depth > 0 && "ml-4 sm:ml-6")}>
      <div
        className={cn(
          "py-3.5",
          depth > 0 && "pl-4 sm:pl-5 border-l-2",
          indentColor
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <Avatar
              name={authorName}
              seed={avatarSeed}
              size="sm"
              anonymous={reply.isAnonymous}
            />
            <div className="flex items-center gap-2 min-w-0">
              {reply.isAnonymous ? (
                <button
                  onClick={() =>
                    toast.info("This user is anonymous, profile is hidden.")
                  }
                  className="font-display font-semibold text-ink-900 text-sm truncate cursor-help text-left"
                >
                  {authorName}
                </button>
              ) : (
                <Link
                  to={`/u/${encodeURIComponent(
                    authorName.replace(/@Bsraha/gi, "").trim()
                  )}`}
                  className="font-display font-semibold text-ink-900 text-sm truncate hover:text-ember-600 transition-colors"
                >
                  {authorName.replace(/@Bsraha/gi, "").trim()}
                </Link>
              )}
              {isMine && (
                <Badge
                  variant="ember"
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                >
                  You
                </Badge>
              )}
              <span className="text-xs text-ink-400 font-mono">
                {formatRelativeTime(
                  reply.createdAt ? new Date(reply.createdAt) : new Date()
                )}
              </span>
            </div>
          </div>

          {reply.isDeleted ? (
            <p className="text-ink-400 italic text-sm py-1">
              This reply was deleted.
            </p>
          ) : reply.isHidden ? (
            <div className="py-1">
              <p className="text-ink-400 italic text-sm flex items-center gap-1.5">
                <EyeOff className="h-3.5 w-3.5" /> This reply is hidden from
                public view.
              </p>
              {canModerate && onToggleVisibility && (
                <button
                  onClick={() => onToggleVisibility(replyId)}
                  className="text-xs text-moss-600 hover:text-moss-700 mt-1 underline"
                >
                  Show it
                </button>
              )}
            </div>
          ) : (
            <p className="text-ink-900 text-pretty leading-relaxed text-sm sm:text-[15px]">
              {bodyText}
            </p>
          )}

          {!reply.isDeleted && !reply.isHidden && (
            <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
              <ReactionBar
                reactions={optReactions}
                myReaction={optMyReaction}
                onReact={handleOptimisticReact}
                compact
              />

              <div className="flex items-center gap-4 ml-auto text-xs font-medium">
                {showRepliesButton && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1.5 text-ember-600 hover:text-ember-700 transition-colors bg-ember-50 px-2.5 py-1 rounded-lg border border-ember-200/60"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>
                      {expanded
                        ? "Hide replies"
                        : replyCount > 0
                        ? `${replyCount} repl${replyCount === 1 ? "y" : "ies"}`
                        : "Replies"}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => onReply(replyId, bodyText)}
                  className="flex items-center gap-1 text-ink-500 hover:text-ink-900 transition-colors"
                >
                  <CornerDownRight className="h-3.5 w-3.5" /> Reply
                </button>

                {canModerate && onDelete && (
                  <button
                    onClick={() => onDelete(replyId)}
                    className="text-ink-400 hover:text-red-500 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-1"
            >
              {loadingSubReplies ? (
                <div className="py-2 text-xs text-ink-400 font-mono pl-4">
                  Loading replies...
                </div>
              ) : children.length === 0 ? (
                <div className="py-2 text-xs text-ink-400 font-mono pl-4 italic">
                  No replies in this thread yet. Be the first!
                </div>
              ) : (
                children.map((child: any) => (
                  <ReplyCard
                    key={child.id || child._id}
                    reply={child}
                    depth={depth + 1}
                    messageId={messageId}
                    onReact={onReact}
                    onReply={onReply}
                    onDelete={onDelete}
                    onToggleVisibility={onToggleVisibility}
                    isMessageOwner={isMessageOwner}
                    currentUserId={currentUserId}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
