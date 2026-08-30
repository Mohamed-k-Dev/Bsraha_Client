import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, EyeOff, Eye, CornerDownRight } from 'lucide-react';
import type { Reply as ReplyType, ReactionType } from '@/types';
import { Avatar } from './Avatar';
import { ReactionBar } from './ReactionBar';
import { Badge } from './ui';
import { formatRelativeTime, cn } from '@/utils';

interface ReplyCardProps {
  reply: ReplyType;
  depth: number;
  onReact: (replyId: string, type: ReactionType) => void;
  onReply: (parentId: string) => void;
  onDelete?: (replyId: string) => void;
  onToggleVisibility?: (replyId: string) => void;
  isMessageOwner: boolean;
}

export function ReplyCard({
  reply,
  depth,
  onReact,
  onReply,
  onDelete,
  onToggleVisibility,
  isMessageOwner,
}: ReplyCardProps) {
  const [expanded, setExpanded] = useState(true);
  const isMine = reply.authorId === 'u_me';
  const canModerate = isMessageOwner || isMine;

  const indentColors = [
    'border-l-ink-200',
    'border-l-sky-accent/40',
    'border-l-ember-300',
    'border-l-moss-400',
    'border-l-ink-300',
    'border-l-ember-400',
  ];
  const indentColor = indentColors[depth % indentColors.length];
  const maxDepth = depth >= 6;

  return (
    <div className={cn('relative', depth > 0 && 'ml-3 sm:ml-5')}>
      {/* Indentation line */}
      {depth > 0 && (
        <div className={cn('absolute -left-3 sm:-left-5 top-0 bottom-0 w-px', indentColor.replace('border-l-', 'bg-').replace('/40', '/30').replace('/50', '/30'))} />
      )}

      <div className={cn('py-3', depth > 0 && 'pl-3 sm:pl-4 border-l-2', indentColor)}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative"
        >
          {/* Author */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar name={reply.authorDisplayName} seed={reply.authorAvatarSeed} size="sm" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-display font-semibold text-ink-800 text-sm truncate">{reply.authorDisplayName}</span>
              {isMine && <Badge variant="ember" className="text-[10px] px-2 py-0.5">You</Badge>}
              <span className="text-xs text-ink-400 font-mono">{formatRelativeTime(reply.createdAt)}</span>
            </div>
          </div>

          {/* Body or deleted state */}
          {reply.isDeleted ? (
            <p className="text-ink-400 italic text-sm py-2">This reply was deleted.</p>
          ) : reply.isHidden ? (
            <div className="py-2">
              <p className="text-ink-400 italic text-sm flex items-center gap-1.5">
                <EyeOff className="h-3.5 w-3.5" /> This reply is hidden from public view.
              </p>
              {canModerate && (
                <button
                  onClick={() => onToggleVisibility?.(reply.id)}
                  className="text-xs text-moss-600 hover:text-moss-700 mt-1 link-underline"
                >
                  Show it
                </button>
              )}
            </div>
          ) : (
            <p className="text-ink-800 text-pretty leading-relaxed text-sm sm:text-[15px]">{reply.body}</p>
          )}

          {/* Actions */}
          {!reply.isDeleted && !reply.isHidden && (
            <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
              <ReactionBar
                reactions={reply.reactions}
                myReaction={reply.myReaction}
                onReact={(t) => onReact(reply.id, t)}
                compact
              />

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => onReply(reply.id)}
                  className="flex items-center gap-1 text-xs text-ink-400 hover:text-ink-800 transition-colors"
                >
                  <CornerDownRight className="h-3.5 w-3.5" /> Reply
                </button>

                {canModerate && (
                  <>
                    {isMessageOwner && !isMine && onToggleVisibility && (
                      <button
                        onClick={() => onToggleVisibility(reply.id)}
                        className="text-ink-400 hover:text-ink-700 transition-colors"
                        title={reply.isHidden ? 'Show' : 'Hide'}
                      >
                        {reply.isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(reply.id)}
                        className="text-ink-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Children */}
        {reply.children.length > 0 && (
          <div className="mt-1">
            {maxDepth ? (
              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    {reply.children.map((child) => (
                      <ReplyCard
                        key={child.id}
                        reply={child}
                        depth={depth + 1}
                        onReact={onReact}
                        onReply={onReply}
                        onDelete={onDelete}
                        onToggleVisibility={onToggleVisibility}
                        isMessageOwner={isMessageOwner}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              reply.children.map((child) => (
                <ReplyCard
                  key={child.id}
                  reply={child}
                  depth={depth + 1}
                  onReact={onReact}
                  onReply={onReply}
                  onDelete={onDelete}
                  onToggleVisibility={onToggleVisibility}
                  isMessageOwner={isMessageOwner}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
