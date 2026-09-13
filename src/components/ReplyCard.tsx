import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trash2,
  EyeOff,
  Eye,
  CornerDownRight,
  MessageSquare,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
  onReply: (parentId: string) => void;
  onDelete?: (replyId: string) => void;
  onToggleVisibility?: (replyId: string) => void;
  isMessageOwner: boolean;
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
}: ReplyCardProps) {
  const [expanded, setExpanded] = useState(false);

  const replyId = reply.id || reply._id;
  const bodyText = reply.body || reply.content;
  const authorName = reply.isAnonymous
    ? "Anonymous"
    : reply.authorDisplayName || reply.sender?.displayName || "User";
  const avatarSeed = reply.sender?.userName || reply.authorAvatarSeed || "seed";

  const isMine =
    reply.isMine ||
    reply.sender?._id === reply.currentUserId ||
    authorName.includes("@Bsraha");
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

  // Smart Toggle: Show if count > 0, OR if the backend didn't give us a count yet, OR if it's currently expanded
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
          {/* Author Header */}
          <div className="flex items-center gap-2.5 mb-2">
            <Avatar
              name={authorName}
              seed={avatarSeed}
              size="sm"
              anonymous={reply.isAnonymous}
            />
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-display font-semibold text-ink-900 text-sm truncate">
                {authorName}
              </span>
              {isMine && (
                <Badge
                  variant="ember"
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                >
                  You
                </Badge>
              )}
              <span className="text-xs text-ink-400 font-mono">
                {formatRelativeTime(reply.createdAt)}
              </span>
            </div>
          </div>

          {/* Body */}
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

          {/* Actions Footer */}
          {!reply.isDeleted && !reply.isHidden && (
            <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
              <ReactionBar
                reactions={reply.reactions || []}
                myReaction={reply.myReaction}
                onReact={(t) => onReact(replyId, t, reply.myReaction)}
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
                  onClick={() => onReply(replyId)}
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

        {/* Nested Children Tree */}
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
