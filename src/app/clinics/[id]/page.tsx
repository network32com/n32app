import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Building2, MapPin, Phone, Mail, Globe, Edit } from 'lucide-react';

interface ClinicPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClinicPage({ params }: ClinicPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get clinic details
  const { data: clinic, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !clinic) {
    redirect('/clinics');
  }

  const isOwner = clinic.owner_id === user.id;

  return (
    <DashboardLayout currentPath="/clinics">
      {/* Clinic Header Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Logo */}
            <Avatar className="h-24 w-24 rounded-lg">
              <AvatarImage src={clinic.logo_url || undefined} alt={clinic.name} />
              <AvatarFallback className="text-2xl">
                <Building2 className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>

            {/* Clinic Info */}
            <div className="flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{clinic.name}</h1>
                  {clinic.location && (
                    <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{clinic.location}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isOwner && (
                  <Link href={`/clinics/${id}/edit`}>
                    <Button>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Clinic
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {clinic.description && (
            <div>
              <h3 className="mb-2 font-semibold">About</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">{clinic.description}</p>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="mb-3 font-semibold">Contact Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {clinic.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${clinic.phone}`} className="hover:underline">
                    {clinic.phone}
                  </a>
                </div>
              )}
              {clinic.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${clinic.email}`} className="hover:underline">
                    {clinic.email}
                  </a>
                </div>
              )}
              {clinic.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={clinic.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {clinic.website}
                  </a>
                </div>
              )}
              {clinic.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{clinic.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          {clinic.services && clinic.services.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold">Services Offered</h3>
              <div className="flex flex-wrap gap-2">
                {clinic.services.map((service: string, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Operating Hours */}
          {clinic.operating_hours && (
            <div>
              <h3 className="mb-3 font-semibold">Operating Hours</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {clinic.operating_hours}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members Section - Placeholder */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Team Members</h2>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Team member management coming soon</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
