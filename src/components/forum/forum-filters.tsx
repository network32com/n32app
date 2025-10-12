'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FORUM_CATEGORIES } from '@/lib/shared/constants/forum';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { useState } from 'react';

interface ForumFiltersProps {
  currentCategory?: string;
  currentSort?: 'latest' | 'trending';
  currentSearch?: string;
}

export function ForumFilters({ currentCategory, currentSort, currentSearch }: ForumFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentSearch || '');

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/forum?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const clearFilters = () => {
    setSearchInput('');
    router.push('/forum');
  };

  const hasFilters = currentCategory || currentSearch;

  return (
    <div className="mb-6 space-y-4">
      {/* Search and Sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input
            placeholder="Search discussions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          <Button
            variant={currentSort === 'latest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilters({ sort: 'latest' })}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            Latest
          </Button>
          <Button
            variant={currentSort === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilters({ sort: 'trending' })}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Trending
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Categories:</span>
        <Button
          variant={!currentCategory ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilters({ category: undefined })}
        >
          All
        </Button>
        {FORUM_CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={currentCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilters({ category: cat.value })}
          >
            {cat.label}
          </Button>
        ))}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
