import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, MessageCircle, Share2, Lock, Unlock } from 'lucide-react';
import type { Message, ReactionType } from '@/types';
import { Avatar } from './Avatar';
import { ReactionBar } from './ReactionBar';
import { Badge } from './ui';
import { formatRelativeTime, totalReactions, formatNumber, cn } from '@/utils';

interface MessageCardProps {
  message: Message;
  onReact?: (type: ReactionType) => void;
  onTogglePublish?: (id: string) => void;
  variant?: 'default' | 'feed' | 'compact';
  showActions?: boolean;
  linkable?: boolean;
}

export function MessageCard({
  message,
  onReact,
  onTogglePublish,
  variant = 'default',
  showActions = true,
  linkable = true,
}: MessageCardProps) {
  const total = totalReactions(message.reactions);

  const inner = (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'card relative overflow-hidden',
        variant === 'compact' ? 'p-4' : 'p-5 sm:p-6',
        message.isAnonymous && 'border-l-[3px] border-l-ink-800',
        !message.isAnonymous && 'border-l-[3px] border-l-sky-accent',
        message.isPublic && 'ring-1 ring-moss-200/50'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            name={message.senderDisplayName ?? 'Anonymous'}
            seed={message.senderUsername ?? 'anon'}
            size={variant === 'compact' ? 'sm' : 'md'}
            anonymous={message.isAnonymous}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {message.isAnonymous ? (
                <span className="font-display font-semibold text-ink-800 text-sm sm:text-base">Anonymous</span>
              ) : (
                <Link
                  to={`/profile/${message.senderUsername}`}
                  className="font-display font-semibold text-ink-800 text-sm sm:text-base hover:text-ember-600 transition-colors truncate"
                >
                  {message.senderDisplayName}
                </Link>
              )}
              {message.isAnonymous ? (
                <Badge variant="anonymous" className="hidden sm:inline-flex">
                  Anon
                </Badge>
              ) : (
                <Badge variant="visible" className="hidden sm:inline-flex">
                  Visible
                </Badge>
              )}
            </div>
            <span className="text-xs text-ink-400 font-mono">{formatRelativeTime(message.createdAt)}</span>
          </div>
        </div>
        {message.isPublic ? (
          <Badge variant="public" className="shrink-0">
            <Eye className="h-3 w-3" /> Public
          </Badge>
        ) : (
          <Badge variant="private" className="shrink-0">
            <Lock className="h-3 w-3" /> Private
          </Badge>
        )}
      </div>

      {/* Body */}
      <p className={cn('text-ink-800 text-pretty leading-relaxed', variant === 'compact' ? 'text-sm' : 'text-base sm:text-[17px]')}>
        {message.body}
      </p>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
        <ReactionBar reactions={message.reactions} myReaction={message.myReaction} onReact={(t) => onReact?.(t)} compact={variant === 'compact'} />

        {showActions && (
          <div className="flex items-center gap-3 ml-auto">
            <Link
              to={`/messages/${message.id}`}
              className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-mono text-xs tabular-nums">{formatNumber(message.replyCount)}</span>
            </Link>

            {onTogglePublish && (
              <button
                onClick={() => onTogglePublish(message.id)}
                className={cn(
                  'flex items-center gap-1.5 text-sm transition-colors',
                  message.isPublic ? 'text-moss-600 hover:text-moss-700' : 'text-ink-400 hover:text-ink-700'
                )}
                title={message.isPublic ? 'Unpublish' : 'Publish'}
              >
                {message.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            )}

            {message.isPublic && (
              <ShareIcon className="h-4 w-4 text-ink-400 hover:text-ink-700 cursor-pointer transition-colors" />
            )}
          </div>
        )}
      </div>

      {total > 0 && variant !== 'compact' && (
        <div className="mt-3 pt-3 border-t border-ink-100 text-xs text-ink-400 font-mono">
          {formatNumber(total)} total reactions
        </div>
      )}
    </motion.article>
  );

  if (linkable && variant !== 'compact') {
    return <Link to={`/messages/${message.id}`} className="block group">{inner}</Link>;
  }
  return inner;
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
