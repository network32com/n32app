import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getSavedCases } from '@/lib/backend/actions/case';
import { Eye, Bookmark } from 'lucide-react';
import Image from 'next/image';
import { PROCEDURE_TYPES } from '@/lib/shared/constants';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';

export default async function SavedCasesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const savedCases = await getSavedCases(user.id);

  const getProcedureLabel = (value: string) => {
    return PROCEDURE_TYPES.find((p) => p.value === value)?.label || value;
  };

  return (
    <DashboardLayout currentPath="/saved">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Saved Cases</h1>
        <p className="mt-2 text-muted-foreground">
          Cases you&apos;ve bookmarked for reference
        </p>
      </div>

      {savedCases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mb-4 mt-4 text-muted-foreground">You haven&apos;t saved any cases yet</p>
            <Link href="/cases">
              <Button>Browse Cases</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedCases.map((caseItem: any) => (
            <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
              <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                {/* Images */}
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
                  {/* Title */}
                  <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                    {caseItem.title}
                  </h3>

                  {/* Procedure Type */}
                  <Badge variant="secondary" className="mt-2">
                    {getProcedureLabel(caseItem.procedure_type)}
                  </Badge>

                  {/* Tags */}
                  {caseItem.tags && caseItem.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {caseItem.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {caseItem.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{caseItem.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Author */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={caseItem.users?.profile_photo_url || undefined}
                          alt={caseItem.users?.full_name}
                        />
                        <AvatarFallback>
                          {caseItem.users?.full_name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{caseItem.users?.full_name}</p>
                        {caseItem.users?.degree && (
                          <p className="text-xs text-muted-foreground">
                            {caseItem.users.degree}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{caseItem.views_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4 fill-current" />
                      <span>{caseItem.saves_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
