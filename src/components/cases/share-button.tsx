'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareCaseButtonProps {
    caseId: string;
    caseTitle: string;
    authorName?: string;
    procedureType?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ShareCaseButton({
    caseId,
    caseTitle,
    authorName,
    procedureType,
    size = 'icon'
}: ShareCaseButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/cases/${caseId}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    return (
        <Button
            variant="outline"
            size={size}
            aria-label={`Share case: ${caseTitle}`}
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
