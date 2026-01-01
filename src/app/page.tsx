import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-primary">Network32</h1>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Join as a Dentist</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              A community space for dentists only
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              A place to share cases, learn from peers,<br />
              and grow your practice
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Network32 is where dentists share real work, ask honest questions, and learn from each other — without noise.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Create Your Profile
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Why Network32 */}
        <div className="bg-muted/40 py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Network32?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built by dentists who know what your day actually looks like
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-2 font-semibold">Built by Dentists</h3>
                <p className="text-sm text-muted-foreground">
                  Created by practitioners who understand your daily workflow
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-2 font-semibold">Peer Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Learn from real cases shared by colleagues nationwide
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-2 font-semibold">Privacy First</h3>
                <p className="text-sm text-muted-foreground">
                  Patient consent is required. Privacy comes first.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-2 font-semibold">Professional Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Pick up ideas, techniques, and connections over time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Connect & Grow</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform designed for modern dental professionals
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Share Clinical Cases</h3>
              <p className="text-muted-foreground text-center">
                Present your cases with before/after images, treatment notes, and outcomes.
                Build your portfolio while helping peers learn.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Discover Specialists</h3>
              <p className="text-muted-foreground text-center">
                Find and connect with specialists across all dental fields. See their work
                and expertise before making referrals.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Community Forums</h3>
              <p className="text-muted-foreground text-center">
                Discuss techniques, troubleshoot challenges, and share insights with peers
                in specialty-specific forums.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Build Your Network</h3>
              <p className="text-muted-foreground text-center">
                Follow colleagues, discover peers in your area, and expand your professional
                circle across specialties.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Clinic Management</h3>
              <p className="text-muted-foreground text-center">
                Connect your entire team, manage multiple locations, and build your clinic's
                professional presence.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Privacy-aware by Design</h3>
              <p className="text-muted-foreground text-center">
                Built with patient privacy in mind. Patient consent required for all shared
                cases and PHI protection built-in.
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-muted/40 py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Built for Every Dental Professional</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're a general dentist, specialist, or clinic owner
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-card p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3">For General Dentists</h3>
                <p className="text-muted-foreground mb-4">
                  Consult with specialists before referring complex cases. See real treatment
                  outcomes and expand your skill set.
                </p>
                <div className="text-sm text-primary font-medium">
                  "Preview specialist work before making referrals"
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3">For Specialists</h3>
                <p className="text-muted-foreground mb-4">
                  Build your reputation by sharing expertise. Connect with referring dentists
                  and showcase your clinical work.
                </p>
                <div className="text-sm text-primary font-medium">
                  "Establish yourself as the go-to expert in your field"
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3">For Clinic Owners</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your entire team, manage multiple locations, and build your clinic's
                  reputation in the community.
                </p>
                <div className="text-sm text-primary font-medium">
                  "Unite your team under one professional presence"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-2xl border border-border bg-card p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Join other dentists on Network32</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Dentists use Network32 to share work, learn faster, and connect with the right peers.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Create Your Profile
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No money required • Join in seconds
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Network32. All rights reserved.</p>
          <p className="mt-2">A professional network built by dentists, for dentists</p>
        </div>
      </footer>
    </div>
  );
}
