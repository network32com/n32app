'use server';

import { createClient, createAdminClient } from '@/lib/shared/supabase/server';

/**
 * Delete the current user's account and all associated data
 * This action requires the user to be authenticated
 */
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const userId = user.id;

    try {
        // Use admin client to bypass RLS policies for deletion
        const adminClient = createAdminClient();

        console.log('Starting account deletion for user:', userId);

        // Delete in order of dependencies (child tables first)

        // 1. Delete notifications (where user is recipient or actor)
        const { error: notif1Error } = await adminClient.from('notifications').delete().eq('user_id', userId);
        if (notif1Error) console.log('notifications (user_id) delete:', notif1Error.message);

        const { error: notif2Error } = await adminClient.from('notifications').delete().eq('actor_id', userId);
        if (notif2Error) console.log('notifications (actor_id) delete:', notif2Error.message);

        // 2. Delete forum replies
        const { error: repliesError } = await adminClient.from('forum_replies').delete().eq('author_id', userId);
        if (repliesError) console.log('forum_replies delete:', repliesError.message);

        // 3. Delete forum threads
        const { error: threadsError } = await adminClient.from('forum_threads').delete().eq('author_id', userId);
        if (threadsError) console.log('forum_threads delete:', threadsError.message);

        // 4. Delete reports
        const { error: reportsError } = await adminClient.from('reports').delete().eq('reporter_id', userId);
        if (reportsError) console.log('reports delete:', reportsError.message);

        // 5. Delete saved cases
        const { error: savedError } = await adminClient.from('saved_cases').delete().eq('user_id', userId);
        if (savedError) console.log('saved_cases delete:', savedError.message);

        // 6. Delete follows (both as follower and following)
        const { error: follows1Error } = await adminClient.from('follows').delete().eq('follower_id', userId);
        if (follows1Error) console.log('follows (follower) delete:', follows1Error.message);

        const { error: follows2Error } = await adminClient.from('follows').delete().eq('following_id', userId);
        if (follows2Error) console.log('follows (following) delete:', follows2Error.message);

        // 7. Delete clinic affiliations
        const { error: affiliationsError } = await adminClient.from('clinic_affiliations').delete().eq('user_id', userId);
        if (affiliationsError) console.log('clinic_affiliations delete:', affiliationsError.message);

        // 8. Delete user's clinical cases
        const { error: casesError } = await adminClient.from('clinical_cases').delete().eq('user_id', userId);
        if (casesError) console.log('clinical_cases delete:', casesError.message);

        // 9. Delete user's clinics
        const { error: clinicsError } = await adminClient.from('clinics').delete().eq('owner_id', userId);
        if (clinicsError) console.log('clinics delete:', clinicsError.message);

        // 10. Delete user achievements
        const { error: achievementsError } = await adminClient.from('user_achievements').delete().eq('user_id', userId);
        if (achievementsError) console.log('user_achievements delete:', achievementsError.message);

        // 11. Delete user certifications
        const { error: certsError } = await adminClient.from('user_certifications').delete().eq('user_id', userId);
        if (certsError) console.log('user_certifications delete:', certsError.message);

        // 12. Delete user educations
        const { error: eduError } = await adminClient.from('user_educations').delete().eq('user_id', userId);
        if (eduError) console.log('user_educations delete:', eduError.message);

        // 13. Delete user profile - THIS IS THE MAIN ONE
        const { error: userDeleteError } = await adminClient.from('users').delete().eq('id', userId);
        if (userDeleteError) {
            console.error('CRITICAL - users table delete failed:', userDeleteError);
            return { success: false, error: 'Failed to delete user profile: ' + userDeleteError.message };
        }

        console.log('User profile deleted successfully');

        // 14. Sign out the user
        await supabase.auth.signOut();

        // 15. Delete the auth user
        const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
        if (deleteAuthError) {
            console.error('Error deleting auth user:', deleteAuthError);
            // User data is already deleted, so we still return success
        } else {
            console.log('Auth user deleted successfully');
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting account:', error);
        return { success: false, error: error.message || 'Failed to delete account' };
    }
}

/**
 * Change the current user's password
 * This action requires the user to be authenticated and verifies the current password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    if (!user.email) {
        return { success: false, error: 'No email associated with this account' };
    }

    if (!currentPassword) {
        return { success: false, error: 'Current password is required' };
    }

    if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters' };
    }

    try {
        // Verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Update to new password
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            return { success: false, error: error.message };
        }

        // Sign out user so they re-authenticate with new password
        await supabase.auth.signOut();

        return { success: true };
    } catch (error: any) {
        console.error('Error changing password:', error);
        return { success: false, error: error.message || 'Failed to change password' };
    }
}
