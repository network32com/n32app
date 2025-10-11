import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { getUserClinics } from '@/lib/backend/actions/clinic';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Plus } from 'lucide-react';

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
            <p className="mt-2 text-muted-foreground">Manage your clinic profiles</p>
          </div>
          <Link href="/clinics/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Clinic
            </Button>
          </Link>
        </div>

        {clinics.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">You haven&apos;t created any clinics yet</p>
              <Link href="/clinics/create">
                <Button>Create Your First Clinic</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {clinics.map((clinic) => (
              <Card key={clinic.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={clinic.logo_url || undefined} alt={clinic.name} />
                      <AvatarFallback>
                        {clinic.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle>{clinic.name}</CardTitle>
                      <CardDescription className="mt-1">{clinic.location}</CardDescription>
                      {clinic.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{clinic.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={`/clinics/${clinic.id}`}>
                      <Button>View Clinic</Button>
                    </Link>
                    <Link href={`/clinics/${clinic.id}/edit`}>
                      <Button variant="outline">Edit</Button>
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
