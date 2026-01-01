'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { likeThread, unlikeThread } from '@/lib/backend/actions/forum';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ThreadLikeButtonProps {
    threadId: string;
    userId: string;
    initialLiked: boolean;
    initialCount: number;
}

export function ThreadLikeButton({
    threadId,
    userId,
    initialLiked,
    initialCount,
}: ThreadLikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggleLike = () => {
        startTransition(async () => {
            try {
                if (isLiked) {
                    await unlikeThread(threadId, userId);
                    setIsLiked(false);
                    setCount((prev) => Math.max(0, prev - 1));
                } else {
                    await likeThread(threadId, userId);
                    setIsLiked(true);
                    setCount((prev) => prev + 1);
                }
                router.refresh();
            } catch (error) {
                console.error('Failed to toggle like:', error);
            }
        });
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggleLike}
            disabled={isPending}
            className={cn(
                'gap-2',
                isLiked && 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:border-red-800'
            )}
        >
            <Heart
                className={cn('h-4 w-4', isLiked && 'fill-red-500 text-red-500')}
            />
            <span>{count}</span>
        </Button>
    );
}
