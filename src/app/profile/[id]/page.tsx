import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import {
  getUserProfile,
  getFollowerCount,
  getFollowingCount,
  getCaseCount,
  isFollowing,
} from '@/lib/backend/actions/profile';
import { FollowButton } from '@/components/profile/follow-button';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  let profile;
  try {
    profile = await getUserProfile(id);
  } catch (error) {
    redirect('/dashboard');
  }

  const [followerCount, followingCount, caseCount, isUserFollowing] = await Promise.all([
    getFollowerCount(id),
    getFollowingCount(id),
    getCaseCount(id),
    currentUser ? isFollowing(currentUser.id, id) : Promise.resolve(false),
  ]);

  const isOwnProfile = currentUser?.id === id;

  return (
    <DashboardLayout currentPath={`/profile/${id}`}>
      {/* Profile Header Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.profile_photo_url || undefined} alt={profile.full_name} />
              <AvatarFallback className="text-2xl">
                {profile.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                  {profile.headline && (
                    <p className="mt-1 text-muted-foreground">{profile.headline}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">{profile.role.replace('_', ' ')}</Badge>
                    {profile.specialty && (
                      <Badge variant="outline">{profile.specialty.replace('_', ' ')}</Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Link href="/profile/edit">
                      <Button>Edit Profile</Button>
                    </Link>
                  ) : currentUser ? (
                    <FollowButton
                      currentUserId={currentUser.id}
                      targetUserId={id}
                      initialIsFollowing={isUserFollowing}
                    />
                  ) : (
                    <Link href="/auth/login">
                      <Button>Follow</Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 flex gap-6">
                <div>
                  <p className="text-2xl font-bold">{caseCount}</p>
                  <p className="text-sm text-muted-foreground">Cases</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{followerCount}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{followingCount}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Additional Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.degree && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Degree</p>
                <p className="mt-1">{profile.degree}</p>
              </div>
            )}
            {profile.location && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="mt-1">{profile.location}</p>
              </div>
            )}
          </div>

          {profile.bio && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">About</p>
              <p className="mt-2 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cases Section - Placeholder */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Clinical Cases</h2>
        {caseCount === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No cases shared yet</p>
              {isOwnProfile && (
                <Link href="/cases/create" className="mt-4 inline-block">
                  <Button>Share Your First Case</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <p className="text-muted-foreground">Cases will be displayed here</p>
        )}
      </div>
    </DashboardLayout>
  );
}
