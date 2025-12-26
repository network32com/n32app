'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { followUser, unfollowUser } from '@/lib/backend/actions/profile';
import { UserMinus, UserPlus } from 'lucide-react';

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  targetUserName?: string;
  initialIsFollowing: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
}

export function FollowButton({
  currentUserId,
  targetUserId,
  targetUserName = 'this user',
  initialIsFollowing,
  size = 'default',
  showIcon = false,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      await followUser(currentUserId, targetUserId);
      setIsFollowing(true);
    } catch (error) {
      console.error('Failed to follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setLoading(true);
    try {
      await unfollowUser(currentUserId, targetUserId);
      setIsFollowing(false);
    } catch (error) {
      console.error('Failed to unfollow:', error);
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleClick = () => {
    if (isFollowing) {
      setShowConfirmDialog(true);
    } else {
      handleFollow();
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={loading}
        variant={isFollowing ? 'outline' : 'default'}
        size={size}
        className={isFollowing ? 'text-destructive hover:text-destructive hover:bg-destructive/10' : ''}
      >
        {showIcon && (
          isFollowing ? (
            <UserMinus className="mr-2 h-4 w-4" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )
        )}
        {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unfollow {targetUserName}?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer see their cases and updates in your feed. You can always follow them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnfollow}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Unfollowing...' : 'Unfollow'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

