'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { saveCase, unsaveCase } from '@/lib/backend/actions/case';

interface SaveButtonProps {
  caseId: string;
  userId: string;
  initialIsSaved: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SaveButton({ caseId, userId, initialIsSaved, size = 'default' }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);

  const handleToggleSave = async () => {
    setLoading(true);
    try {
      if (isSaved) {
        await unsaveCase(userId, caseId);
        setIsSaved(false);
      } else {
        await saveCase(userId, caseId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleSave}
      disabled={loading}
      variant={isSaved ? 'default' : 'outline'}
      size={size}
    >
      <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      {loading ? 'Loading...' : isSaved ? 'Saved' : 'Save Case'}
    </Button>
  );
}
