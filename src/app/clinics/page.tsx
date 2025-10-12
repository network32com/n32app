import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getUserClinics } from '@/lib/backend/actions/clinic';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Plus, Building2, MapPin, Users, Eye, Edit, ExternalLink } from 'lucide-react';

export default async function ClinicsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'clinic_owner') {
    redirect('/dashboard');
  }

  const clinics = await getUserClinics(user.id);

  return (
    <DashboardLayout currentPath="/clinics">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Clinics</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your clinic profiles and team members
          </p>
        </div>
        <Link href="/clinics/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Clinic
          </Button>
        </Link>
      </div>

      {clinics.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-blue-100 p-6 dark:bg-blue-950">
              <Building2 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">No clinics yet</h3>
            <p className="mt-2 max-w-sm text-center text-muted-foreground">
              Create your first clinic profile to start building your professional presence and
              managing your team.
            </p>
            <Link href="/clinics/create" className="mt-6">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Clinic
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clinics.map((clinic) => (
            <Card
              key={clinic.id}
              className="group overflow-hidden transition-all hover:shadow-lg"
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <Avatar className="h-16 w-16 rounded-lg border-2 border-blue-100 dark:border-blue-900">
                    <AvatarImage src={clinic.logo_url || undefined} alt={clinic.name} />
                    <AvatarFallback className="text-xl">
                      {clinic.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <Link href={`/clinics/${clinic.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div>
                  <CardTitle className="line-clamp-1">{clinic.name}</CardTitle>
                  {clinic.location && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{clinic.location}</span>
                    </div>
                  )}
                </div>

                {clinic.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {clinic.description}
                  </p>
                )}

                {clinic.services && clinic.services.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {clinic.services.slice(0, 3).map((service: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {clinic.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{clinic.services.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                    </div>
                    <p className="mt-1 text-lg font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Team</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Eye className="h-3 w-3" />
                    </div>
                    <p className="mt-1 text-lg font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                    </div>
                    <p className="mt-1 text-lg font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Cases</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/clinics/${clinic.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      View Clinic
                    </Button>
                  </Link>
                  <Link href={`/clinics/${clinic.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
