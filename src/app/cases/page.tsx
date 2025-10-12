'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Eye, Bookmark, Plus, Search, Share2, Clock, MapPin } from 'lucide-react';
import Image from 'next/image';
import { PROCEDURE_TYPES, SPECIALTIES } from '@/lib/shared/constants';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';
import { formatDistanceToNow } from 'date-fns';

export default function CasesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [procedureFilter, setProcedureFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
  }, [procedureFilter, specialtyFilter, locationFilter, searchQuery]);

  const loadCases = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      let query = supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (procedureFilter && procedureFilter !== 'all') {
        query = query.eq('procedure_type', procedureFilter);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,case_notes.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading cases:', error);
        setCases([]);
      } else if (data) {
        // Fetch author details for each case
        const casesWithAuthors = await Promise.all(
          data.map(async (caseItem) => {
            const { data: author } = await supabase
              .from('users')
              .select('id, full_name, profile_photo_url, degree, specialty, location')
              .eq('id', caseItem.author_id)
              .single();
            return { ...caseItem, author };
          })
        );

        // Apply specialty and location filters
        let filteredCases = casesWithAuthors;

        if (specialtyFilter && specialtyFilter !== 'all') {
          filteredCases = filteredCases.filter(
            (c) => c.author?.specialty === specialtyFilter
          );
        }

        if (locationFilter) {
          filteredCases = filteredCases.filter((c) =>
            c.author?.location?.toLowerCase().includes(locationFilter.toLowerCase())
          );
        }

        setCases(filteredCases);
      }
    } catch (error) {
      console.error('Error:', error);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const getProcedureLabel = (value: string) => {
    return PROCEDURE_TYPES.find((p) => p.value === value)?.label || value;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <ClientDashboardLayout currentPath="/cases">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Clinical Cases</h1>
        <p className="mt-2 text-muted-foreground">
          Explore cases shared by dental professionals
        </p>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search cases by title or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={procedureFilter} onValueChange={setProcedureFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Procedure Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Procedures</SelectItem>
                {PROCEDURE_TYPES.map((procedure) => (
                  <SelectItem key={procedure.value} value={procedure.value}>
                    {procedure.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {SPECIALTIES.map((specialty) => (
                  <SelectItem key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-[180px]"
            />

            {(procedureFilter !== 'all' ||
              specialtyFilter !== 'all' ||
              locationFilter ||
              searchQuery) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setProcedureFilter('all');
                  setSpecialtyFilter('all');
                  setLocationFilter('');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading cases...</div>
      ) : cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">
              {searchQuery || procedureFilter !== 'all' || specialtyFilter !== 'all' || locationFilter
                ? 'No cases found matching your filters'
                : 'No cases have been shared yet'}
            </p>
            <Link href="/cases/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Share a Case
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseItem: any) => (
            <Card
              key={caseItem.id}
              className="group flex flex-col overflow-hidden transition-all hover:shadow-xl"
              onMouseEnter={() => setHoveredCase(caseItem.id)}
              onMouseLeave={() => setHoveredCase(null)}
            >
              {/* Before/After Image Preview with Hover Toggle */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                {hoveredCase === caseItem.id ? (
                  // Show After image on hover
                  <div className="relative h-full w-full">
                    <Image
                      src={caseItem.after_image_url}
                      alt="After"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 right-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                      After
                    </div>
                  </div>
                ) : (
                  // Show Before image by default
                  <div className="relative h-full w-full">
                    <Image
                      src={caseItem.before_image_url}
                      alt="Before"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 left-2 rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-white">
                      Before
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="flex flex-1 flex-col p-4">
                {/* Title and Time */}
                <div className="mb-2">
                  <h3 className="line-clamp-2 font-semibold group-hover:text-blue-600">
                    {caseItem.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(caseItem.created_at), { addSuffix: true })}
                  </div>
                </div>

                {/* Procedure Type Badge */}
                <Badge variant="secondary" className="mb-2 w-fit bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {getProcedureLabel(caseItem.procedure_type)}
                </Badge>

                {/* Case Notes Preview */}
                {caseItem.case_notes && (
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                    {truncateText(caseItem.case_notes, 150)}
                  </p>
                )}

                {/* Tags */}
                {caseItem.tags && caseItem.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {caseItem.tags.slice(0, 3).map((tag: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="rounded-full text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {caseItem.tags.length > 3 && (
                      <Badge variant="outline" className="rounded-full text-xs">
                        +{caseItem.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Author Info */}
                {caseItem.author && (
                  <div className="mb-3 flex items-center gap-2">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={caseItem.author.profile_photo_url || undefined}
                        alt={caseItem.author.full_name}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(caseItem.author.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {caseItem.author.full_name}
                      </p>
                      {caseItem.author.degree && (
                        <p className="truncate text-xs text-muted-foreground">
                          {caseItem.author.degree}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {caseItem.author?.location && (
                  <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {caseItem.author.location}
                  </div>
                )}

                {/* Stats */}
                <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{caseItem.views_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark className="h-4 w-4" />
                    <span>{caseItem.saves_count || 0}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2">
                  <Link href={`/cases/${caseItem.id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      View Full Case
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Share Case Button */}
      <Link href="/cases/create">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </ClientDashboardLayout>
  );
}
