'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, CheckCircle, XCircle } from 'lucide-react';
import { updateReportStatus } from '@/lib/backend/actions/report';
import { useRouter } from 'next/navigation';

interface ReportActionsProps {
  reportId: string;
  currentStatus: 'pending' | 'reviewed' | 'resolved';
}

export function ReportActions({ reportId, currentStatus }: ReportActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: 'pending' | 'reviewed' | 'resolved') => {
    setLoading(true);
    try {
      await updateReportStatus(reportId, newStatus);
      router.refresh();
    } catch (error) {
      console.error('Failed to update report status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus !== 'reviewed' && (
          <DropdownMenuItem onClick={() => handleStatusChange('reviewed')}>
            <Eye className="mr-2 h-4 w-4" />
            Mark as Under Review
          </DropdownMenuItem>
        )}
        {currentStatus !== 'resolved' && (
          <DropdownMenuItem onClick={() => handleStatusChange('resolved')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Resolved
          </DropdownMenuItem>
        )}
        {currentStatus !== 'pending' && (
          <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
            <XCircle className="mr-2 h-4 w-4" />
            Mark as Pending
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
