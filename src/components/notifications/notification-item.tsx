'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { markAsRead } from '@/lib/backend/actions/notifications';
import type { Notification, NotificationType } from '@/lib/shared/types/database.types';
import { UserPlus, Bookmark, Eye, MessageSquare, Heart, Bell } from 'lucide-react';

interface NotificationItemProps {
    notification: Notification;
    onRead?: (id: string) => void;
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
    follower: <UserPlus className="h-4 w-4 text-blue-500" />,
    case_save: <Bookmark className="h-4 w-4 text-green-500" />,
    case_view: <Eye className="h-4 w-4 text-purple-500" />,
    forum_reply: <MessageSquare className="h-4 w-4 text-orange-500" />,
    thread_like: <Heart className="h-4 w-4 text-pink-500" />,
    reply_like: <Heart className="h-4 w-4 text-pink-500" />,
    system: <Bell className="h-4 w-4 text-gray-500" />,
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const router = useRouter();

    const handleClick = async () => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
            onRead?.(notification.id);
        }

        if (notification.link) {
            router.push(notification.link);
        }
    };

    const actorName = notification.actor?.full_name || 'Someone';
    const actorInitials = actorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <button
            onClick={handleClick}
            className={cn(
                'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                !notification.is_read && 'bg-primary/5'
            )}
        >
            {notification.type === 'system' ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {typeIcons[notification.type]}
                </div>
            ) : (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.actor?.profile_photo_url || undefined} />
                    <AvatarFallback className="text-xs">{actorInitials}</AvatarFallback>
                </Avatar>
            )}

            <div className="flex-1 overflow-hidden">
                <div className="flex items-start gap-2">
                    <div className="flex-1">
                        <p className="text-sm leading-tight">
                            <span className="font-medium">{notification.title}</span>
                        </p>
                        {notification.content && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {notification.content}
                            </p>
                        )}
                    </div>
                    {!notification.is_read && (
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
            </div>
        </button>
    );
}
