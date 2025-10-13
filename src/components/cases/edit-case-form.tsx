'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PROCEDURE_TYPES } from '@/lib/shared/constants';
import { updateCase } from '@/lib/backend/actions/case';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Case, ProcedureType } from '@/lib/shared/types/database.types';

interface EditCaseFormProps {
  caseData: Case;
  userId: string;
}

export function EditCaseForm({ caseData, userId }: EditCaseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: caseData.title,
    case_notes: caseData.case_notes || '',
    procedure_type: caseData.procedure_type,
    tags: caseData.tags?.join(', ') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.procedure_type) {
      toast.error('Please select a procedure type');
      return;
    }

    try {
      setIsSubmitting(true);

      const updates = {
        title: formData.title.trim(),
        case_notes: formData.case_notes.trim() || undefined,
        procedure_type: formData.procedure_type,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      };

      await updateCase(caseData.id, userId, updates);
      
      toast.success('Case updated successfully');
      router.push(`/cases/${caseData.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating case:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update case');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Link href={`/cases/${caseData.id}`}>
        <Button type="button" variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Case
        </Button>
      </Link>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Case Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Full Mouth Rehabilitation with Implants"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedure_type">Procedure Type *</Label>
            <Select
              value={formData.procedure_type}
              onValueChange={(value) => setFormData({ ...formData, procedure_type: value as ProcedureType })}
              disabled={isSubmitting}
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

          <div className="space-y-2">
            <Label htmlFor="case_notes">Case Notes</Label>
            <Textarea
              id="case_notes"
              value={formData.case_notes}
              onChange={(e) => setFormData({ ...formData, case_notes: e.target.value })}
              placeholder="Describe the case, patient presentation, treatment approach, challenges, and outcomes..."
              rows={10}
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              Include details about the treatment, materials used, challenges faced, and outcomes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., implants, cosmetic, complex case"
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              Add tags to help others find your case. Separate tags with commas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Note about images */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> To update case images, you&apos;ll need to delete and recreate the case.
            Image editing will be available in a future update.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="min-w-32">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        <Link href={`/cases/${caseData.id}`}>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
