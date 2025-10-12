'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { SPECIALTIES } from '@/lib/shared/constants';

export default function FeedSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Settings state
  const [showCases, setShowCases] = useState(true);
  const [showThreads, setShowThreads] = useState(true);
  const [showClinics, setShowClinics] = useState(true);
  const [showProfessionals, setShowProfessionals] = useState(true);
  const [showNetworkOnly, setShowNetworkOnly] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      await loadSettings(user.id);
    };

    checkAuth();
  }, [router]);

  const loadSettings = async (userId: string) => {
    // In a real implementation, load from database
    // For now, using localStorage
    const settings = localStorage.getItem(`feed_settings_${userId}`);
    if (settings) {
      const parsed = JSON.parse(settings);
      setShowCases(parsed.showCases ?? true);
      setShowThreads(parsed.showThreads ?? true);
      setShowClinics(parsed.showClinics ?? true);
      setShowProfessionals(parsed.showProfessionals ?? true);
      setShowNetworkOnly(parsed.showNetworkOnly ?? false);
      setSelectedSpecialties(parsed.selectedSpecialties ?? []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSuccess(false);

    try {
      const settings = {
        showCases,
        showThreads,
        showClinics,
        showProfessionals,
        showNetworkOnly,
        selectedSpecialties,
      };

      // In a real implementation, save to database
      localStorage.setItem(`feed_settings_${user.id}`, JSON.stringify(settings));

      setSuccess(true);
      setTimeout(() => {
        router.push('/feed');
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaving(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(selectedSpecialties.filter((s) => s !== specialty));
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  if (loading) {
    return (
      <ClientDashboardLayout currentPath="/feed">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout currentPath="/feed">
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/feed">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Feed Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Customize what you see in your personalized feed
          </p>
        </div>

        <div className="space-y-6">
          {/* Content Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Content Visibility</CardTitle>
              <CardDescription>Choose what types of content to show in your feed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-cases">Clinical Cases</Label>
                  <p className="text-sm text-muted-foreground">
                    Show clinical cases shared by professionals
                  </p>
                </div>
                <Switch id="show-cases" checked={showCases} onCheckedChange={setShowCases} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-threads">Forum Threads</Label>
                  <p className="text-sm text-muted-foreground">
                    Show discussions from the community forum
                  </p>
                </div>
                <Switch
                  id="show-threads"
                  checked={showThreads}
                  onCheckedChange={setShowThreads}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-clinics">Clinic Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Show new and updated clinic profiles
                  </p>
                </div>
                <Switch
                  id="show-clinics"
                  checked={showClinics}
                  onCheckedChange={setShowClinics}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-professionals">New Professionals</Label>
                  <p className="text-sm text-muted-foreground">
                    Show newly joined dental professionals
                  </p>
                </div>
                <Switch
                  id="show-professionals"
                  checked={showProfessionals}
                  onCheckedChange={setShowProfessionals}
                />
              </div>
            </CardContent>
          </Card>

          {/* Network Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Network Preferences</CardTitle>
              <CardDescription>Control content from your network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="network-only">Show Network Content Only</Label>
                  <p className="text-sm text-muted-foreground">
                    Only show content from professionals you follow
                  </p>
                </div>
                <Switch
                  id="network-only"
                  checked={showNetworkOnly}
                  onCheckedChange={setShowNetworkOnly}
                />
              </div>
            </CardContent>
          </Card>

          {/* Specialty Focus */}
          <Card>
            <CardHeader>
              <CardTitle>Specialty Focus</CardTitle>
              <CardDescription>
                Select specialties to prioritize in your feed (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((specialty) => (
                  <Badge
                    key={specialty.value}
                    variant={selectedSpecialties.includes(specialty.value) ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => toggleSpecialty(specialty.value)}
                  >
                    {specialty.label}
                  </Badge>
                ))}
              </div>
              {selectedSpecialties.length > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {selectedSpecialties.length} {selectedSpecialties.length === 1 ? 'specialty' : 'specialties'} selected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Success Message */}
          {success && (
            <div className="rounded-md bg-primary/10 p-4 text-sm text-primary">
              Settings saved successfully! Redirecting to feed...
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/feed')} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </ClientDashboardLayout>
  );
}
