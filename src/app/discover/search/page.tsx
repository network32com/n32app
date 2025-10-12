import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SearchBar } from '@/components/search/search-bar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { globalSearch } from '@/lib/backend/actions/search';
import { Eye, Bookmark, Users, FileText, Building2 } from 'lucide-react';
import Image from 'next/image';
import { PROCEDURE_TYPES } from '@/lib/shared/constants';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const query = params.q || '';
  const results = query ? await globalSearch(query) : { users: [], cases: [], clinics: [] };

  const totalResults = results.users.length + results.cases.length + results.clinics.length;

  const getProcedureLabel = (value: string) => {
    return PROCEDURE_TYPES.find((p) => p.value === value)?.label || value;
  };

  return (
    <DashboardLayout currentPath="/discover">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Search Results</h1>
        {query && (
          <p className="mt-2 text-muted-foreground">
            Found {totalResults} results for &quot;{query}&quot;
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar />
      </div>

      {!query ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Enter a search query to find results</p>
          </CardContent>
        </Card>
      ) : totalResults === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try different keywords or browse by category
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              All ({totalResults})
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Professionals ({results.users.length})
            </TabsTrigger>
            <TabsTrigger value="cases">
              <FileText className="mr-2 h-4 w-4" />
              Cases ({results.cases.length})
            </TabsTrigger>
            <TabsTrigger value="clinics">
              <Building2 className="mr-2 h-4 w-4" />
              Clinics ({results.clinics.length})
            </TabsTrigger>
          </TabsList>

          {/* All Results */}
          <TabsContent value="all" className="space-y-6">
            {results.users.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">Professionals</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.users.slice(0, 6).map((professional: any) => (
                    <Link key={professional.id} href={`/profile/${professional.id}`}>
                      <Card className="transition-shadow hover:shadow-lg">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12 rounded-lg">
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
                                <Badge variant="outline" className="mt-1">
                                  {professional.specialty.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.cases.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">Cases</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.cases.slice(0, 6).map((caseItem: any) => (
                    <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <div className="grid h-full grid-cols-2">
                            <div className="relative">
                              <Image
                                src={caseItem.before_image_url}
                                alt="Before"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="relative">
                              <Image
                                src={caseItem.after_image_url}
                                alt="After"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="line-clamp-1 font-semibold group-hover:text-primary">
                            {caseItem.title}
                          </h3>
                          <Badge variant="secondary" className="mt-2">
                            {getProcedureLabel(caseItem.procedure_type)}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.clinics.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">Clinics</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.clinics.slice(0, 6).map((clinic: any) => (
                    <Card key={clinic.id} className="transition-shadow hover:shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 rounded-lg">
                            <AvatarImage src={clinic.logo_url || undefined} alt={clinic.name} />
                            <AvatarFallback>
                              {clinic.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{clinic.name}</h3>
                            <p className="text-sm text-muted-foreground">{clinic.location}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.users.map((professional: any) => (
                <Link key={professional.id} href={`/profile/${professional.id}`}>
                  <Card className="transition-shadow hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 rounded-lg">
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
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.cases.map((caseItem: any) => (
                <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                  <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <div className="grid h-full grid-cols-2">
                        <div className="relative">
                          <Image
                            src={caseItem.before_image_url}
                            alt="Before"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                            Before
                          </div>
                        </div>
                        <div className="relative">
                          <Image
                            src={caseItem.after_image_url}
                            alt="After"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                            After
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                        {caseItem.title}
                      </h3>
                      <Badge variant="secondary" className="mt-2">
                        {getProcedureLabel(caseItem.procedure_type)}
                      </Badge>
                      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{caseItem.views_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bookmark className="h-4 w-4" />
                          <span>{caseItem.saves_count}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Clinics Tab */}
          <TabsContent value="clinics">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.clinics.map((clinic: any) => (
                <Card key={clinic.id} className="transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 rounded-lg">
                        <AvatarImage src={clinic.logo_url || undefined} alt={clinic.name} />
                        <AvatarFallback>
                          {clinic.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{clinic.name}</h3>
                        <p className="text-sm text-muted-foreground">{clinic.location}</p>
                        {clinic.description && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {clinic.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
}
