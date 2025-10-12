import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Share2,
  Eye,
  FileText,
  Users,
  Award,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

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

  // Fetch user's cases
  const { data: userCases } = await supabase
    .from('cases')
    .select('*')
    .eq('author_id', id)
    .order('created_at', { ascending: false })
    .limit(6);

  const totalViews = userCases?.reduce((sum, c) => sum + (c.views_count || 0), 0) || 0;

  const isOwnProfile = currentUser?.id === id;

  return (
    <DashboardLayout currentPath={`/profile/${id}`}>
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-blue-100 dark:border-blue-900">
              <AvatarImage src={profile.profile_photo_url || undefined} alt={profile.full_name} />
              <AvatarFallback className="text-3xl">
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
                  <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                  {profile.degree && (
                    <p className="mt-1 text-lg text-muted-foreground">{profile.degree}</p>
                  )}
                  {profile.headline && (
                    <p className="mt-2 text-muted-foreground">{profile.headline}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.specialty && (
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {profile.specialty.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    <Badge variant="secondary">{profile.role.replace(/_/g, ' ')}</Badge>
                  </div>
                  {profile.location && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <>
                      <Link href="/profile/edit">
                        <Button>Edit Profile</Button>
                      </Link>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : currentUser ? (
                    <>
                      <FollowButton
                        currentUserId={currentUser.id}
                        targetUserId={id}
                        initialIsFollowing={isUserFollowing}
                      />
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Link href="/auth/login">
                      <Button>Follow</Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <FileText className="h-4 w-4" />
                    <p className="text-xs font-medium">Cases</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{caseCount}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Users className="h-4 w-4" />
                    <p className="text-xs font-medium">Followers</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{followerCount}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Users className="h-4 w-4" />
                    <p className="text-xs font-medium">Following</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{followingCount}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Eye className="h-4 w-4" />
                    <p className="text-xs font-medium">Views</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{totalViews}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Clinical Cases</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* About Section */}
            {profile.bio && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                {!profile.email && !profile.phone && (
                  <p className="text-sm text-muted-foreground">No contact information available</p>
                )}
              </CardContent>
            </Card>

            {/* Education & Licensing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Education & Licensing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.degree && (
                  <div>
                    <p className="text-sm font-medium">Degree</p>
                    <p className="mt-1 text-sm text-muted-foreground">{profile.degree}</p>
                  </div>
                )}
                {profile.specialty && (
                  <div>
                    <p className="text-sm font-medium">Specialty</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {profile.specialty.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}
                {!profile.degree && !profile.specialty && (
                  <p className="text-sm text-muted-foreground">No education information available</p>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Globe className="mr-2 h-4 w-4" />
                    Website
                  </Button>
                  <p className="w-full text-sm text-muted-foreground">
                    {isOwnProfile ? 'Add social links in Edit Profile' : 'No social links available'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clinical Cases Tab */}
        <TabsContent value="cases" className="space-y-6">
          {caseCount === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No cases shared yet</p>
                {isOwnProfile && (
                  <Link href="/cases/create" className="mt-4 inline-block">
                    <Button>Share Your First Case</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userCases?.map((caseItem: any) => (
                <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                  <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-blue-600">
                        {caseItem.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {caseItem.views_count || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No certifications added yet</p>
              {isOwnProfile && (
                <Button className="mt-4" variant="outline">
                  Add Certification
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No achievements added yet</p>
              {isOwnProfile && (
                <Button className="mt-4" variant="outline">
                  Add Achievement
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
