'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MessageSquare, Clock, ThumbsUp } from 'lucide-react';
import { ForumReply } from '@/lib/shared/types/database.types';
import { ReplyForm } from './reply-form';

interface ReplyItemProps {
  reply: ForumReply;
  threadId: string;
  currentUserId: string;
  depth?: number;
}

export function ReplyItem({ reply, threadId, currentUserId, depth = 0 }: ReplyItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isAuthor = reply.author_id === currentUserId;
  const hasReplies = reply.replies && reply.replies.length > 0;
  const maxDepth = 3;

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 rounded-lg">
            <AvatarImage
              src={reply.users?.profile_photo_url || undefined}
              alt={reply.users?.full_name}
            />
            <AvatarFallback className="text-sm">
              {reply.users?.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${reply.author_id}`}
                className="font-semibold text-sm hover:text-blue-600"
              >
                {reply.users?.full_name}
              </Link>
              {reply.users?.degree && (
                <span className="text-xs text-muted-foreground">• {reply.users.degree}</span>
              )}
              {reply.is_solution && (
                <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                  ✓ Solution
                </Badge>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDate(reply.created_at)}</span>
              </div>
            </div>

            <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{reply.body}</div>

            <div className="mt-3 flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <ThumbsUp className="h-3 w-3" />
                Like
              </Button>
              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <MessageSquare className="h-3 w-3" />
                  Reply
                </Button>
              )}
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? 'Show' : 'Hide'} {reply.replies!.length}{' '}
                  {reply.replies!.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>

            {showReplyForm && (
              <div className="mt-4">
                <ReplyForm
                  threadId={threadId}
                  userId={currentUserId}
                  parentReplyId={reply.id}
                  onSuccess={() => setShowReplyForm(false)}
                  onCancel={() => setShowReplyForm(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {hasReplies && !isCollapsed && (
        <div className="mt-3 space-y-3">
          {reply.replies!.map((nestedReply) => (
            <ReplyItem
              key={nestedReply.id}
              reply={nestedReply}
              threadId={threadId}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
