import { redirect } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/server';
import { getForumThread } from '@/lib/backend/actions/forum';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EditThreadForm } from '@/components/forum/edit-thread-form';

interface EditThreadPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditThreadPage({ params }: EditThreadPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  let thread;
  try {
    thread = await getForumThread(id);
  } catch (error) {
    redirect('/forum');
  }

  // Verify ownership
  if (thread.author_id !== user.id) {
    redirect(`/forum/${id}`);
  }

  return (
    <DashboardLayout currentPath="/forum">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Forum Thread</h1>
          <p className="mt-2 text-muted-foreground">
            Update your thread title, content, and tags.
          </p>
        </div>

        <EditThreadForm thread={thread} userId={user.id} />
      </div>
    </DashboardLayout>
  );
}
