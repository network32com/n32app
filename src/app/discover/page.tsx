import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SearchBar } from '@/components/search/search-bar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Users, FileText, Building2, TrendingUp } from 'lucide-react';
import { getPopularTags } from '@/lib/backend/actions/search';
import { SPECIALTIES, PROCEDURE_TYPES } from '@/lib/shared/constants';

export default async function DiscoverPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const popularTags = await getPopularTags();

  // Get some featured users (most followed)
  const { data: featuredUsers } = await supabase
    .from('users')
    .select('id, full_name, headline, specialty, profile_photo_url, degree')
    .limit(6);

  return (
    <DashboardLayout currentPath="/discover">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Discover</h1>
        <p className="mt-2 text-muted-foreground">
          Search for professionals, cases, and clinics
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar />
      </div>

      {/* Quick Filters */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Browse by Specialty
            </CardTitle>
            <CardDescription>Find professionals by their expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.slice(0, 6).map((specialty) => (
                <Link key={specialty.value} href={`/discover/specialty/${specialty.value}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                    {specialty.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Browse by Procedure
            </CardTitle>
            <CardDescription>Explore cases by treatment type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PROCEDURE_TYPES.slice(0, 6).map((procedure) => (
                <Link key={procedure.value} href={`/discover/procedure/${procedure.value}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                    {procedure.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Tags
            </CardTitle>
            <CardDescription>Trending topics in the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularTags.slice(0, 8).map(({ tag, count }) => (
                <Link key={tag} href={`/discover/tag/${tag}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    {tag} ({count})
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Professionals */}
      {featuredUsers && featuredUsers.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Featured Professionals</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredUsers.map((professional: any) => (
              <Link key={professional.id} href={`/profile/${professional.id}`}>
                <Card className="transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={professional.profile_photo_url || undefined}
                          alt={professional.full_name}
                        />
                        <AvatarFallback>
                          {professional.full_name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{professional.full_name}</h3>
                        {professional.degree && (
                          <p className="text-sm text-muted-foreground">{professional.degree}</p>
                        )}
                        {professional.specialty && (
                          <Badge variant="outline" className="mt-2">
                            {professional.specialty.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {professional.headline && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {professional.headline}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
