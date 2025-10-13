import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { getCase } from '@/lib/backend/actions/case';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EditCaseForm } from '@/components/cases/edit-case-form';

interface EditCasePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCasePage({ params }: EditCasePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  let caseData;
  try {
    caseData = await getCase(id);
  } catch (error) {
    redirect('/cases');
  }

  // Verify ownership
  if (caseData.user_id !== user.id) {
    redirect(`/cases/${id}`);
  }

  return (
    <DashboardLayout currentPath="/cases">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Clinical Case</h1>
          <p className="mt-2 text-muted-foreground">
            Update your case details, images, and information.
          </p>
        </div>

        <EditCaseForm caseData={caseData} userId={user.id} />
      </div>
    </DashboardLayout>
  );
}
