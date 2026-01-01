'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';
import { FORUM_CATEGORIES } from '@/lib/shared/constants/forum';
import { createForumThread, uploadForumImage } from '@/lib/backend/actions/forum';
import { ForumCategory } from '@/lib/shared/types/database.types';
import { ArrowLeft, Plus, X, ImagePlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CreateThreadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<ForumCategory>('general');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    if (imageUrls.length + files.length > 5) {
      setError('You can only add up to 5 images');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadForumImage(user.id, file)
      );
      const urls = await Promise.all(uploadPromises);
      setImageUrls([...imageUrls, ...urls]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      const thread = await createForumThread({
        title: title.trim(),
        body: body.trim(),
        category,
        tags,
        image_urls: imageUrls,
        author_id: user.id,
      });

      router.push(`/forum/${thread.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create thread');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ClientDashboardLayout currentPath="/forum">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout currentPath="/forum">
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/forum">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Start a New Discussion</h1>
          <p className="mt-2 text-muted-foreground">
            Share your knowledge, ask questions, or start a conversation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thread Details</CardTitle>
            <CardDescription>
              Provide clear and descriptive information to help others engage with your discussion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Best practices for root canal treatment"
                  required
                  disabled={submitting}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/200 characters
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as ForumCategory)}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORUM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div>
                          <div className="font-medium">{cat.label}</div>
                          <div className="text-xs text-muted-foreground">{cat.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label htmlFor="body">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share your thoughts, questions, or experiences in detail..."
                  rows={12}
                  required
                  disabled={submitting}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Be clear and descriptive. You can use line breaks for formatting.
                </p>
              </div>

              {/* Image Attachments */}
              <div className="space-y-2">
                <Label>Attachments (Optional)</Label>
                <div className="space-y-4">
                  {/* Image Preview Grid */}
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                          <Image
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                            disabled={submitting}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={submitting || uploadingImage || imageUrls.length >= 5}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting || uploadingImage || imageUrls.length >= 5}
                      className="gap-2"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-4 w-4" />
                          Add Images
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {imageUrls.length}/5 images
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add up to 5 images to illustrate your discussion.
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add a tag..."
                    disabled={submitting || tags.length >= 5}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    disabled={submitting || !tagInput.trim() || tags.length >= 5}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 rounded-lg border p-3">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-2 px-3 py-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="hover:text-destructive"
                          disabled={submitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Add up to 5 tags to help others find your discussion. Press Enter or click Add.
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting || !title.trim() || !body.trim()}>
                  {submitting ? 'Creating...' : 'Create Thread'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/forum')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
}
