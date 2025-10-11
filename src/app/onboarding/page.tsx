'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { USER_ROLES } from '@/lib/shared/constants';
import type { UserRole } from '@/lib/shared/types/database.types';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');

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

      setUserId(user.id);
      setUserEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || '');

      // Check if user already has a profile
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingUser?.onboarding_completed) {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async () => {
    if (!selectedRole || !termsAccepted) {
      setError('Please select a role and accept the terms');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Create or update user profile
      const { error: upsertError } = await supabase.from('users').upsert(
        {
          id: userId!,
          email: userEmail!,
          full_name: fullName,
          role: selectedRole,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          onboarding_completed: true,
        },
        {
          onConflict: 'id',
        }
      );

      if (upsertError) throw upsertError;

      // Redirect to profile setup
      router.push('/profile/edit');
    } catch (err: any) {
      setError(err.message || 'An error occurred during onboarding');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to Network32</CardTitle>
          <CardDescription>
            Let&apos;s set up your account. Choose your role to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Your Role</Label>
            <div className="grid gap-4 md:grid-cols-2">
              {USER_ROLES.map((role) => (
                <Card
                  key={role.value}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedRole === role.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedRole(role.value as UserRole)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`mt-1 h-5 w-5 rounded-full border-2 ${
                          selectedRole === role.value
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedRole === role.value && (
                          <div className="flex h-full items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{role.label}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {role.value === 'dentist'
                            ? 'Share clinical cases, connect with peers, and grow your professional network'
                            : 'Manage your clinic profile, invite team members, and showcase your practice'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <Label className="text-base font-semibold">Terms and Privacy</Label>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <div className="flex-1">
                <label
                  htmlFor="terms"
                  className="cursor-pointer text-sm leading-relaxed text-foreground"
                >
                  I agree to the{' '}
                  <a href="/terms" className="text-primary hover:underline" target="_blank">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-primary hover:underline" target="_blank">
                    Privacy Policy
                  </a>
                  . I understand that all clinical cases must have proper patient consent and be
                  de-identified in accordance with HIPAA guidelines.
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!selectedRole || !termsAccepted || submitting}
          >
            {submitting ? 'Setting up your account...' : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
