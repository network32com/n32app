'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareProfileButtonProps {
    userId: string;
    userName: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ShareProfileButton({ userId, userName, size = 'icon' }: ShareProfileButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/profile/${userId}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Profile link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    return (
        <Button
            variant="outline"
            size={size}
            aria-label={`Share profile: ${userName}`}
            onClick={handleShare}
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-600" />
            ) : (
                <Share2 className="h-4 w-4" />
            )}
        </Button>
    );
}
