import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Clock } from 'lucide-react';

interface ClinicCardProps {
  clinicData: any;
}

export function ClinicCard({ clinicData }: ClinicCardProps) {
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
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src={clinicData.logo_url || undefined} alt={clinicData.name} />
            <AvatarFallback>
              <Building2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Badge variant="secondary" className="text-xs mb-1">
              Clinic Update
            </Badge>
            <p className="text-xs text-muted-foreground">{formatDate(clinicData.created_at)}</p>
          </div>
        </div>

        <Link href={`/clinics/${clinicData.id}`} className="block">
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600">{clinicData.name}</h3>

          {clinicData.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span>{clinicData.location}</span>
            </div>
          )}

          {clinicData.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {clinicData.description}
            </p>
          )}

          {clinicData.services && clinicData.services.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {clinicData.services.slice(0, 4).map((service: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {clinicData.services.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{clinicData.services.length - 4} more
                </Badge>
              )}
            </div>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
