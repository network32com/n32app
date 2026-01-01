'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Users, Building2, Menu, Search, Bell, MessageSquare, LayoutDashboard, Bookmark, Rss } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { UserMenu } from './user-menu';

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export function ClientDashboardLayout({ children, currentPath }: ClientDashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/auth/login');
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('role, full_name, email, profile_photo_url')
        .eq('id', authUser.id)
        .single();

      setUser(authUser);
      setUserData(data);
      setLoading(false);
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isActive = (path: string) => currentPath === path;

  const NavLinks = () => (
    <>
      <Link href="/dashboard">
        <Button
          variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          size="sm"
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </Link>
      <Link href="/feed">
        <Button
          variant={isActive('/feed') ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          size="sm"
        >
          <Rss className="mr-2 h-4 w-4" />
          Feed
        </Button>
      </Link>
      <Link href="/discover">
        <Button
          variant={isActive('/discover') ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          size="sm"
        >
          <Search className="mr-2 h-4 w-4" />
          Discover
        </Button>
      </Link>
      <Link href="/cases">
        <Button
          variant={isActive('/cases') ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          size="sm"
        >
          <FileText className="mr-2 h-4 w-4" />
          Clinical Cases
        </Button>
      </Link>
      <Link href="/forum">
        <Button
          variant={isActive('/forum') ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          size="sm"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Forum
        </Button>
      </Link>
      <Link href={`/profile/${user?.id}`}>
        <Button
          variant={isActive(`/profile/${user?.id}`) ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          size="sm"
        >
          <Users className="mr-2 h-4 w-4" />
          My Profile
        </Button>
      </Link>
      {userData?.role === 'clinic_owner' && (
        <Link href="/clinics">
          <Button
            variant={isActive('/clinics') ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            size="sm"
          >
            <Building2 className="mr-2 h-4 w-4" />
            My Clinics
          </Button>
        </Link>
      )}
      <Link href="/saved">
        <Button
          variant={isActive('/saved') ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          size="sm"
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Saved Cases
        </Button>
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1.5 p-4">
          <NavLinks />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center border-b border-border px-6">
                  <Logo />
                </div>
                <nav className="flex flex-col gap-1.5 p-4">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>

            <Logo className="lg:hidden" />
          </div>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Future: Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            {userData && user && (
              <UserMenu
                user={{
                  id: user.id,
                  full_name: userData.full_name,
                  email: userData.email,
                  profile_photo_url: userData.profile_photo_url,
                }}
              />
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
