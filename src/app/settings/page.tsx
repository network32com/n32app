'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, CheckCircle, Trash2, ShieldAlert, Loader2, Settings } from 'lucide-react';
import { changePassword, deleteAccount } from '@/lib/backend/actions/account';
import { toast } from 'sonner';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Delete account states
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        if (!currentPassword) {
            toast.error('Current password is required');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const result = await changePassword(currentPassword, newPassword);

        if (result.success) {
            toast.success('Password changed! Please sign in with your new password.');
            router.push('/auth/login');
        } else {
            toast.error(result.error || 'Failed to change password');
        }

        setLoading(false);
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);

        try {
            const result = await deleteAccount();

            if (result.success) {
                toast.success('Account deleted successfully');
                setShowConfirmDialog(false);
                router.push('/');
            } else {
                toast.error(result.error || 'Failed to delete account');
                setDeleting(false);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete account');
            setDeleting(false);
        }
    };

    return (
        <ClientDashboardLayout currentPath="/settings">
            <div className="mx-auto max-w-3xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your account security, preferences, and clinical settings.
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Change Password Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" />
                                Security
                            </CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="current-password"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            disabled={loading}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="new-password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            disabled={loading}
                                            required
                                            minLength={6}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Minimum 6 characters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        disabled={loading}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <Button type="submit" disabled={loading || !currentPassword || !newPassword || !confirmPassword} className="w-full sm:w-auto">
                                    {loading ? 'Changing Password...' : 'Update Password'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Danger Zone Card */}
                    <Card className="border-destructive/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <ShieldAlert className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>
                                Actions that are permanent and cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-destructive/20 p-4 bg-destructive/5 text-destructive">
                                <div>
                                    <p className="font-semibold">Delete Account</p>
                                    <p className="text-sm opacity-90">Permanently remove your account and all data.</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Account Dialogs */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove
                            all your data from our servers including:
                        </AlertDialogDescription>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                            <li>Your profile and personal information</li>
                            <li>All clinical cases you&apos;ve shared</li>
                            <li>Your saved cases and bookmarks</li>
                            <li>Your connections and followers</li>
                        </ul>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                setShowDeleteDialog(false);
                                setShowConfirmDialog(true);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showConfirmDialog} onOpenChange={(open) => !deleting && setShowConfirmDialog(open)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                        <AlertDialogDescription>
                            This is your last chance to cancel. Are you 100% sure you want to delete your
                            account? This action is irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>No, Keep My Account</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Yes, Delete Permanently'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ClientDashboardLayout>
    );
}
