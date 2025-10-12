'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Image as ImageIcon,
  Users,
  Plus,
  X,
} from 'lucide-react';

export default function EditClinicPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const clinicId = params.id as string;
  const tabParam = searchParams.get('tab');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(tabParam || 'basic');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    operating_hours: '',
  });

  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');

  useEffect(() => {
    const loadClinic = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: clinic, error: fetchError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .single();

      if (fetchError || !clinic) {
        setError('Failed to load clinic');
        setLoading(false);
        return;
      }

      // Check ownership
      if (clinic.owner_id !== user.id) {
        router.push('/clinics');
        return;
      }

      setFormData({
        name: clinic.name || '',
        description: clinic.description || '',
        location: clinic.location || '',
        address: clinic.address || '',
        phone: clinic.phone || '',
        email: clinic.email || '',
        website: clinic.website || '',
        operating_hours: clinic.operating_hours || '',
      });

      setServices(clinic.services || []);
      setLoading(false);
    };

    loadClinic();
  }, [clinicId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('clinics')
        .update({
          ...formData,
          services,
        })
        .eq('id', clinicId)
        .eq('owner_id', user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push(`/clinics/${clinicId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update clinic');
      setSubmitting(false);
    }
  };

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <ClientDashboardLayout currentPath="/clinics">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout currentPath="/clinics">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Clinic</h1>
        <p className="mt-2 text-muted-foreground">Update your clinic information and settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact & Location
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Services & Hours
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Media & Branding
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential details about your clinic</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Clinic Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={submitting}
                    placeholder="e.g., Smile Dental Clinic"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">City/Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    disabled={submitting}
                    placeholder="e.g., New York, NY"
                  />
                  <p className="text-xs text-muted-foreground">
                    City and state for quick reference
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">About Your Clinic</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={submitting}
                    rows={6}
                    placeholder="Tell patients about your clinic, your approach to dental care, and what makes you unique..."
                  />
                  <p className="text-xs text-muted-foreground">
                    A compelling description helps patients understand your practice
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/clinics/${clinicId}`)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact & Location Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact & Location</CardTitle>
                <CardDescription>How patients can reach and find you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Full Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={submitting}
                    placeholder="e.g., 123 Main St, Suite 100, New York, NY 10001"
                  />
                  <p className="text-xs text-muted-foreground">
                    Complete address including suite/unit number
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={submitting}
                      placeholder="e.g., (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={submitting}
                      placeholder="e.g., info@clinic.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={submitting}
                    placeholder="e.g., https://www.yourClinic.com"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/clinics/${clinicId}`)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services & Hours Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services & Operating Hours</CardTitle>
                <CardDescription>What you offer and when you're available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Services */}
                <div className="space-y-4">
                  <div>
                    <Label>Services Offered</Label>
                    <p className="text-xs text-muted-foreground">
                      Add services your clinic provides
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addService();
                        }
                      }}
                      placeholder="e.g., Teeth Whitening, Implants, Orthodontics"
                      disabled={submitting}
                    />
                    <Button
                      type="button"
                      onClick={addService}
                      disabled={submitting || !newService.trim()}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  {services.length > 0 && (
                    <div className="flex flex-wrap gap-2 rounded-lg border p-4">
                      {services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="gap-2 px-3 py-1">
                          {service}
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="hover:text-destructive"
                            disabled={submitting}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Operating Hours */}
                <div className="space-y-2">
                  <Label htmlFor="operating_hours">Operating Hours</Label>
                  <Textarea
                    id="operating_hours"
                    value={formData.operating_hours}
                    onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                    disabled={submitting}
                    rows={6}
                    placeholder="Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 2:00 PM&#10;Sunday: Closed"
                  />
                  <p className="text-xs text-muted-foreground">
                    List your operating hours for each day of the week
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/clinics/${clinicId}`)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media & Branding Tab */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Media & Branding</CardTitle>
                <CardDescription>Logo, photos, and visual identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Logo and photo upload coming soon
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    You'll be able to upload your clinic logo and photos
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/clinics/${clinicId}`)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error/Success Messages */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              <strong>Error:</strong> {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-primary/10 p-4 text-sm text-primary">
              Clinic updated successfully! Redirecting...
            </div>
          )}
        </form>
      </Tabs>
    </ClientDashboardLayout>
  );
}
