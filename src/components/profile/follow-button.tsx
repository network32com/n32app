'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser } from '@/lib/backend/actions/profile';

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({
  currentUserId,
  targetUserId,
  initialIsFollowing,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(currentUserId, targetUserId);
        setIsFollowing(false);
      } else {
        await followUser(currentUserId, targetUserId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={loading}
      variant={isFollowing ? 'outline' : 'default'}
    >
      {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
}
