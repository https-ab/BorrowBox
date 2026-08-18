import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, BadgeCheck, Pencil, PackageOpen } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import TrustScoreRing from '../components/trust/TrustScoreRing';
import TrustBreakdown from '../components/trust/TrustBreakdown';
import UserBadges from '../components/trust/UserBadges';
import ProfileStats from '../components/profile/ProfileStats';
import EditProfileModal from '../components/profile/EditProfileModal';
import ItemCard from '../components/items/ItemCard';
import ReviewCard from '../components/reviews/ReviewCard';
import RatingBars from '../components/reviews/RatingBars';
import { userService } from '../services/authService';
import { reviewService } from '../services/borrowService';
import { useAuth } from '../store/AuthContext';
import { memberSince } from '../utils/format';

/** Public profile page; doubles as "my profile" when the id matches the viewer. */
export default function Profile() {
  const params = useParams();
  const { user: viewer } = useAuth();
  const userId = params.id || viewer?._id;
  const isOwn = viewer && String(userId) === String(viewer._id);

  const [tab, setTab] = useState('about');
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => userService.getProfile(userId),
    enabled: Boolean(userId),
  });
  const { data: reviewData } = useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: () => reviewService.forUser(userId),
    enabled: Boolean(userId),
  });

  if (isLoading) return <Spinner label="Loading profile..." />;
  if (isError || !data?.user) return <div className="container-app py-10"><ErrorState onRetry={refetch} /></div>;

  const { user, items, reviews, borrowHistoryCount } = data;
  const trustBreakdown = isOwn ? viewer.trustBreakdown : null;

  return (
    <PageTransition className="container-app max-w-5xl py-8">
      {/* Header card */}
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-brand-500 via-brand-400 to-lime-400/70" />
        <div className="relative mt-8 flex flex-col items-center gap-5 sm:flex-row sm:items-end">
          <Avatar src={user.avatar} name={user.name} size="2xl" className="ring-4 ring-white shadow-lift" />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="flex items-center justify-center gap-2 font-display text-2xl font-extrabold sm:justify-start">
              {user.name}
              {user.isVerified && <BadgeCheck size={20} className="text-brand-500" />}
            </h1>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-ink-muted sm:justify-start">
              <MapPin size={13} /> {user.city}, India · member since {memberSince(user.createdAt)}
            </p>
            <div className="mt-3 flex justify-center sm:justify-start">
              <UserBadges badges={user.badges} size="sm" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <TrustScoreRing score={user.trustScore} size={92} />
            <span className={`text-xs font-extrabold ${user.trustScore >= 85 ? 'text-mint-700' : 'text-brand-600'}`}>
              {user.trustLevel}
            </span>
          </div>
          {isOwn && (
            <Button variant="outline" size="sm" icon={Pencil} onClick={() => setEditOpen(true)} className="absolute right-0 top-10 sm:static">
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <ProfileStats stats={user.stats} itemCount={items.length} />
      </div>

      <Tabs
        className="mt-8"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'about', label: 'About' },
          { id: 'items', label: 'Items', count: items.length },
          { id: 'reviews', label: 'Reviews', count: reviews.length },
          { id: 'trust', label: 'Trust' },
        ]}
      />

      <div className="mt-6">
        {tab === 'about' && (
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold">About {isOwn ? 'you' : user.name.split(' ')[0]}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {user.bio || 'This member has not written a bio yet.'}
            </p>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-cream p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Borrow history</p>
                <p className="mt-1 font-semibold">{borrowHistoryCount} completed borrow{borrowHistoryCount !== 1 ? 's' : ''}</p>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Average rating</p>
                <p className="mt-1 font-semibold">{user.stats?.averageRating ? `★ ${user.stats.averageRating}` : 'No reviews yet'}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'items' && (
          items.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => <ItemCard key={item._id} item={{ ...item, owner: user }} index={i} />)}
            </div>
          ) : (
            <div className="card flex flex-col items-center gap-2 py-12 text-center">
              <PackageOpen size={24} className="text-ink/20" />
              <p className="text-sm text-ink-muted">No active listings right now.</p>
            </div>
          )
        )}

        {tab === 'reviews' && (
          <div className="card p-6">
            {reviewData?.aggregate && (
              <div className="mb-5 border-b border-ink/5 pb-5">
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-extrabold">{reviewData.aggregate.overall?.toFixed(1)}</span>
                  <span className="text-sm text-ink-muted">overall · {reviewData.aggregate.count} reviews</span>
                </div>
                <RatingBars aggregate={reviewData.aggregate} />
              </div>
            )}
            {reviews.length ? (
              reviews.map((review) => <ReviewCard key={review._id} review={review} />)
            ) : (
              <p className="py-6 text-center text-sm text-ink-muted">No reviews yet.</p>
            )}
          </div>
        )}

        {tab === 'trust' && (
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold">Trust information</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Trust scores are computed from real behaviour — they cannot be bought or edited.
            </p>
            <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="flex flex-col items-center gap-1">
                <TrustScoreRing score={user.trustScore} size={110} />
                <span className="text-sm font-extrabold">{user.trustLevel}</span>
              </div>
              <div className="flex-1">
                {trustBreakdown ? (
                  <TrustBreakdown breakdown={trustBreakdown} />
                ) : (
                  <ul className="space-y-2 text-sm text-ink-soft">
                    <li>✓ {user.stats?.successfulBorrows + user.stats?.successfulLends || 0} successful transactions</li>
                    <li>✓ {user.stats?.onTimeReturns || 0} on-time returns</li>
                    <li>✓ {user.stats?.reviewCount || 0} reviews at ★ {user.stats?.averageRating || '–'} average</li>
                    <li>{user.isVerified ? '✓ Identity verified' : '– Identity not yet verified'}</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isOwn && <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />}
    </PageTransition>
  );
}
