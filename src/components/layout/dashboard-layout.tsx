import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Bookmark,
  Menu,
} from 'lucide-react';
import { createClient } from '@/lib/shared/supabase/server';
import { redirect } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export async function DashboardLayout({ children, currentPath }: DashboardLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

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
      <Link href={`/profile/${user.id}`}>
        <Button
          variant={isActive(`/profile/${user.id}`) ? 'secondary' : 'ghost'}
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
          <Link href="/dashboard">
            <h1 className="text-xl font-bold text-primary">Network32</h1>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
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
                  <Link href="/dashboard">
                    <h1 className="text-xl font-bold text-primary">Network32</h1>
                  </Link>
                </div>
                <nav className="space-y-1 p-4">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/dashboard" className="lg:hidden">
              <h1 className="text-xl font-bold text-primary">Network32</h1>
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Welcome, {userData?.full_name}
            </span>
            <form action="/auth/logout" method="POST">
              <Button type="submit" variant="outline" size="sm">
                Logout
              </Button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
