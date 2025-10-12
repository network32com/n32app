import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getForumThreads } from '@/lib/backend/actions/forum';
import { FORUM_CATEGORIES, getCategoryLabel, getCategoryColor } from '@/lib/shared/constants/forum';
import { Plus, MessageSquare, Eye, TrendingUp, Clock, Search } from 'lucide-react';
import { ForumFilters } from '@/components/forum/forum-filters';

interface ForumPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: 'latest' | 'trending';
    search?: string;
  }>;
}

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const category = params.category as any;
  const sortBy = (params.sort || 'latest') as 'latest' | 'trending';
  const searchQuery = params.search;

  const threads = await getForumThreads(category, sortBy, searchQuery);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout currentPath="/forum">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forum</h1>
          <p className="mt-2 text-muted-foreground">
            Connect with dental professionals and share knowledge
          </p>
        </div>
        <Link href="/forum/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Thread
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <ForumFilters currentCategory={category} currentSort={sortBy} currentSearch={searchQuery} />

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-950">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{threads.length}</p>
                <p className="text-sm text-muted-foreground">Active Threads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-950">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {threads.reduce((sum, t) => sum + t.replies_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Replies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-950">
                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {threads.reduce((sum, t) => sum + t.views_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thread List */}
      <div className="space-y-4">
        {threads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                {searchQuery
                  ? 'No threads found matching your search'
                  : category
                    ? 'No threads in this category yet'
                    : 'No threads yet. Be the first to start a discussion!'}
              </p>
              <Link href="/forum/create" className="mt-4 inline-block">
                <Button>Start a Discussion</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          threads.map((thread) => (
            <Link key={thread.id} href={`/forum/${thread.id}`}>
              <Card className="transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Author Avatar */}
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

                    {/* Thread Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <Badge className={getCategoryColor(thread.category)}>
                          {getCategoryLabel(thread.category)}
                        </Badge>
                        {thread.is_pinned && (
                          <Badge variant="outline" className="border-blue-500 text-blue-600">
                            Pinned
                          </Badge>
                        )}
                        {thread.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <h3 className="text-lg font-semibold line-clamp-1 hover:text-blue-600">
                        {thread.title}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {thread.body}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{thread.users?.full_name}</span>
                          {thread.users?.degree && (
                            <span className="text-xs">• {thread.users.degree}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{thread.replies_count} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{thread.views_count} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(thread.last_activity_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
