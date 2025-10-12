import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HeroSection } from '@/components/landing/hero-section';
import { StorySection } from '@/components/landing/story-section';
import { AudienceSection } from '@/components/landing/audience-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { CredibilitySection } from '@/components/landing/credibility-section';
import { RoadmapSection } from '@/components/landing/roadmap-section';
import { CTASection } from '@/components/landing/cta-section';

export default async function LandingPage() {
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
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">N32</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Network32</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
              Features
            </a>
            <a href="#roadmap" className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
              Roadmap
            </a>
            <a href="mailto:contact@network32.com" className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
              Contact
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Story Section */}
        <StorySection />

        {/* 3. Audience Section */}
        <AudienceSection />

        {/* 4. Features Section */}
        <FeaturesSection />

        {/* 5. Credibility Section */}
        <CredibilitySection />

        {/* 6. Roadmap Section */}
        <div id="roadmap">
          <RoadmapSection />
        </div>

        {/* 7. CTA Section */}
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-lg font-bold text-white">N32</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Network32</span>
              </div>
              <p className="max-w-md text-sm text-gray-600 dark:text-gray-300">
                The professional network for dental professionals. Connect, learn, and grow with colleagues who understand your work.
              </p>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                &copy; 2025 Network32. All rights reserved.
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#roadmap" className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                    Roadmap
                  </a>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:contact@network32.com" className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                    contact@network32.com
                  </a>
                </li>
                <li>
                  <a href="mailto:support@network32.com" className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                    support@network32.com
                  </a>
                </li>
                <li>
                  <a href="mailto:feedback@network32.com" className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                    feedback@network32.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
