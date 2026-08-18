import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, LocateFixed } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import ItemCard from '../components/items/ItemCard';
import ItemCardSkeleton from '../components/items/ItemCardSkeleton';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import MapPlaceholder from '../components/map/MapPlaceholder';
import { itemService } from '../services/itemService';
import { useAuth } from '../store/AuthContext';
import { CITIES, DEFAULT_COORDS } from '../utils/constants';
import toast from 'react-hot-toast';

/** Split-screen nearby discovery: list left, map right. */
export default function Nearby() {
  const { user } = useAuth();
  const cityCoords = CITIES[user?.city] || DEFAULT_COORDS;
  const [coords, setCoords] = useState(cityCoords);
  const [radius, setRadius] = useState('5');
  const [usingGps, setUsingGps] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['nearby', coords, radius],
    queryFn: () => itemService.nearby({ lat: coords.lat, lng: coords.lng, radius }),
  });

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported by your browser.');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUsingGps(true);
        toast.success('Using your precise location.');
      },
      () => toast.error('Could not get your location. Using your city instead.')
    );
  };

  const items = data?.items || [];
  // Spread pins deterministically over the placeholder map
  const pins = items.slice(0, 8).map((item, i) => ({
    x: 14 + ((i * 37) % 70),
    y: 14 + ((i * 23) % 55),
    label: `₹${item.pricePerDay}`,
  }));
  pins.unshift({ x: 50, y: 42, label: 'You', primary: true });

  return (
    <PageTransition className="container-app py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Nearby items</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {items.length ? `${items.length} items within ${radius} km of ${usingGps ? 'you' : user?.city || 'Pune'}` : 'Discover what your neighbours are sharing'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={radius} onChange={(e) => setRadius(e.target.value)} className="w-36" aria-label="Radius">
            <option value="2">Within 2 km</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
          </Select>
          <Button variant="outline" size="md" icon={LocateFixed} onClick={useMyLocation}>
            Use my location
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: item list */}
        <div className="order-2 lg:order-1">
          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => <ItemCardSkeleton key={i} />)}
            </div>
          ) : items.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:max-h-[75vh] lg:overflow-y-auto lg:pr-2">
              {items.map((item, i) => <ItemCard key={item._id} item={item} index={i} />)}
            </div>
          ) : (
            <EmptyState
              icon={MapPin}
              title="Nothing nearby yet"
              message="Nothing nearby yet. Try expanding your search radius."
              action={<Button variant="outline" size="sm" onClick={() => setRadius('50')}>Search within 50 km</Button>}
            />
          )}
        </div>

        {/* RIGHT: map */}
        <div className="order-1 lg:order-2">
          <MapPlaceholder
            label={usingGps ? 'Your location' : `${user?.city || 'Pune'} city centre`}
            sublabel={`${items.length} items within ${radius} km`}
            pins={pins}
            className="h-72 lg:sticky lg:top-24 lg:h-[75vh]"
          />
        </div>
      </div>
    </PageTransition>
  );
}
