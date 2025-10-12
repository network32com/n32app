'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createForumReply } from '@/lib/backend/actions/forum';

interface ReplyFormProps {
  threadId: string;
  userId: string;
  parentReplyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReplyForm({ threadId, userId, parentReplyId, onSuccess, onCancel }: ReplyFormProps) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await createForumReply({
        thread_id: threadId,
        author_id: userId,
        body: body.trim(),
        parent_reply_id: parentReplyId,
      });

      setBody('');
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to post reply');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentReplyId ? 'Write your reply...' : 'Share your thoughts...'}
        rows={parentReplyId ? 3 : 5}
        disabled={submitting}
        className="resize-none"
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting || !body.trim()}>
          {submitting ? 'Posting...' : parentReplyId ? 'Reply' : 'Post Reply'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
