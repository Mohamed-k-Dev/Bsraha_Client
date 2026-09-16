import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, MessageCircle, Lock, AlertCircle } from "lucide-react";
import type { Message, ReactionType } from "@/types";
import { Avatar } from "./Avatar";
import { ReactionBar } from "./ReactionBar";
import { Badge } from "./ui";
import { formatRelativeTime, totalReactions, formatNumber, cn } from "@/utils";

interface MessageCardProps {
  id?: string;
  message: Message | any;
  onReact?: (type: ReactionType) => void;
  onTogglePublish?: (id: string) => void;
  variant?: "default" | "feed" | "compact";
  showActions?: boolean;
  currentUserId?: string;
}

export function MessageCard({
  message,
  onReact,
  onTogglePublish,
  variant = "default",
  showActions = true,
  currentUserId,
}: MessageCardProps) {
  const [anonNotice, setAnonNotice] = useState(false);
  const messageId = message._id || message.id;
  const content = message.content || message.body;
  const replyCount =
    message.repliesCount ?? message.replyCount ?? message.commentsCount ?? 0;


  const senderDisplayName =
    message.sender?.displayName || (message.isAnonymous ? "Anonymous" : "User");
  const cleanProfileName = senderDisplayName.split("@")[0].trim();
  const senderUsername = message.sender?.userName;

  const rawReactions = message.reactions;
  const safeReactions = Array.isArray(rawReactions?.types)
    ? rawReactions.types
    : Array.isArray(rawReactions)
    ? rawReactions
    : [];

  const myActiveReaction =
    rawReactions?.myReaction || message.myReaction || null;
  const total = rawReactions?.total ?? totalReactions(safeReactions);

  const handleAnonymousClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAnonNotice(true);
    setTimeout(() => setAnonNotice(false), 3000);
  };

  const senderId =
    message.sender?._id ||
    message.sender?.id ||
    (typeof message.sender === "string" ? message.sender : null);
  const receiverId =
    message.receiver?._id ||
    message.receiver?.id ||
    (typeof message.receiver === "string" ? message.receiver : null);

  const isOwnerOrSender = Boolean(
    currentUserId &&
      (String(currentUserId) === String(senderId) ||
        String(currentUserId) === String(receiverId))
  );

  const canShowRepliesLink = message.showReplies === true || isOwnerOrSender;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "card relative overflow-hidden bg-white border border-ink-100 rounded-2xl transition-all duration-200",
        variant === "compact" ? "p-4" : "p-4 sm:p-6",
        message.isAnonymous && "border-l-4 border-l-ink-800",
        !message.isAnonymous && "border-l-4 border-l-sky-accent",
        message.isPublic && "ring-1 ring-moss-200/50"
      )}
    >
      <AnimatePresence>
        {anonNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-1.5"
          >
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>
              Sender identity is anonymous and profile cannot be viewed.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Avatar
            name={senderDisplayName}
            seed={senderUsername || "anon"}
            size={variant === "compact" ? "sm" : "md"}
            anonymous={message.isAnonymous}
            src={message.sender?.image?.url}
          />
          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-2">
              {message.isAnonymous ? (
                <button
                  type="button"
                  onClick={handleAnonymousClick}
                  className="font-display font-semibold text-ink-800 text-sm sm:text-base hover:text-ink-600 text-left truncate cursor-pointer"
                >
                  Anonymous
                </button>
              ) : senderUsername ? (
                <Link
                  to={`/u/${encodeURIComponent(cleanProfileName)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-display font-semibold text-ink-800 text-sm sm:text-base hover:text-ember-600 transition-colors truncate"
                >
                  {senderDisplayName}
                </Link>
              ) : (
                <span className="font-display font-semibold text-ink-800 text-sm sm:text-base truncate">
                  {senderDisplayName}
                </span>
              )}
            </div>
            <span className="text-[11px] sm:text-xs text-ink-400 font-mono">
              {formatRelativeTime(message.createdAt)}
            </span>
          </div>
        </div>

        {message.isPublic ? (
          <Badge variant="public" className="shrink-0 text-[11px] px-2 py-0.5">
            <Eye className="h-3 w-3" /> Public
          </Badge>
        ) : (
          <Badge variant="private" className="shrink-0 text-[11px] px-2 py-0.5">
            <Lock className="h-3 w-3" /> Private
          </Badge>
        )}
      </div>

      <p
        className={cn(
          "text-ink-800 text-pretty leading-relaxed break-words",
          variant === "compact" ? "text-xs sm:text-sm" : "text-sm sm:text-base"
        )}
      >
        {content}
      </p>

      <div className="mt-4 pt-3 border-t border-ink-100/60 flex items-center justify-between gap-2 flex-wrap">
        <div onClick={(e) => e.stopPropagation()}>
          <ReactionBar
            reactions={safeReactions}
            myReaction={myActiveReaction}
            onReact={(t) => onReact?.(t)}
            compact={variant === "compact"}
          />
        </div>

        {showActions && (
          <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
            {canShowRepliesLink && (
              <Link
                to={`/messages/${messageId}`}
                className="flex items-center gap-1.5 text-xs sm:text-sm text-ink-500 hover:text-ink-800 transition-colors py-1 px-1.5 rounded-lg hover:bg-ink-50"
                title="View replies"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="font-mono text-xs tabular-nums">
                  {formatNumber(replyCount)}
                </span>
              </Link>
            )}

            {onTogglePublish && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTogglePublish(messageId);
                }}
                className={cn(
                  "flex items-center gap-1.5 text-xs sm:text-sm transition-colors py-1 px-1.5 rounded-lg hover:bg-ink-50",
                  message.isPublic
                    ? "text-moss-600 hover:text-moss-700"
                    : "text-ink-400 hover:text-ink-700"
                )}
                title={message.isPublic ? "Unpublish" : "Publish"}
              >
                {message.isPublic ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {total > 0 && variant !== "compact" && (
        <div className="mt-2 text-[11px] text-ink-400 font-mono">
          {formatNumber(total)} total reactions
        </div>
      )}
    </motion.article>
  );
}
