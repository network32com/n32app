'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { updateForumThread } from '@/lib/backend/actions/forum';
import { getCategoryLabel } from '@/lib/shared/constants/forum';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import type { ForumThread } from '@/lib/shared/types/database.types';

interface EditThreadFormProps {
  thread: ForumThread;
  userId: string;
}

export function EditThreadForm({ thread, userId }: EditThreadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: thread.title,
    body: thread.body,
    tags: thread.tags || [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.body.trim()) {
      toast.error('Please enter thread content');
      return;
    }

    if (formData.title.length < 10) {
      toast.error('Title must be at least 10 characters');
      return;
    }

    if (formData.body.length < 20) {
      toast.error('Content must be at least 20 characters');
      return;
    }

    try {
      setIsSubmitting(true);

      const updates = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        tags: formData.tags,
      };

      await updateForumThread(thread.id, userId, updates);
      
      toast.success('Thread updated successfully');
      router.push(`/forum/${thread.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating thread:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update thread');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Link href={`/forum/${thread.id}`}>
        <Button type="button" variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Thread
        </Button>
      </Link>

      {/* Category Info (Read-only) */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Category:</span>
            <Badge variant="secondary">{getCategoryLabel(thread.category)}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Note: Category cannot be changed after thread creation.
          </p>
        </CardContent>
      </Card>

      {/* Thread Content */}
      <Card>
        <CardHeader>
          <CardTitle>Thread Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What's your question or topic?"
              required
              disabled={isSubmitting}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/200 characters (minimum 10)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Content *</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Provide details, context, and any relevant information..."
              rows={12}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {formData.body.length} characters (minimum 20)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag-input">Add Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., implants, endodontics"
                disabled={isSubmitting || formData.tags.length >= 5}
                maxLength={30}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || formData.tags.length >= 5 || isSubmitting}
                variant="outline"
              >
                Add
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Add up to 5 tags to help others find your thread. Press Enter or click Add.
            </p>
          </div>

          {/* Tag List */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isSubmitting}
                    className="ml-1 rounded-sm hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formatting Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Formatting Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Be clear and specific in your title</li>
            <li>• Provide context and relevant details in the body</li>
            <li>• Use proper grammar and punctuation</li>
            <li>• Be respectful and professional</li>
            <li>• Add relevant tags to increase visibility</li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="min-w-32">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        <Link href={`/forum/${thread.id}`}>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
