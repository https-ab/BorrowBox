import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { itemService } from '../../services/itemService';
import ItemCard from '../items/ItemCard';
import ItemCardSkeleton from '../items/ItemCardSkeleton';

export default function FeaturedItems() {
  const { data, isLoading } = useQuery({ queryKey: ['featured'], queryFn: itemService.featured });

  return (
    <section className="container-app py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Featured</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold">Loved by the community</h2>
          <p className="mt-2 text-sm text-ink-muted">Top-rated items with a track record of happy borrowers.</p>
        </div>
        <Link to="/explore?sort=rating" className="text-sm font-bold text-brand-600 hover:text-brand-700">See all →</Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <ItemCardSkeleton key={i} />)
          : data?.items?.slice(0, 8).map((item, i) => <ItemCard key={item._id} item={item} index={i} />)}
      </div>
    </section>
  );
}
