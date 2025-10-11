import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getCase, hasSavedCase, incrementCaseViews } from '@/lib/backend/actions/case';
import { hasUserReportedCase } from '@/lib/backend/actions/report';
import { Eye, Bookmark, Calendar } from 'lucide-react';
import Image from 'next/image';
import { PROCEDURE_TYPES } from '@/lib/shared/constants';
import { SaveButton } from '@/components/cases/save-button';
import { ReportButton } from '@/components/cases/report-button';

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard">
            <h1 className="text-xl font-bold text-primary">Network32</h1>
          </Link>
          <div className="flex gap-2">
            <Link href="/cases">
              <Button variant="ghost">Back to Cases</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl p-4 py-8">
        {/* Title and Actions */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{caseData.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                {getProcedureLabel(caseData.procedure_type)}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{caseData.views_count} views</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Bookmark className="h-4 w-4" />
                <span>{caseData.saves_count} saves</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(caseData.created_at)}</span>
              </div>
            </div>
          </div>
          {!isOwner && (
            <div className="flex gap-2">
              <SaveButton caseId={id} userId={user.id} initialIsSaved={isSaved} />
              <ReportButton caseId={id} userId={user.id} hasReported={hasReported} />
            </div>
          )}
        </div>

        {/* Images */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={caseData.before_image_url}
                alt="Before"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <p className="text-center font-semibold">Before Treatment</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={caseData.after_image_url}
                alt="After"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <p className="text-center font-semibold">After Treatment</p>
            </CardContent>
          </Card>
        </div>

        {/* Case Notes */}
        {caseData.case_notes && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="mb-3 text-xl font-semibold">Case Notes</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">{caseData.case_notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {caseData.tags && caseData.tags.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="mb-3 text-xl font-semibold">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {caseData.tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Author Info */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold">About the Author</h2>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
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
                <h3 className="text-lg font-semibold">{caseData.users?.full_name}</h3>
                {caseData.users?.degree && (
                  <p className="text-sm text-muted-foreground">{caseData.users.degree}</p>
                )}
                {caseData.users?.specialty && (
                  <Badge variant="outline" className="mt-2">
                    {caseData.users.specialty.replace('_', ' ')}
                  </Badge>
                )}
                <div className="mt-4">
                  <Link href={`/profile/${caseData.user_id}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
