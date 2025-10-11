import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { getAllReports, getReportStats } from '@/lib/backend/actions/report';
import { AlertCircle, CheckCircle, Clock, Flag } from 'lucide-react';
import Image from 'next/image';
import { ReportActions } from '@/components/admin/report-actions';

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check if user is admin (you can add an is_admin field to users table)
  // For now, we'll just check if they're authenticated
  // In production, add proper admin role checking

  const [allReports, stats] = await Promise.all([getAllReports(), getReportStats()]);

  const pendingReports = allReports.filter((r: any) => r.status === 'pending');
  const reviewedReports = allReports.filter((r: any) => r.status === 'reviewed');
  const resolvedReports = allReports.filter((r: any) => r.status === 'resolved');

  const getReasonLabel = (reason: string) => {
    return reason
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const ReportCard = ({ report }: { report: any }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Case Preview */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={report.case?.before_image_url || '/placeholder.png'}
              alt="Case preview"
              fill
              className="object-cover"
            />
          </div>

          {/* Report Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/cases/${report.case_id}`}
                  className="font-semibold hover:text-primary"
                >
                  {report.case?.title || 'Untitled Case'}
                </Link>
                <p className="text-sm text-muted-foreground">
                  Reported by {report.reporter?.full_name}
                </p>
              </div>
              <Badge
                variant={
                  report.status === 'pending'
                    ? 'default'
                    : report.status === 'reviewed'
                      ? 'secondary'
                      : 'outline'
                }
              >
                {report.status}
              </Badge>
            </div>

            <div>
              <Badge variant="destructive">{getReasonLabel(report.reason)}</Badge>
            </div>

            {report.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                {new Date(report.created_at).toLocaleDateString()}
              </p>
              <ReportActions reportId={report.id} currentStatus={report.status} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout currentPath="/admin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="mt-2 text-muted-foreground">Review and manage reported content</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewed}</div>
            <p className="text-xs text-muted-foreground">Being investigated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Action taken</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="reviewed">Under Review ({reviewedReports.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No pending reports</p>
              </CardContent>
            </Card>
          ) : (
            pendingReports.map((report: any) => <ReportCard key={report.id} report={report} />)
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No reports under review</p>
              </CardContent>
            </Card>
          ) : (
            reviewedReports.map((report: any) => <ReportCard key={report.id} report={report} />)
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No resolved reports</p>
              </CardContent>
            </Card>
          ) : (
            resolvedReports.map((report: any) => <ReportCard key={report.id} report={report} />)
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
