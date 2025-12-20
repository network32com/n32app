'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Checkbox } from '@/components/ui/checkbox';
import { PROCEDURE_TYPES } from '@/lib/shared/constants';
import { createCase, uploadCaseImage } from '@/lib/backend/actions/case';
import { Upload, X, FileText, Image as ImageIcon, Tag, Shield, MapPin, Plus } from 'lucide-react';
import Image from 'next/image';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';

export default function CreateCasePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('basic');

    const [formData, setFormData] = useState({
        title: '',
        procedure_type: '',
        other_procedure_type: '',
        case_notes: '',
        tags: '',
        location: '',
        patient_consent_given: false,
        // Additional fields
        treatment_duration: '',
        materials_used: '',
        challenges: '',
        outcome: '',
    });

    const [beforeImage, setBeforeImage] = useState<File | null>(null);
    const [afterImage, setAfterImage] = useState<File | null>(null);
    const [beforePreview, setBeforePreview] = useState<string | null>(null);
    const [afterPreview, setAfterPreview] = useState<string | null>(null);
    const [accessoryImages, setAccessoryImages] = useState<File[]>([]);
    const [accessoryPreviews, setAccessoryPreviews] = useState<string[]>([]);

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'before' | 'after'
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setError('Image size must be less than 10MB');
                return;
            }

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

    const handleAccessoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles: File[] = [];
            const newPreviews: string[] = [];

            Array.from(files).forEach((file) => {
                if (file.size > 10 * 1024 * 1024) {
                    setError('Each image must be less than 10MB');
                    return;
                }
                newFiles.push(file);
                newPreviews.push(URL.createObjectURL(file));
            });

            setAccessoryImages([...accessoryImages, ...newFiles]);
            setAccessoryPreviews([...accessoryPreviews, ...newPreviews]);
        }
    };

    const removeAccessoryImage = (index: number) => {
        setAccessoryImages(accessoryImages.filter((_, i) => i !== index));
        setAccessoryPreviews(accessoryPreviews.filter((_, i) => i !== index));
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

            // Combine all notes into case_notes field
            let combinedNotes = formData.case_notes || '';

            if (formData.treatment_duration) {
                combinedNotes += `\n\n**Treatment Duration:** ${formData.treatment_duration}`;
            }
            if (formData.materials_used) {
                combinedNotes += `\n\n**Materials Used:** ${formData.materials_used}`;
            }
            if (formData.challenges) {
                combinedNotes += `\n\n**Challenges:** ${formData.challenges}`;
            }
            if (formData.outcome) {
                combinedNotes += `\n\n**Outcome:** ${formData.outcome}`;
            }

            // Upload accessory images if any
            let accessoryUrls: string[] = [];
            if (accessoryImages.length > 0) {
                accessoryUrls = await Promise.all(
                    accessoryImages.map((img, idx) =>
                        uploadCaseImage(user.id, img, `accessory-${idx}`)
                    )
                );
            }

            // Create case
            const caseData = {
                title: formData.title,
                procedure_type: formData.procedure_type as any,
                case_notes: combinedNotes.trim() || undefined,
                tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
                before_image_url: beforeUrl,
                after_image_url: afterUrl,
                accessory_photos: accessoryUrls.length > 0 ? accessoryUrls : undefined,
                location: formData.location || undefined,
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

    const canProceedToImages = formData.title && formData.procedure_type;
    const canProceedToDetails = canProceedToImages && beforeImage && afterImage;
    const canSubmit = canProceedToDetails && formData.patient_consent_given;

    return (
        <ClientDashboardLayout currentPath="/cases">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Share a Clinical Case</h1>
                <p className="mt-2 text-muted-foreground">
                    Share your work with the dental community. All cases must have patient consent.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="basic" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="images" className="flex items-center gap-2" disabled={!canProceedToImages}>
                        <ImageIcon className="h-4 w-4" />
                        Images
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2" disabled={!canProceedToImages}>
                        <Tag className="h-4 w-4" />
                        Details & Tags
                    </TabsTrigger>
                    <TabsTrigger value="consent" className="flex items-center gap-2" disabled={!canProceedToDetails}>
                        <Shield className="h-4 w-4" />
                        Consent & Privacy
                    </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                    {/* Basic Info Tab */}
                    <TabsContent value="basic">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Provide the essential details about your clinical case</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
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
                                    <p className="text-xs text-muted-foreground">
                                        Choose a clear, descriptive title for your case
                                    </p>
                                </div>

                                {/* Procedure Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="procedure_type">Procedure Type *</Label>
                                    <Select
                                        value={formData.procedure_type}
                                        onValueChange={(value) => setFormData({ ...formData, procedure_type: value, other_procedure_type: value === 'other' ? formData.other_procedure_type : '' })}
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

                                {/* Other Procedure Type Input */}
                                {formData.procedure_type === 'other' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="other_procedure_type">Specify Procedure Type *</Label>
                                        <Input
                                            id="other_procedure_type"
                                            value={formData.other_procedure_type}
                                            onChange={(e) => setFormData({ ...formData, other_procedure_type: e.target.value })}
                                            required
                                            disabled={submitting}
                                            placeholder="e.g., Laser Gum Treatment, TMJ Therapy"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Please describe the procedure type
                                        </p>
                                    </div>
                                )}

                                {/* Treatment Duration */}
                                <div className="space-y-2">
                                    <Label htmlFor="treatment_duration">Treatment Duration</Label>
                                    <Input
                                        id="treatment_duration"
                                        value={formData.treatment_duration}
                                        onChange={(e) => setFormData({ ...formData, treatment_duration: e.target.value })}
                                        disabled={submitting}
                                        placeholder="e.g., 6 months, 3 visits"
                                    />
                                </div>

                                {/* Location */}
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Case Location
                                    </Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        disabled={submitting}
                                        placeholder="e.g., New York, NY or Your Clinic Name"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Optional: Where was this procedure performed?
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('images')}
                                        disabled={!canProceedToImages}
                                    >
                                        Next: Upload Images
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Images Tab */}
                    <TabsContent value="images">
                        <Card>
                            <CardHeader>
                                <CardTitle>Before & After Images</CardTitle>
                                <CardDescription>Upload high-quality images showing the treatment results</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
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
                                                    className="absolute right-2 top-2 rounded-full bg-destructive p-2 text-destructive-foreground shadow-lg transition-transform hover:scale-110"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-3 py-1 text-sm font-medium text-white">
                                                    Before
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950">
                                                <Upload className="h-12 w-12 text-muted-foreground" />
                                                <span className="mt-3 text-sm font-medium text-muted-foreground">
                                                    Click to upload
                                                </span>
                                                <span className="mt-1 text-xs text-muted-foreground">
                                                    PNG, JPG up to 10MB
                                                </span>
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
                                                    className="absolute right-2 top-2 rounded-full bg-destructive p-2 text-destructive-foreground shadow-lg transition-transform hover:scale-110"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-3 py-1 text-sm font-medium text-white">
                                                    After
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950">
                                                <Upload className="h-12 w-12 text-muted-foreground" />
                                                <span className="mt-3 text-sm font-medium text-muted-foreground">
                                                    Click to upload
                                                </span>
                                                <span className="mt-1 text-xs text-muted-foreground">
                                                    PNG, JPG up to 10MB
                                                </span>
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

                                <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
                                    <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                                        💡 Image Tips
                                    </h4>
                                    <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                        <li>• Use high-resolution images for best quality</li>
                                        <li>• Ensure consistent lighting and angles</li>
                                        <li>• Remove any patient identifying information</li>
                                        <li>• Images should clearly show the treatment area</li>
                                    </ul>
                                </div>

                                {/* Accessory Photos Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base font-semibold">Additional Photos (Optional)</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Add X-rays, progress photos, or other supporting images
                                            </p>
                                        </div>
                                        <label>
                                            <Button type="button" variant="outline" size="sm" asChild>
                                                <span className="cursor-pointer">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Photos
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleAccessoryImageChange}
                                                        className="hidden"
                                                        disabled={submitting}
                                                    />
                                                </span>
                                            </Button>
                                        </label>
                                    </div>

                                    {accessoryPreviews.length > 0 && (
                                        <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
                                            {accessoryPreviews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square overflow-hidden rounded-lg border">
                                                    <Image
                                                        src={preview}
                                                        alt={`Accessory ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAccessoryImage(index)}
                                                        className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-lg transition-transform hover:scale-110"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setActiveTab('basic')}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('details')}
                                        disabled={!beforeImage || !afterImage}
                                    >
                                        Next: Add Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Details & Tags Tab */}
                    <TabsContent value="details">
                        <Card>
                            <CardHeader>
                                <CardTitle>Case Details & Tags</CardTitle>
                                <CardDescription>Provide additional information to help others learn from your case</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Case Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="case_notes">Case Notes</Label>
                                    <Textarea
                                        id="case_notes"
                                        value={formData.case_notes}
                                        onChange={(e) => setFormData({ ...formData, case_notes: e.target.value })}
                                        disabled={submitting}
                                        placeholder="Describe the case, treatment plan, and outcomes..."
                                        rows={6}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Share your clinical observations and treatment approach
                                    </p>
                                </div>

                                {/* Materials Used */}
                                <div className="space-y-2">
                                    <Label htmlFor="materials_used">Materials & Products Used</Label>
                                    <Textarea
                                        id="materials_used"
                                        value={formData.materials_used}
                                        onChange={(e) => setFormData({ ...formData, materials_used: e.target.value })}
                                        disabled={submitting}
                                        placeholder="List materials, products, or techniques used..."
                                        rows={3}
                                    />
                                </div>

                                {/* Challenges */}
                                <div className="space-y-2">
                                    <Label htmlFor="challenges">Challenges Encountered</Label>
                                    <Textarea
                                        id="challenges"
                                        value={formData.challenges}
                                        onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                                        disabled={submitting}
                                        placeholder="Describe any challenges and how you addressed them..."
                                        rows={3}
                                    />
                                </div>

                                {/* Outcome */}
                                <div className="space-y-2">
                                    <Label htmlFor="outcome">Treatment Outcome</Label>
                                    <Textarea
                                        id="outcome"
                                        value={formData.outcome}
                                        onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                                        disabled={submitting}
                                        placeholder="Describe the final outcome and patient satisfaction..."
                                        rows={3}
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
                                        placeholder="e.g., implants, cosmetic, full-arch, zirconia"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Add comma-separated tags to help others find your case
                                    </p>
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setActiveTab('images')}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('consent')}
                                    >
                                        Next: Consent & Privacy
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Consent & Privacy Tab */}
                    <TabsContent value="consent">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Consent & Privacy</CardTitle>
                                <CardDescription>Ensure compliance with privacy regulations and patient consent</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Privacy Guidelines */}
                                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-100">
                                        <Shield className="h-5 w-5" />
                                        Patient Privacy Guidelines
                                    </h4>
                                    <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>Remove all patient identifying information from images</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>Ensure faces, tattoos, and unique features are not visible</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>Do not include patient names, dates of birth, or medical record numbers</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>Verify images meet HIPAA de-identification standards</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>Obtain written patient consent before sharing any clinical images</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Patient Consent Checkbox */}
                                <div className="rounded-lg border-2 border-border bg-muted/50 p-6">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id="consent"
                                            checked={formData.patient_consent_given}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, patient_consent_given: checked as boolean })
                                            }
                                            disabled={submitting}
                                            className="mt-1"
                                        />
                                        <div className="space-y-2">
                                            <Label htmlFor="consent" className="cursor-pointer text-base font-semibold">
                                                Patient Consent Confirmation *
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                I confirm that I have obtained proper written patient consent to share these
                                                images and information for educational purposes. All patient identifying
                                                information has been removed in compliance with HIPAA and privacy regulations.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                                        <strong>Error:</strong> {error}
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setActiveTab('details')}
                                    >
                                        Back
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push('/dashboard')}
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={submitting || !canSubmit}>
                                            {submitting ? 'Publishing...' : 'Publish Case'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </form>
            </Tabs>
        </ClientDashboardLayout>
    );
}
