'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SPECIALTIES } from '@/lib/shared/constants';
import type { User, Specialty } from '@/lib/shared/types/database.types';
import { Upload, X } from 'lucide-react';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState<Partial<User>>({
    full_name: '',
    headline: '',
    degree: '',
    specialty: undefined,
    location: '',
    bio: '',
    profile_photo_url: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        setError('Failed to load profile');
      } else if (userData) {
        setProfile(userData);
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be less than 5MB');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const uploadPhoto = async (userId: string, file: File): Promise<string> => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`; // Changed to match RLS policy: userId/filename

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-photos').getPublicUrl(filePath);

    return publicUrl;
  };

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

      let photoUrl = profile.profile_photo_url;

      // Upload new photo if selected
      if (photoFile) {
        setUploadingPhoto(true);
        photoUrl = await uploadPhoto(user.id, photoFile);
        setUploadingPhoto(false);
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          headline: profile.headline,
          degree: profile.degree,
          specialty: profile.specialty,
          location: profile.location,
          bio: profile.bio,
          profile_photo_url: photoUrl,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push(`/profile/${user.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setSubmitting(false);
      setUploadingPhoto(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <ClientDashboardLayout currentPath="/profile">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout currentPath="/profile">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your professional information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo Upload */}
              <div className="space-y-4">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-6">
                  {/* Avatar Preview */}
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={photoPreview || profile.profile_photo_url || undefined}
                      alt={profile.full_name || 'Profile'}
                    />
                    <AvatarFallback className="text-2xl">
                      {profile.full_name ? getInitials(profile.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Upload Controls */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                          <Upload className="h-4 w-4" />
                          {photoPreview || profile.profile_photo_url ? 'Change Photo' : 'Upload Photo'}
                        </div>
                      </Label>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        disabled={submitting}
                      />
                      {(photoPreview || photoFile) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removePhoto}
                          disabled={submitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  value={profile.headline || ''}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  disabled={submitting}
                  placeholder="e.g., Cosmetic Dentist specializing in smile makeovers"
                />
              </div>

              {/* Degree */}
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  value={profile.degree || ''}
                  onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                  disabled={submitting}
                  placeholder="e.g., DDS, DMD, BDS"
                />
              </div>

              {/* Specialty */}
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={profile.specialty || ''}
                  onValueChange={(value) =>
                    setProfile({ ...profile, specialty: value as Specialty })
                  }
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  disabled={submitting}
                  placeholder="e.g., New York, NY"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={submitting}
                  rows={4}
                  placeholder="Tell us about yourself and your practice..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
                  Profile updated successfully! Redirecting...
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting || uploadingPhoto}>
                  {uploadingPhoto
                    ? 'Uploading Photo...'
                    : submitting
                      ? 'Saving...'
                      : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={submitting || uploadingPhoto}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
}
