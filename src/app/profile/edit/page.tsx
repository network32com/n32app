'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SPECIALTIES, NAME_TITLES } from '@/lib/shared/constants';
import type { User, Specialty } from '@/lib/shared/types/database.types';
import { Upload, X, User as UserIcon, GraduationCap, Award, Plus, Trash2, Linkedin, Instagram, Twitter, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';

function ProfileEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(tabParam || 'basic');

  const [profile, setProfile] = useState<Partial<User>>({
    full_name: '',
    headline: '',
    degree: '',
    specialty: undefined,
    location: '',
    bio: '',
    profile_photo_url: '',
    contact_number: '',
    linkedin_url: '',
    instagram_url: '',
    twitter_url: '',
    facebook_url: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Separate name fields
  const [title, setTitle] = useState<string>('Dr.');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  // Education state
  const [education, setEducation] = useState([
    { institution: '', degree: '', year: '', field: '' },
  ]);

  // Certifications state
  const [certifications, setCertifications] = useState([
    { name: '', issuer: '', year: '', credential: '' },
  ]);

  // Achievements state
  const [achievements, setAchievements] = useState([
    { title: '', description: '', year: '' },
  ]);

  const [savingEducation, setSavingEducation] = useState(false);
  const [savingCertifications, setSavingCertifications] = useState(false);
  const [savingAchievements, setSavingAchievements] = useState(false);

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialProfile, setInitialProfile] = useState<Partial<User>>({});

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
        toast.error('Failed to load profile');
      } else if (userData) {
        setProfile(userData);
        setInitialProfile(userData); // Store initial state for comparison

        // Parse full_name into title, firstName, lastName
        if (userData.full_name) {
          const nameParts = userData.full_name.split(' ');
          const possibleTitle = nameParts[0];

          if (NAME_TITLES.some(t => t.value === possibleTitle)) {
            setTitle(possibleTitle);
            if (nameParts.length >= 3) {
              setFirstName(nameParts.slice(1, -1).join(' '));
              setLastName(nameParts[nameParts.length - 1]);
            } else if (nameParts.length === 2) {
              setFirstName(nameParts[1]);
              setLastName('');
            }
          } else {
            // No title prefix - default to Dr.
            setTitle('Dr.');
            if (nameParts.length >= 2) {
              setFirstName(nameParts.slice(0, -1).join(' '));
              setLastName(nameParts[nameParts.length - 1]);
            } else {
              setFirstName(nameParts[0]);
              setLastName('');
            }
          }
        }
      }

      // Load educations, certifications and achievements
      try {
        const { data: edus } = await supabase
          .from('user_educations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (edus && edus.length > 0) {
          setEducation(
            edus.map((e: any) => ({
              institution: e.institution || '',
              degree: e.degree || '',
              field: e.field || '',
              year: e.year || '',
            }))
          );
        }

        const { data: certs } = await supabase
          .from('user_certifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (certs && certs.length > 0) {
          setCertifications(
            certs.map((c: any) => ({
              name: c.name || '',
              issuer: c.issuer || '',
              year: c.year || '',
              credential: c.credential || '',
            }))
          );
        }

        const { data: achs } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (achs && achs.length > 0) {
          setAchievements(
            achs.map((a: any) => ({
              title: a.title || '',
              description: a.description || '',
              year: a.year || '',
            }))
          );
        }
      } catch (e) {
        // ignore, surfaces via UI tabs as empty
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  // Track changes to profile
  useEffect(() => {
    const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile) || photoFile !== null;
    setHasUnsavedChanges(hasChanges);
  }, [profile, photoFile, initialProfile]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    const filePath = `${userId}/${fileName}`;

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

      if (photoFile) {
        setUploadingPhoto(true);
        photoUrl = await uploadPhoto(user.id, photoFile);
        setUploadingPhoto(false);
      }

      // Compute full_name from title + first + last
      const computedFullName = `${title} ${firstName.trim()} ${lastName.trim()}`.trim();

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: computedFullName,
          headline: profile.headline,
          degree: profile.degree,
          specialty: profile.specialty,
          location: profile.location,
          bio: profile.bio,
          profile_photo_url: photoUrl,
          contact_number: profile.contact_number || null,
          linkedin_url: profile.linkedin_url,
          instagram_url: profile.instagram_url,
          twitter_url: profile.twitter_url,
          facebook_url: profile.facebook_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setHasUnsavedChanges(false); // Reset unsaved changes flag
      toast.success('Profile updated successfully!');
      setTimeout(() => {
        router.push(`/profile/${user.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
      setUploadingPhoto(false);
    }
  };

  // Education handlers
  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', year: '', field: '' }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  // Certification handlers
  const addCertification = () => {
    setCertifications([...certifications, { name: '', issuer: '', year: '', credential: '' }]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  // Achievement handlers
  const addAchievement = () => {
    setAchievements([...achievements, { title: '', description: '', year: '' }]);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const updateAchievement = (index: number, field: string, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const saveEducation = async () => {
    try {
      setSavingEducation(true);
      setError(null);
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error('Not authenticated');

      const { error: delError } = await supabase
        .from('user_educations')
        .delete()
        .eq('user_id', user.id);
      if (delError) throw delError;

      const rows = education
        .map((e) => ({
          user_id: user.id,
          institution: (e.institution || '').trim(),
          degree: e.degree?.trim() || null,
          field: e.field?.trim() || null,
          year: e.year?.trim() || null,
        }))
        .filter((e) => e.institution.length > 0);

      if (rows.length > 0) {
        const { error: insError } = await supabase.from('user_educations').insert(rows);
        if (insError) throw insError;
      }
      toast.success('Education saved');
    } catch (err: any) {
      setError(err.message || 'Failed to save education');
      toast.error(err.message || 'Failed to save education');
    } finally {
      setSavingEducation(false);
    }
  };

  const saveCertifications = async () => {
    try {
      setSavingCertifications(true);
      setError(null);
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error('Not authenticated');

      const { error: delError } = await supabase
        .from('user_certifications')
        .delete()
        .eq('user_id', user.id);
      if (delError) throw delError;

      const rows = certifications
        .map((c) => ({
          user_id: user.id,
          name: (c.name || '').trim(),
          issuer: c.issuer?.trim() || null,
          year: c.year?.trim() || null,
          credential: c.credential?.trim() || null,
        }))
        .filter((c) => c.name.length > 0);

      if (rows.length > 0) {
        const { error: insError } = await supabase.from('user_certifications').insert(rows);
        if (insError) throw insError;
      }
      toast.success('Certifications saved');
    } catch (err: any) {
      setError(err.message || 'Failed to save certifications');
      toast.error(err.message || 'Failed to save certifications');
    } finally {
      setSavingCertifications(false);
    }
  };

  const saveAchievements = async () => {
    try {
      setSavingAchievements(true);
      setError(null);
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error('Not authenticated');

      const { error: delError } = await supabase
        .from('user_achievements')
        .delete()
        .eq('user_id', user.id);
      if (delError) throw delError;

      const rows = achievements
        .map((a) => ({
          user_id: user.id,
          title: (a.title || '').trim(),
          description: a.description?.trim() || null,
          year: a.year?.trim() || null,
        }))
        .filter((a) => a.title.length > 0);

      if (rows.length > 0) {
        const { error: insError } = await supabase.from('user_achievements').insert(rows);
        if (insError) throw insError;
      }
      toast.success('Achievements saved');
    } catch (err: any) {
      setError(err.message || 'Failed to save achievements');
      toast.error(err.message || 'Failed to save achievements');
    } finally {
      setSavingAchievements(false);
    }
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Update your professional information and credentials
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal and professional details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Photo Upload */}
                <div className="space-y-4">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 rounded-lg">
                      <AvatarImage
                        src={photoPreview || profile.profile_photo_url || undefined}
                        alt={profile.full_name || 'Profile'}
                      />
                      <AvatarFallback className="text-2xl">
                        {profile.full_name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

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

                {/* Name Fields */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Your Name</Label>
                  <div className="grid gap-4 md:grid-cols-4">
                    {/* Title Dropdown */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Select value={title} onValueChange={setTitle} disabled={submitting}>
                        <SelectTrigger>
                          <SelectValue placeholder="Title" />
                        </SelectTrigger>
                        <SelectContent>
                          {NAME_TITLES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* First Name */}
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={submitting}
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Smith"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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

                  {/* Headline */}
                  <div className="space-y-2">
                    <Label htmlFor="headline">Professional Headline</Label>
                    <Input
                      id="headline"
                      value={profile.headline || ''}
                      onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                      disabled={submitting}
                      placeholder="e.g., Cosmetic Dentist"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <PhoneInput
                    id="contact_number"
                    value={profile.contact_number || ''}
                    onChange={(value) => setProfile({ ...profile, contact_number: value })}
                    disabled={submitting}
                    placeholder="Phone number"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be visible on your profile to help colleagues reach you.
                  </p>
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

                {/* Social Links */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Social Links</Label>
                  <p className="text-sm text-muted-foreground">
                    Connect with colleagues by sharing your professional profiles
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Linkedin className="h-5 w-5 text-[#0077B5]" />
                      <Input
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={profile.linkedin_url || ''}
                        onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                        disabled={submitting}
                        className="flex-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                      <Input
                        placeholder="https://twitter.com/yourhandle"
                        value={profile.twitter_url || ''}
                        onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                        disabled={submitting}
                        className="flex-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Instagram className="h-5 w-5 text-[#E4405F]" />
                      <Input
                        placeholder="https://instagram.com/yourhandle"
                        value={profile.instagram_url || ''}
                        onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                        disabled={submitting}
                        className="flex-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Facebook className="h-5 w-5 text-[#1877F2]" />
                      <Input
                        placeholder="https://facebook.com/yourprofile"
                        value={profile.facebook_url || ''}
                        onChange={(e) => setProfile({ ...profile, facebook_url: e.target.value })}
                        disabled={submitting}
                        className="flex-1"
                      />
                    </div>
                  </div>
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
                    onClick={() => router.back()}
                    disabled={submitting || uploadingPhoto}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Add your educational background and qualifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {education.map((edu, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Education {index + 1}</h4>
                        {education.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            placeholder="e.g., Harvard School of Dental Medicine"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            placeholder="e.g., Doctor of Dental Medicine"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Field of Study</Label>
                          <Input
                            value={edu.field}
                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                            placeholder="e.g., Orthodontics"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input
                            value={edu.year}
                            onChange={(e) => updateEducation(index, 'year', e.target.value)}
                            placeholder="e.g., 2020"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" onClick={addEducation} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Education
              </Button>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveEducation} disabled={savingEducation}>
                  {savingEducation ? 'Saving...' : 'Save Education'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>Add your professional certifications and licenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {certifications.map((cert, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Certification {index + 1}</h4>
                        {certifications.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCertification(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Certification Name</Label>
                          <Input
                            value={cert.name}
                            onChange={(e) => updateCertification(index, 'name', e.target.value)}
                            placeholder="e.g., Board Certified Orthodontist"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Issuing Organization</Label>
                          <Input
                            value={cert.issuer}
                            onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                            placeholder="e.g., American Board of Orthodontics"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year Obtained</Label>
                          <Input
                            value={cert.year}
                            onChange={(e) => updateCertification(index, 'year', e.target.value)}
                            placeholder="e.g., 2021"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Credential ID (Optional)</Label>
                          <Input
                            value={cert.credential}
                            onChange={(e) => updateCertification(index, 'credential', e.target.value)}
                            placeholder="e.g., ABC123456"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" onClick={addCertification} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Certification
              </Button>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveCertifications} disabled={savingCertifications}>
                  {savingCertifications ? 'Saving...' : 'Save Certifications'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Showcase your professional accomplishments and awards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Achievement {index + 1}</h4>
                        {achievements.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAchievement(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Achievement Title</Label>
                          <Input
                            value={achievement.title}
                            onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                            placeholder="e.g., Best Dentist Award 2023"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={achievement.description}
                            onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                            placeholder="Describe your achievement..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input
                            value={achievement.year}
                            onChange={(e) => updateAchievement(index, 'year', e.target.value)}
                            placeholder="e.g., 2023"
                            className="md:w-1/2"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" onClick={addAchievement} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Achievement
              </Button>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveAchievements} disabled={savingAchievements}>
                  {savingAchievements ? 'Saving...' : 'Save Achievements'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ClientDashboardLayout>
  );
}

export default function ProfileEditPage() {
  return (
    <Suspense fallback={
      <ClientDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </ClientDashboardLayout>
    }>
      <ProfileEditContent />
    </Suspense>
  );
}
