'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ForumReply } from '@/lib/shared/types/database.types';
import { MessageSquare, MoreVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ReplyForm } from './reply-form';
import { deleteForumReply } from '@/lib/backend/actions/forum';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReplyItemProps {
    reply: ForumReply;
    threadId: string;
    currentUserId: string;
    depth?: number;
}

export function ReplyItem({ reply, threadId, currentUserId, depth = 0 }: ReplyItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();
    const isAuthor = reply.author_id === currentUserId;
    const maxDepth = 3;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this reply?')) return;

        setDeleting(true);
        try {
            await deleteForumReply(reply.id, currentUserId);
            router.refresh();
        } catch (error) {
            console.error('Failed to delete reply:', error);
        }
        setDeleting(false);
    };

    return (
        <div className={`${depth > 0 ? 'ml-4 md:ml-8 border-l-2 border-muted pl-4' : ''}`}>
            <div className="flex gap-3 py-4">
                <Avatar className="h-10 w-10 rounded-lg flex-shrink-0">
                    <AvatarImage
                        src={reply.users?.profile_photo_url || undefined}
                        alt={reply.users?.full_name}
                    />
                    <AvatarFallback>
                        {reply.users?.full_name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/profile/${reply.author_id}`}
                                className="font-medium text-sm hover:text-primary"
                            >
                                {reply.users?.full_name}
                            </Link>
                            {reply.users?.degree && (
                                <span className="text-xs text-muted-foreground">• {reply.users.degree}</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                                {formatDate(reply.created_at)}
                            </span>
                        </div>

                        {isAuthor && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <p className="mt-1 text-sm whitespace-pre-wrap">{reply.body}</p>

                    <div className="mt-2 flex items-center gap-2">
                        {depth < maxDepth && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="text-xs h-7 px-2"
                            >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Reply
                            </Button>
                        )}
                    </div>

                    {showReplyForm && (
                        <div className="mt-3">
                            <ReplyForm
                                threadId={threadId}
                                userId={currentUserId}
                                parentReplyId={reply.id}
                                onSuccess={() => setShowReplyForm(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {reply.replies && reply.replies.length > 0 && (
                <div className="space-y-0">
                    {reply.replies.map((nestedReply) => (
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
