import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Check if user is admin - SECURITY CRITICAL
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (userError || !userData || userData.role !== 'admin') {
        console.warn(`Unauthorized admin access attempt by user: ${user.id}`);
        redirect('/dashboard');
    }

    return <DashboardLayout currentPath="/admin">{children}</DashboardLayout>;
}
