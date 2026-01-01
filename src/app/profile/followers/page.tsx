'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Users, MapPin, GraduationCap } from 'lucide-react';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';
import { SPECIALTIES } from '@/lib/shared/constants';

interface FollowerUser {
    id: string;
    full_name: string;
    profile_photo_url?: string;
    degree?: string;
    specialty?: string;
    location?: string;
    headline?: string;
}

export default function FollowersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [followers, setFollowers] = useState<FollowerUser[]>([]);

    useEffect(() => {
        loadFollowers();
    }, []);

    const loadFollowers = async () => {
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

            // Get list of users who follow me
            const { data: follows, error: followsError } = await supabase
                .from('follows')
                .select('follower_id')
                .eq('following_id', user.id);

            if (followsError) {
                console.error('Error loading followers:', followsError);
                setFollowers([]);
                return;
            }

            if (!follows || follows.length === 0) {
                setFollowers([]);
                setLoading(false);
                return;
            }

            // Get user details for each follower
            const followerIds = follows.map((f) => f.follower_id);
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, full_name, profile_photo_url, degree, specialty, location, headline')
                .in('id', followerIds);

            if (usersError) {
                console.error('Error loading users:', usersError);
                setFollowers([]);
            } else {
                setFollowers(users || []);
            }
        } catch (error) {
            console.error('Error:', error);
            setFollowers([]);
        } finally {
            setLoading(false);
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
        <ClientDashboardLayout currentPath="/profile/followers">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Followers</h1>
                <p className="mt-2 text-muted-foreground">
                    Dental professionals who follow you
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
            {!loading && followers.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No followers yet</h3>
                        <p className="mt-2 text-center text-muted-foreground">
                            Share your clinical cases and engage with the community to gain followers.
                        </p>
                        <Link href="/cases/create">
                            <Button className="mt-4">Share a Case</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Followers List */}
            {!loading && followers.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {followers.map((user) => (
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
                                        <Link href={`/profile/${user.id}`}>
                                            <h3 className="truncate font-semibold hover:text-primary">
                                                {user.full_name}
                                            </h3>
                                        </Link>

                                        {user.headline && (
                                            <p className="truncate text-sm text-muted-foreground">
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

                                {/* View Profile Button */}
                                <div className="mt-4 flex justify-end">
                                    <Link href={`/profile/${user.id}`}>
                                        <Button variant="outline" size="sm">
                                            View Profile
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </ClientDashboardLayout>
    );
}
