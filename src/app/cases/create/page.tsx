'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { PROCEDURE_TYPES } from '@/lib/shared/constants';
import { createCase, uploadCaseImage } from '@/lib/backend/actions/case';
import Link from 'next/link';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';

export default function CreateCasePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    procedure_type: '',
    case_notes: '',
    tags: '',
    patient_consent_given: false,
  });

  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'before' | 'after'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'before') {
        setBeforeImage(file);
        setBeforePreview(URL.createObjectURL(file));
      } else {
        setAfterImage(file);
        setAfterPreview(URL.createObjectURL(file));
      }
    }
  };

  const removeImage = (type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforeImage(null);
      setBeforePreview(null);
    } else {
      setAfterImage(null);
      setAfterPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validation
      if (!beforeImage || !afterImage) {
        throw new Error('Both before and after images are required');
      }

      if (!formData.patient_consent_given) {
        throw new Error('Patient consent is required');
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Upload images
      const [beforeUrl, afterUrl] = await Promise.all([
        uploadCaseImage(user.id, beforeImage, 'before'),
        uploadCaseImage(user.id, afterImage, 'after'),
      ]);

      // Create case
      const caseData = {
        title: formData.title,
        procedure_type: formData.procedure_type as any,
        case_notes: formData.case_notes || undefined,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
        patient_consent_given: true,
        consent_timestamp: new Date().toISOString(),
      };

      const newCase = await createCase(user.id, caseData);
      router.push(`/cases/${newCase.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create case');
      setSubmitting(false);
    }
  };

  return (
    <ClientDashboardLayout currentPath="/cases">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Share a Clinical Case</CardTitle>
            <CardDescription>
              Share your work with the dental community. All cases must have patient consent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Case Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={submitting}
                  placeholder="e.g., Full Mouth Rehabilitation with Implants"
                />
              </div>

              {/* Procedure Type */}
              <div className="space-y-2">
                <Label htmlFor="procedure_type">Procedure Type *</Label>
                <Select
                  value={formData.procedure_type}
                  onValueChange={(value) => setFormData({ ...formData, procedure_type: value })}
                  disabled={submitting}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select procedure type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROCEDURE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Images */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Before Image */}
                <div className="space-y-2">
                  <Label>Before Image *</Label>
                  {beforePreview ? (
                    <div className="relative aspect-square overflow-hidden rounded-lg border">
                      <Image
                        src={beforePreview}
                        alt="Before"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('before')}
                        className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">Upload Before</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'before')}
                        className="hidden"
                        disabled={submitting}
                      />
                    </label>
                  )}
                </div>

                {/* After Image */}
                <div className="space-y-2">
                  <Label>After Image *</Label>
                  {afterPreview ? (
                    <div className="relative aspect-square overflow-hidden rounded-lg border">
                      <Image
                        src={afterPreview}
                        alt="After"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('after')}
                        className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">Upload After</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'after')}
                        className="hidden"
                        disabled={submitting}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Case Notes */}
              <div className="space-y-2">
                <Label htmlFor="case_notes">Case Notes</Label>
                <Textarea
                  id="case_notes"
                  value={formData.case_notes}
                  onChange={(e) => setFormData({ ...formData, case_notes: e.target.value })}
                  disabled={submitting}
                  placeholder="Describe the case, treatment plan, challenges, outcomes..."
                  rows={6}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  disabled={submitting}
                  placeholder="e.g., implants, cosmetic, full-arch (comma separated)"
                />
                <p className="text-xs text-muted-foreground">
                  Add tags to help others find your case
                </p>
              </div>

              {/* Anonymization Guidelines */}
              <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                <h4 className="mb-2 font-semibold text-amber-900 dark:text-amber-100">
                  ⚠️ Patient Privacy Guidelines
                </h4>
                <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                  <li>• Remove all patient identifying information from images</li>
                  <li>• Ensure faces, tattoos, and unique features are not visible</li>
                  <li>• Do not include patient names, dates of birth, or medical record numbers</li>
                  <li>• Verify images meet HIPAA de-identification standards</li>
                </ul>
              </div>

              {/* Patient Consent */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={formData.patient_consent_given}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, patient_consent_given: checked as boolean })
                    }
                    disabled={submitting}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consent" className="cursor-pointer font-medium">
                      Patient Consent Required *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      I confirm that I have obtained proper patient consent to share these images
                      and information, and all patient identifying information has been removed.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Publishing...' : 'Publish Case'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={submitting}
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
