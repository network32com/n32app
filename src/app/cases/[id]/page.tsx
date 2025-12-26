import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getCase, hasSavedCase, incrementCaseViews } from '@/lib/backend/actions/case';
import { hasUserReportedCase } from '@/lib/backend/actions/report';
import { Eye, Bookmark, Calendar, Tag, FileText, User, Edit } from 'lucide-react';
import Image from 'next/image';
import { PROCEDURE_TYPES } from '@/lib/shared/constants';
import { SaveButton } from '@/components/cases/save-button';
import { ReportButton } from '@/components/cases/report-button';
import { DeleteCaseButton } from '@/components/cases/delete-button';
import { ShareCaseButton } from '@/components/cases/share-button';
import { CaseNotesDisplay } from '@/components/cases/case-notes-display';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import type { Metadata } from 'next';

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

// Generate SEO metadata for sharing
export async function generateMetadata({ params }: CaseDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const caseData = await getCase(id);
    const procedureLabel = PROCEDURE_TYPES.find(p => p.value === caseData.procedure_type)?.label || caseData.procedure_type;

    const title = `${caseData.title} | Network32`;
    const description = `${procedureLabel} case by ${caseData.users?.full_name || 'a dental professional'} on Network32 - The Professional Network for Dentists`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        siteName: 'Network32',
        images: [
          {
            url: caseData.after_image_url,
            width: 1200,
            height: 630,
            alt: `${caseData.title} - After Treatment`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [caseData.after_image_url],
      },
    };
  } catch {
    return {
      title: 'Clinical Case | Network32',
      description: 'View clinical cases shared by dental professionals on Network32',
    };
  }
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  let caseData;
  try {
    caseData = await getCase(id);
    // Increment view count (fire and forget)
    incrementCaseViews(id);
  } catch (error) {
    redirect('/cases');
  }

  const [isSaved, hasReported] = await Promise.all([
    hasSavedCase(user.id, id),
    hasUserReportedCase(user.id, id),
  ]);
  const isOwner = caseData.user_id === user.id;

  const getProcedureLabel = (value: string) => {
    return PROCEDURE_TYPES.find((p) => p.value === value)?.label || value;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout currentPath="/cases">
      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {getProcedureLabel(caseData.procedure_type)}
                </Badge>
                {caseData.tags && caseData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {caseData.tags.slice(0, 3).map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {caseData.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{caseData.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <h1 className="mt-3 text-3xl font-bold">{caseData.title}</h1>

              {/* Stats */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">{caseData.views_count} views</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950">
                  <Bookmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">{caseData.saves_count} saves</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(caseData.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isOwner ? (
                <>
                  <Link href={`/cases/${id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteCaseButton caseId={id} userId={user.id} />
                </>
              ) : (
                <>
                  <SaveButton caseId={id} userId={user.id} initialIsSaved={isSaved} />
                  <ReportButton caseId={id} userId={user.id} hasReported={hasReported} />
                </>
              )}
              <ShareCaseButton
                caseId={id}
                caseTitle={caseData.title}
                authorName={caseData.users?.full_name}
                procedureType={getProcedureLabel(caseData.procedure_type)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Before & After Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Treatment Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Before Image */}
                <div className="space-y-3">
                  <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-border">
                    <Image
                      src={caseData.before_image_url}
                      alt="Before Treatment"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-sm font-semibold text-white">Before Treatment</p>
                    </div>
                  </div>
                </div>

                {/* After Image */}
                <div className="space-y-3">
                  <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-blue-500">
                    <Image
                      src={caseData.after_image_url}
                      alt="After Treatment"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600/90 to-transparent p-3">
                      <p className="text-sm font-semibold text-white">After Treatment</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Case Notes */}
          {caseData.case_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Case Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CaseNotesDisplay notes={caseData.case_notes} />
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {caseData.tags && caseData.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-blue-600" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {caseData.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Author Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                About the Author
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 rounded-lg border-2 border-blue-100 dark:border-blue-900">
                  <AvatarImage
                    src={caseData.users?.profile_photo_url || undefined}
                    alt={caseData.users?.full_name}
                  />
                  <AvatarFallback className="text-lg">
                    {caseData.users?.full_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{caseData.users?.full_name}</h3>
                  {caseData.users?.degree && (
                    <p className="text-sm text-muted-foreground">{caseData.users.degree}</p>
                  )}
                </div>
              </div>

              {caseData.users?.headline && (
                <p className="text-sm text-muted-foreground">{caseData.users.headline}</p>
              )}

              {caseData.users?.specialty && (
                <Badge variant="secondary" className="w-fit">
                  {caseData.users.specialty.replace(/_/g, ' ')}
                </Badge>
              )}

              {caseData.users?.location && (
                <p className="text-sm text-muted-foreground">📍 {caseData.users.location}</p>
              )}

              <Link href={`/profile/${caseData.user_id}`} className="block">
                <Button variant="outline" className="w-full">
                  View Full Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Case Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Procedure Type</span>
                <Badge variant="secondary">{getProcedureLabel(caseData.procedure_type)}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Published</span>
                <span className="text-sm font-medium">{formatDate(caseData.created_at)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Views</span>
                <span className="text-sm font-medium">{caseData.views_count}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Saves</span>
                <span className="text-sm font-medium">{caseData.saves_count}</span>
              </div>
            </CardContent>
          </Card>

          {/* Patient Consent Badge */}
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                <div className="rounded-full bg-green-600 p-1">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="font-medium">Patient Consent Verified</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
