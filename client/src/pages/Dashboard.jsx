import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Handshake, Package, Inbox, ShieldCheck, ArrowRight, Star, PackageOpen, IndianRupee,
} from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import StatCard from '../components/dashboard/StatCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import BorrowingRow from '../components/dashboard/BorrowingRow';
import ItemCard from '../components/items/ItemCard';
import ReviewForm from '../components/reviews/ReviewForm';
import ItemImage from '../components/items/ItemImage';
import { dashboardService, reviewService } from '../services/borrowService';
import { useAuth } from '../store/AuthContext';
import { greeting, formatINR } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const [reviewTarget, setReviewTarget] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.get,
  });
  const { data: pendingReviews } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: reviewService.pending,
  });

  if (isLoading) return <Spinner label="Loading your dashboard..." />;
  if (isError) return <div className="container-app py-10"><ErrorState onRetry={refetch} /></div>;

  const { stats, currentlyBorrowing, lendingActive, recommended, monthlyActivity } = data;
  const toReview = pendingReviews?.transactions || [];

  return (
    <PageTransition className="container-app py-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Here's what's happening in your BorrowBox world.</p>
        </div>
        <Link to="/list"><Button variant="secondary" icon={Package}>List an item</Button></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Handshake} label="Currently borrowing" value={stats.currentlyBorrowing} tone="brand" delay={0} />
        <StatCard icon={Package} label="My items" value={stats.myItems} tone="lime" delay={0.05} />
        <StatCard icon={Inbox} label="Pending requests" value={stats.pendingRequests} tone="amber" delay={0.1} />
        <StatCard icon={ShieldCheck} label="Trust score" value={`${stats.trustScore}`} tone="mint" delay={0.15} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Activity chart */}
        <section className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Your activity</h2>
            <div className="flex items-center gap-4 text-[11px] font-bold text-ink-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" />Borrowed</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-lime-600" />Lent</span>
            </div>
          </div>
          <div className="mt-4">
            <ActivityChart data={monthlyActivity} />
          </div>
          {stats.totalEarnings > 0 && (
            <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-lime-300/30 px-3.5 py-2.5 text-xs font-bold text-ink">
              <IndianRupee size={13} />
              Lifetime lending earnings: {formatINR(stats.totalEarnings)}
            </p>
          )}
        </section>

        {/* Currently borrowing / lending */}
        <section className="card p-5">
          <h2 className="mb-3 font-display text-base font-bold">Currently borrowing</h2>
          {currentlyBorrowing.length ? (
            <div className="space-y-1">
              {currentlyBorrowing.map((t) => <BorrowingRow key={t._id} transaction={t} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <PackageOpen size={22} className="text-ink/20" />
              <p className="text-xs text-ink-muted">You haven't borrowed anything yet.</p>
              <Link to="/explore"><Button size="sm" variant="outline">Explore items</Button></Link>
            </div>
          )}

          {lendingActive.length > 0 && (
            <>
              <h2 className="mb-3 mt-6 font-display text-base font-bold">You're lending</h2>
              <div className="space-y-1">
                {lendingActive.map((t) => (
                  <Link key={t._id} to={`/transactions/${t._id}`} className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-brand-50/60">
                    <ItemImage src={t.item?.images?.[0]} alt={t.item?.name} className="h-12 w-14 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{t.item?.name}</p>
                      <p className="text-xs text-ink-muted">with {t.borrower?.name}</p>
                    </div>
                    <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-bold uppercase text-brand-700">{t.status}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Reviews owed */}
      {toReview.length > 0 && (
        <section className="card mt-6 border-l-4 border-l-amber-400 p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <Star size={17} className="fill-amber-400 text-amber-400" /> Leave a review
          </h2>
          <p className="mt-1 text-xs text-ink-muted">Reviews grow everyone's trust scores — including yours.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {toReview.slice(0, 4).map((t) => {
              const other = String(t.owner._id) === String(user._id) ? t.borrower : t.owner;
              return (
                <button
                  key={t._id}
                  onClick={() => setReviewTarget({ id: t._id, name: other.name })}
                  className="flex items-center gap-2.5 rounded-2xl border border-ink/10 px-3.5 py-2.5 text-left transition-all hover:border-brand-300 hover:shadow-soft"
                >
                  <ItemImage src={t.item?.images?.[0]} alt="" className="h-10 w-12 rounded-lg" />
                  <span>
                    <span className="block text-xs font-bold">{t.item?.name}</span>
                    <span className="text-[11px] text-ink-muted">with {other.name}</span>
                  </span>
                  <ArrowRight size={14} className="text-brand-500" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold">Recommended near you</h2>
            <Link to="/explore" className="text-sm font-bold text-brand-600 hover:text-brand-700">Explore all →</Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommended.slice(0, 4).map((item, i) => <ItemCard key={item._id} item={item} index={i} />)}
          </div>
        </section>
      )}

      <ReviewForm
        open={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        transactionId={reviewTarget?.id}
        revieweeName={reviewTarget?.name}
      />
    </PageTransition>
  );
}
