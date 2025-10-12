import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, UserPlus } from 'lucide-react';

interface ProfessionalCardProps {
  professionalData: any;
}

export function ProfessionalCard({ professionalData }: ProfessionalCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Link href={`/profile/${professionalData.id}`}>
            <Avatar className="h-14 w-14 rounded-lg">
              <AvatarImage
                src={professionalData.profile_photo_url || undefined}
                alt={professionalData.full_name}
              />
              <AvatarFallback>
                {professionalData.full_name
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Badge variant="secondary" className="text-xs mb-2">
              New Professional
            </Badge>
            <Link
              href={`/profile/${professionalData.id}`}
              className="font-semibold hover:text-blue-600 block"
            >
              {professionalData.full_name}
            </Link>
            {professionalData.degree && (
              <p className="text-sm text-muted-foreground">{professionalData.degree}</p>
            )}
            {professionalData.specialty && (
              <Badge variant="outline" className="mt-1 text-xs">
                {professionalData.specialty.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        </div>

        {professionalData.headline && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {professionalData.headline}
          </p>
        )}

        {professionalData.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <MapPin className="h-3 w-3" />
            <span>{professionalData.location}</span>
          </div>
        )}

        <div className="mt-3 pt-3 border-t">
          <Link href={`/profile/${professionalData.id}`}>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <UserPlus className="h-4 w-4" />
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
