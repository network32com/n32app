import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit,
  Users,
  Image as ImageIcon,
  FileText,
  Clock,
  Share2,
  UserPlus,
} from 'lucide-react';

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
      {/* Clinic Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Logo */}
            <Avatar className="h-32 w-32 rounded-lg border-4 border-blue-100 dark:border-blue-900">
              <AvatarImage src={clinic.logo_url || undefined} alt={clinic.name} />
              <AvatarFallback className="text-3xl">
                <Building2 className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>

            {/* Clinic Info */}
            <div className="flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{clinic.name}</h1>
                  {clinic.location && (
                    <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{clinic.location}</span>
                    </div>
                  )}
                  {clinic.services && clinic.services.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {clinic.services.slice(0, 4).map((service: string, idx: number) => (
                        <Badge
                          key={idx}
                          className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        >
                          {service}
                        </Badge>
                      ))}
                      {clinic.services.length > 4 && (
                        <Badge variant="secondary">+{clinic.services.length - 4} more</Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwner ? (
                    <>
                      <Link href={`/clinics/${id}/edit`}>
                        <Button className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Clinic
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Users className="h-4 w-4" />
                    <p className="text-xs font-medium">Team</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">0</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <FileText className="h-4 w-4" />
                    <p className="text-xs font-medium">Cases</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">0</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <ImageIcon className="h-4 w-4" />
                    <p className="text-xs font-medium">Photos</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">0</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Users className="h-4 w-4" />
                    <p className="text-xs font-medium">Followers</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">0</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* About Section */}
            {clinic.description && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">{clinic.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clinic.phone && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a href={`tel:${clinic.phone}`} className="text-sm font-medium hover:underline">
                        {clinic.phone}
                      </a>
                    </div>
                  </div>
                )}
                {clinic.email && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a href={`mailto:${clinic.email}`} className="text-sm font-medium hover:underline">
                        {clinic.email}
                      </a>
                    </div>
                  </div>
                )}
                {clinic.website && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a
                        href={clinic.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline"
                      >
                        {clinic.website}
                      </a>
                    </div>
                  </div>
                )}
                {clinic.address && (
                  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                    <MapPin className="mt-1 h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium leading-relaxed">{clinic.address}</p>
                    </div>
                  </div>
                )}
                {!clinic.phone && !clinic.email && !clinic.website && !clinic.address && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      {isOwner
                        ? 'No contact information added. Edit your clinic to add details.'
                        : 'No contact information available'}
                    </p>
                    {isOwner && (
                      <Link href={`/clinics/${id}/edit`} className="mt-3 inline-block">
                        <Button variant="outline" size="sm">
                          Add Contact Info
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clinic.operating_hours ? (
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {clinic.operating_hours}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      {isOwner
                        ? 'No operating hours set. Edit your clinic to add hours.'
                        : 'Operating hours not available'}
                    </p>
                    {isOwner && (
                      <Link href={`/clinics/${id}/edit`} className="mt-3 inline-block">
                        <Button variant="outline" size="sm">
                          Add Hours
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Services Offered
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clinic.services && clinic.services.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {clinic.services.map((service: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1">
                        {service}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      {isOwner
                        ? 'No services added yet. Edit your clinic to add services.'
                        : 'No services listed'}
                    </p>
                    {isOwner && (
                      <Link href={`/clinics/${id}/edit`} className="mt-3 inline-block">
                        <Button variant="outline" size="sm">
                          Add Services
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No team members yet</p>
              {isOwner && (
                <Button className="mt-4 gap-2" variant="outline">
                  <UserPlus className="h-4 w-4" />
                  Invite Team Member
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No photos added yet</p>
              {isOwner && (
                <Button className="mt-4" variant="outline">
                  Add Photos
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cases Tab */}
        <TabsContent value="cases" className="space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No cases shared yet</p>
              {isOwner && (
                <Link href="/cases/create" className="mt-4 inline-block">
                  <Button>Share First Case</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
