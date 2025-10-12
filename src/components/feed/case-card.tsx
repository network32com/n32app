import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Bookmark, Clock } from 'lucide-react';
import { PROCEDURE_TYPES } from '@/lib/shared/constants';

interface CaseCardProps {
  caseData: any;
}

export function CaseCard({ caseData }: CaseCardProps) {
  const getProcedureLabel = (value: string) => {
    return PROCEDURE_TYPES.find((p) => p.value === value)?.label || value;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex items-start gap-3 p-4 pb-3">
          <Link href={`/profile/${caseData.user_id}`}>
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage
                src={caseData.users?.profile_photo_url || undefined}
                alt={caseData.users?.full_name}
              />
              <AvatarFallback>
                {caseData.users?.full_name
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${caseData.user_id}`}
              className="font-semibold hover:text-blue-600"
            >
              {caseData.users?.full_name}
            </Link>
            {caseData.users?.degree && (
              <p className="text-xs text-muted-foreground">{caseData.users.degree}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                Clinical Case
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(caseData.created_at)}
              </span>
            </div>
          </div>
        </div>

        <Link href={`/cases/${caseData.id}`} className="block">
          <div className="px-4 pb-3">
            <h3 className="font-semibold line-clamp-2 hover:text-blue-600">{caseData.title}</h3>
            <Badge className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {getProcedureLabel(caseData.procedure_type)}
            </Badge>
          </div>

          {caseData.before_image_url && (
            <div className="relative aspect-video">
              <Image
                src={caseData.before_image_url}
                alt={caseData.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {caseData.case_notes && (
            <div className="px-4 py-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{caseData.case_notes}</p>
            </div>
          )}

          <div className="flex items-center gap-4 px-4 py-3 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{caseData.views_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span>{caseData.saves_count || 0}</span>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
