import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { FileText, Eye, Bookmark, Users } from 'lucide-react';
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

  // Calculate profile completion
  const profileFields = [
    userData.full_name,
    userData.headline,
    userData.degree,
    userData.specialty,
    userData.location,
    userData.bio,
    userData.profile_photo_url,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  return (
    <DashboardLayout currentPath="/dashboard">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="mt-2 text-muted-foreground">
          Welcome to your Network32 dashboard. Here&apos;s your activity overview.
        </p>
      </div>

      {/* Top Overview Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Cases Shared */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cases Shared</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCases.length}</div>
            <p className="text-xs text-muted-foreground">Total cases published</p>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
              <Bookmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedCases.length}</div>
            <p className="text-xs text-muted-foreground">Cases bookmarked</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your professional profile</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
            </div>
            <Link href="/profile/edit" className="block">
              <Button className="w-full">Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Clinical Cases Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Clinical Cases</CardTitle>
            <CardDescription>Share and view clinical cases</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-2">
            <Link href="/cases" className="block">
              <Button className="w-full" variant="outline">
                Browse Cases
              </Button>
            </Link>
            <Link href="/cases/create" className="block">
              <Button className="w-full">Share a Case</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Network Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Network</CardTitle>
            <CardDescription>Connect with other professionals</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="text-sm">
              <span className="font-medium">{followerCount}</span>{' '}
              <span className="text-muted-foreground">
                {followerCount === 1 ? 'follower' : 'followers'}
              </span>
            </div>
            <div className="space-y-2">
              <Link href="/discover" className="block">
                <Button className="w-full" variant="outline">
                  Find Professionals
                </Button>
              </Link>
              <Link href={`/profile/${user.id}`} className="block">
                <Button className="w-full">View My Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
