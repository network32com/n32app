'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import Link from 'next/link';
import { Users, UserMinus, MapPin, GraduationCap } from 'lucide-react';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';
import { SPECIALTIES } from '@/lib/shared/constants';
import { toast } from 'sonner';

interface FollowedUser {
    id: string;
    full_name: string;
    profile_photo_url?: string;
    degree?: string;
    specialty?: string;
    location?: string;
    headline?: string;
}

export default function FollowingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState<FollowedUser[]>([]);
    const [unfollowingId, setUnfollowingId] = useState<string | null>(null);
    const [userToUnfollow, setUserToUnfollow] = useState<FollowedUser | null>(null);

    useEffect(() => {
        loadFollowing();
    }, []);

    const loadFollowing = async () => {
        setLoading(true);
        const supabase = createClient();

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Get list of users I'm following
            const { data: follows, error: followsError } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', user.id);

            if (followsError) {
                console.error('Error loading follows:', followsError);
                setFollowing([]);
                return;
            }

            if (!follows || follows.length === 0) {
                setFollowing([]);
                setLoading(false);
                return;
            }

            // Get user details for each followed user
            const followingIds = follows.map((f) => f.following_id);
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, full_name, profile_photo_url, degree, specialty, location, headline')
                .in('id', followingIds);

            if (usersError) {
                console.error('Error loading users:', usersError);
                setFollowing([]);
            } else {
                setFollowing(users || []);
            }
        } catch (error) {
            console.error('Error:', error);
            setFollowing([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (userId: string) => {
        setUnfollowingId(userId);
        const supabase = createClient();

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', userId);

            if (error) {
                toast.error('Failed to unfollow');
                console.error('Error unfollowing:', error);
            } else {
                toast.success('Unfollowed successfully');
                setFollowing(following.filter((f) => f.id !== userId));
            }
        } catch (error) {
            toast.error('Failed to unfollow');
            console.error('Error:', error);
        } finally {
            setUnfollowingId(null);
            setUserToUnfollow(null);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getSpecialtyLabel = (value: string) => {
        const specialty = SPECIALTIES.find((s) => s.value === value);
        return specialty?.label || value;
    };

    return (
        <ClientDashboardLayout currentPath="/profile/following">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Following</h1>
                <p className="mt-2 text-muted-foreground">
                    Dental professionals you are following
                </p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                            <CardContent className="flex items-center gap-4 p-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && following.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Not following anyone yet</h3>
                        <p className="mt-2 text-center text-muted-foreground">
                            Start following dental professionals to see their cases and updates in your feed.
                        </p>
                        <Link href="/discover">
                            <Button className="mt-4">Discover Professionals</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Following List */}
            {!loading && following.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {following.map((user) => (
                        <Card key={user.id} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Link href={`/profile/${user.id}`}>
                                        <Avatar className="h-12 w-12 cursor-pointer">
                                            <AvatarImage
                                                src={user.profile_photo_url || undefined}
                                                alt={user.full_name}
                                            />
                                            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                                        </Avatar>
                                    </Link>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link href={`/profile/${user.id}`}>
                                                <h3 className="truncate font-semibold hover:text-primary">
                                                    {user.full_name}
                                                </h3>
                                            </Link>
                                            {/* Unfollow Button - Top Right */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setUserToUnfollow(user)}
                                                disabled={unfollowingId === user.id}
                                                className="h-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <UserMinus className="h-4 w-4" />
                                                <span className="ml-1 hidden sm:inline">Unfollow</span>
                                            </Button>
                                        </div>

                                        {user.headline && (
                                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                {user.headline}
                                            </p>
                                        )}

                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {user.degree && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <GraduationCap className="mr-1 h-3 w-3" />
                                                    {user.degree}
                                                </Badge>
                                            )}
                                            {user.specialty && (
                                                <Badge variant="outline" className="text-xs">
                                                    {getSpecialtyLabel(user.specialty)}
                                                </Badge>
                                            )}
                                        </div>

                                        {user.location && (
                                            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                {user.location}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Unfollow Confirmation Modal */}
            <AlertDialog open={!!userToUnfollow} onOpenChange={(open) => !open && setUserToUnfollow(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unfollow {userToUnfollow?.full_name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will no longer see their cases and updates in your feed. You can always follow them again later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!unfollowingId}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => userToUnfollow && handleUnfollow(userToUnfollow.id)}
                            disabled={!!unfollowingId}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {unfollowingId ? 'Unfollowing...' : 'Unfollow'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ClientDashboardLayout>
    );
}

