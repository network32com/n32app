import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { FileText, Eye, Bookmark, UserPlus } from 'lucide-react';
import { getUserCases, getSavedCases } from '@/lib/backend/actions/case';
import { getFollowerCount, getFollowingCount } from '@/lib/backend/actions/profile';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userData || !userData.onboarding_completed) {
    redirect('/onboarding');
  }

  // Fetch user stats
  const [userCases, savedCases, followerCount, followingCount] = await Promise.all([
    getUserCases(user.id),
    getSavedCases(user.id),
    getFollowerCount(user.id),
    getFollowingCount(user.id),
  ]);

  const totalViews = userCases.reduce((sum, c) => sum + (c.views_count || 0), 0);

  return (
    <DashboardLayout currentPath="/dashboard">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="mt-2 text-muted-foreground">
              Welcome to your Network32 dashboard. Here&apos;s your activity overview.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Cases Shared */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cases Shared</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userCases.length}</div>
                <p className="text-xs text-muted-foreground">
                  {userCases.length === 0 ? 'Share your first case' : 'Total cases published'}
                </p>
              </CardContent>
            </Card>

            {/* Total Views */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalViews}</div>
                <p className="text-xs text-muted-foreground">Views on your cases</p>
              </CardContent>
            </Card>

            {/* Followers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Followers</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{followerCount}</div>
                <p className="text-xs text-muted-foreground">
                  Following {followingCount} professionals
                </p>
              </CardContent>
            </Card>

            {/* Saved Cases */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saved Cases</CardTitle>
                <Bookmark className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savedCases.length}</div>
                <p className="text-xs text-muted-foreground">Cases bookmarked</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your professional profile</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/profile/edit">
                  <Button className="w-full">Edit Profile</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clinical Cases</CardTitle>
                <CardDescription>Share and view clinical cases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/cases">
                  <Button className="w-full" variant="outline">
                    Browse Cases
                  </Button>
                </Link>
                <Link href="/cases/create">
                  <Button className="w-full">Share a Case</Button>
                </Link>
              </CardContent>
            </Card>

            {userData.role === 'clinic_owner' && (
              <Card>
                <CardHeader>
                  <CardTitle>My Clinics</CardTitle>
                  <CardDescription>Manage your clinic profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/clinics">
                    <Button className="w-full">Manage Clinics</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Network</CardTitle>
                <CardDescription>Connect with other professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/profile/{user.id}">
                  <Button className="w-full">View My Profile</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
    </DashboardLayout>
  );
}
