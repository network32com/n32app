import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  TrendingUp,
  Eye,
  Bookmark,
  UserPlus,
} from 'lucide-react';
import { getUserCases, getSavedCases } from '@/lib/backend/actions/case';
import { getFollowerCount, getFollowingCount } from '@/lib/backend/actions/profile';

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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/dashboard">
            <h1 className="text-xl font-bold text-primary">Network32</h1>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <Link href="/dashboard">
            <Button variant="secondary" className="w-full justify-start" size="sm">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/cases">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Clinical Cases
            </Button>
          </Link>
          <Link href="/profile/edit">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Users className="mr-2 h-4 w-4" />
              My Profile
            </Button>
          </Link>
          {userData.role === 'clinic_owner' && (
            <Link href="/clinics">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Building2 className="mr-2 h-4 w-4" />
                My Clinics
              </Button>
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-4 lg:hidden">
            <Link href="/dashboard">
              <h1 className="text-xl font-bold text-primary">Network32</h1>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {userData.full_name}</span>
            <form action="/auth/logout" method="POST">
              <Button type="submit" variant="outline" size="sm">
                Logout
              </Button>
            </form>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
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
        </main>
      </div>
    </div>
  );
}
