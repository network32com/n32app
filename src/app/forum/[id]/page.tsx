import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getForumThread, getThreadReplies } from '@/lib/backend/actions/forum';
import { getCategoryLabel, getCategoryColor } from '@/lib/shared/constants/forum';
import { MessageSquare, Eye, Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import { ReplyForm } from '@/components/forum/reply-form';
import { ReplyItem } from '@/components/forum/reply-item';

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  let thread;
  let replies;

  try {
    [thread, replies] = await Promise.all([getForumThread(id), getThreadReplies(id)]);
  } catch (error) {
    redirect('/forum');
  }

  const isAuthor = thread.author_id === user.id;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout currentPath="/forum">
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/forum">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Thread Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={getCategoryColor(thread.category)}>
                  {getCategoryLabel(thread.category)}
                </Badge>
                {thread.is_pinned && (
                  <Badge variant="outline" className="border-blue-500 text-blue-600">
                    Pinned
                  </Badge>
                )}
                {thread.is_locked && (
                  <Badge variant="outline" className="border-red-500 text-red-600">
                    Locked
                  </Badge>
                )}
                {thread.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl font-bold mb-4">{thread.title}</h1>

              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage
                    src={thread.users?.profile_photo_url || undefined}
                    alt={thread.users?.full_name}
                  />
                  <AvatarFallback>
                    {thread.users?.full_name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${thread.author_id}`}
                      className="font-semibold hover:text-blue-600"
                    >
                      {thread.users?.full_name}
                    </Link>
                    {thread.users?.degree && (
                      <span className="text-sm text-muted-foreground">• {thread.users.degree}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(thread.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{thread.views_count} views</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap leading-relaxed">{thread.body}</p>
              </div>
            </CardContent>
          </Card>

          {/* Replies Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                {thread.replies_count} {thread.replies_count === 1 ? 'Reply' : 'Replies'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {replies.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No replies yet. Be the first to respond!</p>
                </div>
              ) : (
                replies.map((reply) => (
                  <ReplyItem key={reply.id} reply={reply} threadId={id} currentUserId={user.id} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Reply Form */}
          {!thread.is_locked && (
            <Card>
              <CardHeader>
                <CardTitle>Add Your Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <ReplyForm threadId={id} userId={user.id} />
              </CardContent>
            </Card>
          )}

          {thread.is_locked && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
              <CardContent className="p-4 text-center text-sm text-yellow-800 dark:text-yellow-200">
                This thread is locked. No new replies can be added.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-blue-600" />
                Thread Author
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-14 w-14 rounded-lg">
                  <AvatarImage
                    src={thread.users?.profile_photo_url || undefined}
                    alt={thread.users?.full_name}
                  />
                  <AvatarFallback>
                    {thread.users?.full_name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{thread.users?.full_name}</h3>
                  {thread.users?.degree && (
                    <p className="text-sm text-muted-foreground">{thread.users.degree}</p>
                  )}
                </div>
              </div>

              {thread.users?.headline && (
                <p className="text-sm text-muted-foreground">{thread.users.headline}</p>
              )}

              {thread.users?.location && (
                <p className="text-sm text-muted-foreground">📍 {thread.users.location}</p>
              )}

              <Link href={`/profile/${thread.author_id}`} className="block">
                <Button variant="outline" className="w-full" size="sm">
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Thread Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thread Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Replies</span>
                <span className="font-medium">{thread.replies_count}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Views</span>
                <span className="font-medium">{thread.views_count}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {new Date(thread.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Last Activity</span>
                <span className="text-sm font-medium">
                  {new Date(thread.last_activity_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
