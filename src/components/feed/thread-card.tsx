import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Eye } from 'lucide-react';
import { getCategoryLabel, getCategoryColor } from '@/lib/shared/constants/forum';

interface ThreadCardProps {
  threadData: any;
}

export function ThreadCard({ threadData }: ThreadCardProps) {
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
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Link href={`/profile/${threadData.author_id}`}>
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage
                src={threadData.users?.profile_photo_url || undefined}
                alt={threadData.users?.full_name}
              />
              <AvatarFallback>
                {threadData.users?.full_name
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${threadData.author_id}`}
              className="font-semibold hover:text-blue-600"
            >
              {threadData.users?.full_name}
            </Link>
            {threadData.users?.degree && (
              <p className="text-xs text-muted-foreground">{threadData.users.degree}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                Forum Thread
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(threadData.created_at)}
              </span>
            </div>
          </div>
        </div>

        <Link href={`/forum/${threadData.id}`} className="block">
          <div className="mb-3">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={getCategoryColor(threadData.category)}>
                {getCategoryLabel(threadData.category)}
              </Badge>
              {threadData.is_pinned && (
                <Badge variant="outline" className="border-blue-500 text-blue-600 text-xs">
                  Pinned
                </Badge>
              )}
            </div>
            <h3 className="font-semibold line-clamp-2 hover:text-blue-600">{threadData.title}</h3>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{threadData.body}</p>

          {threadData.tags && threadData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {threadData.tags.slice(0, 3).map((tag: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{threadData.replies_count || 0} replies</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{threadData.views_count || 0} views</span>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
