import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import ItemCard from '../components/items/ItemCard';
import ItemCardSkeleton from '../components/items/ItemCardSkeleton';
import FiltersPanel from '../components/items/FiltersPanel';
import SortSelect from '../components/items/SortSelect';
import useDebounce from '../hooks/useDebounce';
import { itemService } from '../services/itemService';
import { useAuth } from '../store/AuthContext';
import { CITIES, DEFAULT_COORDS } from '../utils/constants';

/** The main discovery marketplace. */
export default function Explore() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);

  const search = params.get('search') || '';
  const debouncedSearch = useDebounce(search, 400);

  const filters = useMemo(
    () => ({
      category: params.get('category') || '',
      condition: params.get('condition') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      maxDistance: params.get('maxDistance') || '',
      minRating: params.get('minRating') || '',
      minTrust: params.get('minTrust') || '',
      from: params.get('from') || '',
      to: params.get('to') || '',
    }),
    [params]
  );
  const sort = params.get('sort') || 'recent';

  const coords = CITIES[user?.city] || DEFAULT_COORDS;

  const updateParams = (next) => {
    const merged = { search, sort, ...filters, ...next };
    const clean = Object.fromEntries(Object.entries(merged).filter(([, v]) => v));
    setParams(clean, { replace: true });
    setPage(1);
  };

  const queryParams = {
    search: debouncedSearch || undefined,
    sort,
    page,
    limit: 12,
    lat: coords.lat,
    lng: coords.lng,
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['items', queryParams],
    queryFn: () => itemService.list(queryParams),
    placeholderData: keepPreviousData,
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <PageTransition className="container-app py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Explore items</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {data?.pagination?.total != null ? `${data.pagination.total} items available near ${user?.city || 'Pune'}` : 'Discover things worth borrowing'}
        </p>
      </div>

      {/* Search + sort row */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => updateParams({ search: e.target.value })}
            placeholder="Search cameras, tools, books..."
            className="input-base !rounded-2xl !py-3 pl-10"
          />
        </div>
        <SortSelect value={sort} onChange={(v) => updateParams({ sort: v })} className="w-44" />
        <Button
          variant="outline"
          icon={SlidersHorizontal}
          className="lg:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </div>

      <div className="flex gap-6">
        <FiltersPanel
          filters={filters}
          onChange={(next) => updateParams(next)}
          onClear={() => { setParams(search ? { search } : {}, { replace: true }); setPage(1); }}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        <div className="min-w-0 flex-1">
          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => <ItemCardSkeleton key={i} />)}
            </div>
          ) : data?.items?.length ? (
            <>
              <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 ${isFetching ? 'opacity-60' : ''} transition-opacity`}>
                {data.items.map((item, i) => <ItemCard key={item._id} item={item} index={i} />)}
              </div>
              {data.pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <span className="px-3 text-sm font-semibold text-ink-soft">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={!data.pagination.hasMore} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="Nothing found"
              message="Nothing nearby yet. Try expanding your search radius or clearing some filters."
              action={<Button variant="outline" size="sm" onClick={() => { setParams({}, { replace: true }); setPage(1); }}>Clear filters</Button>}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
