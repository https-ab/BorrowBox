import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin, ShieldCheck, Landmark, ScrollText, Eye, Repeat, ChevronRight, Info,
} from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import StarRating from '../components/ui/StarRating';
import Badge from '../components/ui/Badge';
import ItemGallery from '../components/items/ItemGallery';
import ConditionBadge from '../components/items/ConditionBadge';
import OwnerCard from '../components/items/OwnerCard';
import BorrowRequestPanel from '../components/borrow/BorrowRequestPanel';
import ReviewCard from '../components/reviews/ReviewCard';
import MapPlaceholder from '../components/map/MapPlaceholder';
import { itemService } from '../services/itemService';
import { reviewService } from '../services/borrowService';
import { formatINR } from '../utils/format';

export default function ItemDetails() {
  const { id } = useParams();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemService.get(id),
  });
  const { data: reviewData } = useQuery({
    queryKey: ['item-reviews', id],
    queryFn: () => reviewService.forItem(id),
    enabled: Boolean(data),
  });

  if (isLoading) return <Spinner label="Loading item..." />;
  if (isError || !data?.item) return <div className="container-app py-10"><ErrorState message="This item is no longer available." onRetry={refetch} /></div>;

  const { item, bookedRanges } = data;
  const reviews = reviewData?.reviews || [];

  return (
    <PageTransition className="container-app py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
        <Link to="/explore" className="hover:text-brand-600">Explore</Link>
        <ChevronRight size={12} />
        <Link to={`/explore?category=${item.category}`} className="hover:text-brand-600">{item.category}</Link>
        <ChevronRight size={12} />
        <span className="truncate text-ink-soft">{item.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        {/* LEFT column */}
        <div className="min-w-0 space-y-8">
          <ItemGallery images={item.images} name={item.name} />

          {/* Title block */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ConditionBadge condition={item.condition} />
              {item.status === 'paused' && <Badge tone="amber">Paused by owner</Badge>}
              <span className="flex items-center gap-1 text-xs text-ink-muted"><Eye size={12} /> {item.views} views</span>
              <span className="flex items-center gap-1 text-xs text-ink-muted"><Repeat size={12} /> borrowed {item.borrowCount}×</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">{item.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <StarRating rating={item.rating} count={item.reviewCount} />
              <span className="flex items-center gap-1 text-ink-muted">
                <MapPin size={13} /> {item.area ? `${item.area}, ` : ''}{item.city}
              </span>
            </div>
          </div>

          {/* About */}
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">About this item</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{item.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-cream p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Price</p>
                <p className="mt-0.5 font-display text-lg font-extrabold text-brand-600">{formatINR(item.pricePerDay)}<span className="text-xs font-semibold text-ink-muted">/day</span></p>
              </div>
              <div className="rounded-xl bg-cream p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Deposit</p>
                <p className="mt-0.5 font-display text-lg font-extrabold">{formatINR(item.deposit)}</p>
                <p className="text-[10px] text-ink-muted">fully refundable</p>
              </div>
              <div className="rounded-xl bg-cream p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Borrow period</p>
                <p className="mt-0.5 font-display text-lg font-extrabold">{item.minDays}–{item.maxDays}<span className="text-xs font-semibold text-ink-muted"> days</span></p>
              </div>
            </div>
          </section>

          {/* Condition */}
          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <ShieldCheck size={18} className="text-mint-500" /> Condition
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <ConditionBadge condition={item.condition} />
              <p className="text-sm text-ink-soft">
                {item.conditionNotes || 'The owner keeps this item in the stated condition. It is verified again at every handover.'}
              </p>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3.5 text-xs leading-relaxed text-brand-800">
              <Info size={14} className="mt-0.5 shrink-0" />
              Condition is photographed and recorded at handover and again at return — both of you confirm it, so there are never surprises.
            </div>
          </section>

          {/* Borrowing rules */}
          {item.rules && (
            <section className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <ScrollText size={18} className="text-brand-500" /> Borrowing rules
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{item.rules}</p>
            </section>
          )}

          {/* Deposit note */}
          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Landmark size={18} className="text-amber-500" /> Security deposit
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              A refundable deposit of <strong>{formatINR(item.deposit)}</strong> protects the owner.
              It is released in full once the item is returned in the recorded condition.
            </p>
          </section>

          {/* Location */}
          <section>
            <h2 className="mb-3 font-display text-lg font-bold">Location</h2>
            <MapPlaceholder
              label={`${item.area ? `${item.area}, ` : ''}${item.city}`}
              sublabel="Approximate pickup area"
              pins={[{ x: 50, y: 45, label: item.name.split(' ').slice(0, 2).join(' '), primary: true }]}
              className="h-64"
            />
          </section>

          {/* Reviews */}
          <section className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Reviews</h2>
              <StarRating rating={item.rating} count={item.reviewCount} />
            </div>
            {reviews.length ? (
              <div className="mt-2">
                {reviews.map((review) => <ReviewCard key={review._id} review={review} />)}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-muted">No reviews yet — be the first borrower!</p>
            )}
          </section>
        </div>

        {/* RIGHT column */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          <BorrowRequestPanel item={item} bookedRanges={bookedRanges} />
          <OwnerCard owner={item.owner} />
        </div>
      </div>
    </PageTransition>
  );
}
