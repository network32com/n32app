'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/shared/supabase/client';
import { ClientDashboardLayout } from '@/components/layout/client-dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Search, Users, FileText, Building2, TrendingUp, MapPin, Filter } from 'lucide-react';
import { SPECIALTIES, PROCEDURE_TYPES } from '@/lib/shared/constants';
import Image from 'next/image';

export default function DiscoverPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('professionals');
  const [loading, setLoading] = useState(true);

  // Filter states
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [procedureFilter, setProcedureFilter] = useState('all');

  // Data states
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [trendingSpecialties, setTrendingSpecialties] = useState<any[]>([]);
  const [topProfessionals, setTopProfessionals] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab, specialtyFilter, locationFilter, procedureFilter, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      if (activeTab === 'professionals') {
        let query = supabase
          .from('users')
          .select('id, full_name, headline, specialty, location, profile_photo_url, degree')
          .order('created_at', { ascending: false })
          .limit(12);

        if (specialtyFilter && specialtyFilter !== 'all') {
          query = query.eq('specialty', specialtyFilter);
        }

        if (locationFilter) {
          query = query.ilike('location', `%${locationFilter}%`);
        }

        if (searchQuery) {
          query = query.or(
            `full_name.ilike.%${searchQuery}%,headline.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
          );
        }

        const { data, error } = await query;
        if (error) {
          console.error('Error loading professionals:', error);
        }
        setProfessionals(data || []);
      } else if (activeTab === 'cases') {
        let query = supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(12);

        if (procedureFilter && procedureFilter !== 'all') {
          query = query.eq('procedure_type', procedureFilter);
        }

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,case_notes.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Error loading cases:', error);
        }
        
        // Fetch author details separately for each case
        if (data) {
          const casesWithAuthors = await Promise.all(
            data.map(async (caseItem) => {
              const { data: author } = await supabase
                .from('users')
                .select('id, full_name, profile_photo_url')
                .eq('id', caseItem.author_id)
                .single();
              return { ...caseItem, author };
            })
          );
          setCases(casesWithAuthors);
        } else {
          setCases([]);
        }
      } else if (activeTab === 'clinics') {
        let query = supabase
          .from('clinics')
          .select('*')
          .limit(12);

        if (locationFilter) {
          query = query.ilike('location', `%${locationFilter}%`);
        }

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        const { data } = await query;
        setClinics(data || []);
      }

      // Load trending data
      const { data: topUsers } = await supabase
        .from('users')
        .select('id, full_name, specialty, profile_photo_url, degree')
        .limit(5);
      setTopProfessionals(topUsers || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ClientDashboardLayout currentPath="/discover">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Discover</h1>
        <p className="mt-2 text-muted-foreground">
          Search for professionals, cases, and clinics
        </p>
      </div>

      {/* Tabs with Search and Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Search and Filter Toolbar */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for professionals, cases, or clinics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabs and Filters Row */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <TabsList className="w-full lg:w-auto">
                <TabsTrigger value="professionals" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Professionals
                </TabsTrigger>
                <TabsTrigger value="cases" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Clinical Cases
                </TabsTrigger>
                <TabsTrigger value="clinics" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Clinics
                </TabsTrigger>
              </TabsList>

              {/* Contextual Filters */}
              <div className="flex flex-wrap gap-2">
                {activeTab === 'professionals' && (
                  <>
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Specialties" />
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
                  </>
                )}

                {activeTab === 'cases' && (
                  <Select value={procedureFilter} onValueChange={setProcedureFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Procedures" />
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
                )}

                {activeTab === 'clinics' && (
                  <Input
                    type="text"
                    placeholder="Location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-[180px]"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professionals Tab */}
        <TabsContent value="professionals" className="space-y-6">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : professionals.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No professionals found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map((professional) => (
                <Link key={professional.id} href={`/profile/${professional.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 rounded-lg">
                          <AvatarImage
                            src={professional.profile_photo_url || undefined}
                            alt={professional.full_name}
                          />
                          <AvatarFallback>{getInitials(professional.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{professional.full_name}</h3>
                          {professional.degree && (
                            <p className="text-sm text-muted-foreground">{professional.degree}</p>
                          )}
                          {professional.specialty && (
                            <Badge variant="outline" className="mt-2">
                              {professional.specialty.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {professional.headline && (
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {professional.headline}
                        </p>
                      )}
                      {professional.location && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {professional.location}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Clinical Cases Tab */}
        <TabsContent value="cases" className="space-y-6">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : cases.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No cases found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((caseItem) => (
                <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                    {caseItem.before_image_url && (
                      <div className="relative aspect-video">
                        <Image
                          src={caseItem.before_image_url}
                          alt={caseItem.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{caseItem.title}</h3>
                      {caseItem.procedure_type && (
                        <Badge variant="secondary" className="mt-2">
                          {caseItem.procedure_type.replace(/_/g, ' ')}
                        </Badge>
                      )}
                      {caseItem.author && (
                        <div className="mt-3 flex items-center gap-2">
                          <Avatar className="h-6 w-6 rounded">
                            <AvatarImage src={caseItem.author.profile_photo_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(caseItem.author.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {caseItem.author.full_name}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Clinics Tab */}
        <TabsContent value="clinics" className="space-y-6">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : clinics.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No clinics found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clinics.map((clinic) => (
                <Link key={clinic.id} href={`/clinics/${clinic.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 rounded-lg">
                          <AvatarImage src={clinic.logo_url || undefined} alt={clinic.name} />
                          <AvatarFallback>
                            <Building2 className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{clinic.name}</h3>
                          {clinic.location && (
                            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {clinic.location}
                            </div>
                          )}
                        </div>
                      </div>
                      {clinic.description && (
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {clinic.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Trending & Recommendations */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-semibold">Trending & Recommendations</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Trending Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Trending Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.slice(0, 5).map((specialty) => (
                  <Badge
                    key={specialty.value}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950"
                    onClick={() => {
                      setActiveTab('professionals');
                      setSpecialtyFilter(specialty.value);
                    }}
                  >
                    {specialty.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Professionals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Top Professionals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProfessionals.slice(0, 3).map((professional) => (
                  <Link
                    key={professional.id}
                    href={`/profile/${professional.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
                  >
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={professional.profile_photo_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(professional.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{professional.full_name}</p>
                      <p className="text-xs text-muted-foreground">{professional.degree}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Procedures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Popular Procedures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PROCEDURE_TYPES.slice(0, 5).map((procedure) => (
                  <Badge
                    key={procedure.value}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950"
                    onClick={() => {
                      setActiveTab('cases');
                      setProcedureFilter(procedure.value);
                    }}
                  >
                    {procedure.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientDashboardLayout>
  );
}
