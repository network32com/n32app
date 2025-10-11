import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { getUserClinics } from '@/lib/backend/actions/clinic';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard">
            <h1 className="text-xl font-bold text-primary">Network32</h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl p-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Clinics</h1>
            <p className="mt-2 text-muted-foreground">Manage your clinic profiles</p>
          </div>
          <Link href="/clinics/create">
            <Button>Create Clinic</Button>
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
                      <Button variant="outline">View</Button>
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
      </main>
    </div>
  );
}
