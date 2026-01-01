import { createClient } from '@/lib/shared/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // On error, redirect to login with error message
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`);
    }

    // Check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      // Redirect based on onboarding status
      if (userData?.onboarding_completed) {
        return NextResponse.redirect(`${origin}/dashboard`);
      }
    }
  }

  // Default: redirect to onboarding for new users or users who haven't completed it
  return NextResponse.redirect(`${origin}/onboarding`);
}
