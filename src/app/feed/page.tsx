'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';
import { getFeedItems, getSuggestedProfessionals, getTrendingProcedures, getActiveDiscussions, getRecentClinicActivity } from '@/lib/backend/actions/feed';
import { CaseCard } from '@/components/feed/case-card';
import { ThreadCard } from '@/components/feed/thread-card';
import { ClinicCard } from '@/components/feed/clinic-card';
import { ProfessionalCard } from '@/components/feed/professional-card';
import { Settings, TrendingUp, MessageSquare, Building2, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PROCEDURE_TYPES } from '@/lib/shared/constants';
import { getCategoryLabel } from '@/lib/shared/constants/forum';

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'cases' | 'threads' | 'clinics' | 'professionals'>('all');
  const [sort, setSort] = useState<'latest' | 'trending' | 'my_network'>('latest');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Sidebar data
  const [suggestedProfessionals, setSuggestedProfessionals] = useState<any[]>([]);
  const [trendingProcedures, setTrendingProcedures] = useState<any[]>([]);
  const [activeDiscussions, setActiveDiscussions] = useState<any[]>([]);
  const [recentClinics, setRecentClinics] = useState<any[]>([]);

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
      await loadFeed(user.id, true);
      await loadSidebarData(user.id);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (user) {
      setOffset(0);
      setFeedItems([]);
      loadFeed(user.id, true);
    }
  }, [filter, sort]);

  const loadFeed = async (userId: string, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const items = await getFeedItems(userId, filter, sort, 20, reset ? 0 : offset);
      
      if (reset) {
        setFeedItems(items);
      } else {
        setFeedItems([...feedItems, ...items]);
      }

      setHasMore(items.length === 20);
      setOffset(reset ? 20 : offset + 20);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadSidebarData = async (userId: string) => {
    try {
      const [professionals, procedures, discussions, clinics] = await Promise.all([
        getSuggestedProfessionals(userId),
        getTrendingProcedures(),
        getActiveDiscussions(),
        getRecentClinicActivity(),
      ]);

      setSuggestedProfessionals(professionals);
      setTrendingProcedures(procedures);
      setActiveDiscussions(discussions);
      setRecentClinics(clinics);
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    }
  };

  const getProcedureLabel = (value: string) => {
    return PROCEDURE_TYPES.find((p) => p.value === value)?.label || value;
  };

  if (loading) {
    return (
      <ClientDashboardLayout currentPath="/feed">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout currentPath="/feed">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Feed</h1>
          <p className="mt-2 text-muted-foreground">
            Stay updated with the latest from your network
          </p>
        </div>
        <Link href="/feed/settings">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Feed Settings
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Feed */}
        <div className="space-y-4 lg:col-span-2">
          {/* Filter Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'cases' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('cases')}
                  >
                    Cases
                  </Button>
                  <Button
                    variant={filter === 'threads' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('threads')}
                  >
                    Threads
                  </Button>
                  <Button
                    variant={filter === 'clinics' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('clinics')}
                  >
                    Clinics
                  </Button>
                  <Button
                    variant={filter === 'professionals' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('professionals')}
                  >
                    Professionals
                  </Button>
                </div>

                <Select value={sort} onValueChange={(value: any) => setSort(value)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="my_network">My Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Feed Items */}
          {feedItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No items to show. Try adjusting your filters or follow more professionals.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {feedItems.map((item) => {
                switch (item.type) {
                  case 'case':
                    return <CaseCard key={item.id} caseData={item.data} />;
                  case 'thread':
                    return <ThreadCard key={item.id} threadData={item.data} />;
                  case 'clinic':
                    return <ClinicCard key={item.id} clinicData={item.data} />;
                  case 'professional':
                    return <ProfessionalCard key={item.id} professionalData={item.data} />;
                  default:
                    return null;
                }
              })}

              {hasMore && (
                <div className="flex justify-center py-4">
                  <Button
                    onClick={() => loadFeed(user.id, false)}
                    disabled={loadingMore}
                    variant="outline"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Suggested Professionals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-blue-600" />
                Suggested Professionals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedProfessionals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No suggestions available</p>
              ) : (
                suggestedProfessionals.map((professional) => (
                  <Link
                    key={professional.id}
                    href={`/profile/${professional.id}`}
                    className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage
                        src={professional.profile_photo_url || undefined}
                        alt={professional.full_name}
                      />
                      <AvatarFallback className="text-xs">
                        {professional.full_name
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{professional.full_name}</p>
                      {professional.degree && (
                        <p className="text-xs text-muted-foreground truncate">
                          {professional.degree}
                        </p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Trending Procedures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Trending Procedures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trendingProcedures.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trending procedures</p>
              ) : (
                trendingProcedures.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
                  >
                    <span className="text-sm font-medium">
                      {getProcedureLabel(item.procedure)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Discussions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                Active Discussions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeDiscussions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active discussions</p>
              ) : (
                activeDiscussions.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/forum/${thread.id}`}
                    className="block rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <p className="text-sm font-medium line-clamp-2">{thread.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(thread.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {thread.replies_count} replies
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Clinic Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-orange-600" />
                Recent Clinic Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentClinics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                recentClinics.map((clinic) => (
                  <Link
                    key={clinic.id}
                    href={`/clinics/${clinic.id}`}
                    className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={clinic.logo_url || undefined} alt={clinic.name} />
                      <AvatarFallback>
                        <Building2 className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{clinic.name}</p>
                      {clinic.location && (
                        <p className="text-xs text-muted-foreground truncate">{clinic.location}</p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientDashboardLayout>
  );
}
