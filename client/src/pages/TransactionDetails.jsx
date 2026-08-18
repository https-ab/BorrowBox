import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HandHelping, Undo2, BadgeCheck, Gavel, Star, ChevronRight } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import ItemImage from '../components/items/ItemImage';
import StatusBadge from '../components/borrow/StatusBadge';
import TrustBadge from '../components/trust/TrustBadge';
import TransactionTimeline from '../components/transactions/TransactionTimeline';
import ConditionReport from '../components/transactions/ConditionReport';
import ConditionForm from '../components/transactions/ConditionForm';
import DisputeForm from '../components/disputes/DisputeForm';
import ReviewForm from '../components/reviews/ReviewForm';
import CostBreakdown from '../components/borrow/CostBreakdown';
import { transactionService } from '../services/borrowService';
import { useAuth } from '../store/AuthContext';
import { formatDate } from '../utils/format';

export default function TransactionDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionService.get(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['transaction', id] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const handover = useMutation({
    mutationFn: (report) => transactionService.handover(id, report),
    onSuccess: () => { toast.success('Handover recorded. Borrowing has started!'); setHandoverOpen(false); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const initiateReturn = useMutation({
    mutationFn: () => transactionService.initiateReturn(id),
    onSuccess: () => { toast.success('Marked as returned. The owner will confirm the condition.'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const confirmReturn = useMutation({
    mutationFn: (report) => transactionService.confirmReturn(id, report),
    onSuccess: () => { toast.success('Return confirmed — transaction completed! 🎉'); setConfirmOpen(false); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner label="Loading transaction..." />;
  if (isError || !data?.transaction) return <div className="container-app py-10"><ErrorState onRetry={refetch} /></div>;

  const txn = data.transaction;
  const isOwner = String(txn.owner._id) === String(user._id);
  const other = isOwner ? txn.borrower : txn.owner;

  return (
    <PageTransition className="container-app max-w-5xl py-8">
      <nav className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
        <Link to="/requests?tab=activity" className="hover:text-brand-600">Transactions</Link>
        <ChevronRight size={12} />
        <span className="text-ink-soft">{txn.item?.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          {/* Summary card */}
          <div className="card p-6">
            <div className="flex flex-wrap items-start gap-4">
              <Link to={`/items/${txn.item?._id}`}>
                <ItemImage src={txn.item?.images?.[0]} alt={txn.item?.name} className="h-24 w-32 rounded-2xl" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl font-extrabold">{txn.item?.name}</h1>
                  <StatusBadge status={txn.status} />
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {formatDate(txn.startDate)} → {formatDate(txn.endDate)} · {txn.days} day{txn.days > 1 ? 's' : ''}
                </p>
                <Link to={`/users/${other._id}`} className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink/[0.04] py-1 pl-1 pr-3 hover:bg-brand-50">
                  <Avatar src={other.avatar} name={other.name} size="xs" />
                  <span className="text-xs font-semibold">
                    {isOwner ? 'Borrower' : 'Owner'}: {other.name}
                  </span>
                  <TrustBadge score={other.trustScore} level={other.trustLevel} />
                </Link>
              </div>
            </div>

            {/* Contextual actions */}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-ink/5 pt-4">
              {isOwner && txn.status === 'approved' && (
                <Button icon={HandHelping} onClick={() => setHandoverOpen(true)}>
                  Record handover & start borrowing
                </Button>
              )}
              {!isOwner && txn.status === 'active' && (
                <Button icon={Undo2} onClick={() => initiateReturn.mutate()} loading={initiateReturn.isPending}>
                  I've returned this item
                </Button>
              )}
              {isOwner && txn.status === 'returned' && (
                <Button icon={BadgeCheck} onClick={() => setConfirmOpen(true)}>
                  Confirm condition & complete
                </Button>
              )}
              {txn.status === 'completed' && (
                <Button icon={Star} variant="secondary" onClick={() => setReviewOpen(true)}>
                  Leave a review
                </Button>
              )}
              {['active', 'returned', 'completed'].includes(txn.status) && !txn.dispute && (
                <Button variant="outline" icon={Gavel} onClick={() => setDisputeOpen(true)}>
                  Report a problem
                </Button>
              )}
              {txn.dispute && (
                <Link to={`/disputes/${txn.dispute._id || txn.dispute}`}>
                  <Button variant="danger" icon={Gavel}>View dispute</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Condition before vs after */}
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Condition tracking</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ConditionReport
                title="Condition before"
                report={txn.conditionBefore}
                emptyHint={isOwner ? 'Record it at handover.' : 'The owner records this at handover.'}
              />
              <ConditionReport
                title="Condition after"
                report={txn.conditionAfter}
                emptyHint={isOwner ? 'Record it when the item comes back.' : 'The owner confirms this on return.'}
              />
            </div>
            {txn.returnedOnTime === false && (
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700">
                ⚠️ This item was returned after the agreed end date.
              </p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-base font-bold">Timeline</h2>
            <TransactionTimeline timeline={txn.timeline} status={txn.status} />
          </div>
          <div className="card p-6">
            <h2 className="mb-4 font-display text-base font-bold">Payment summary</h2>
            <CostBreakdown pricePerDay={txn.rentTotal / txn.days} days={txn.days} deposit={txn.deposit} />
            <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
              {txn.status === 'completed'
                ? 'Transaction completed — the deposit has been released.'
                : 'The deposit is released once the owner confirms the returned condition.'}
            </p>
          </div>
        </div>
      </div>

      <ConditionForm
        open={handoverOpen}
        onClose={() => setHandoverOpen(false)}
        title="Record condition at handover"
        submitLabel="Start borrowing"
        loading={handover.isPending}
        onSubmit={(report) => handover.mutate(report)}
      />
      <ConditionForm
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm returned condition"
        submitLabel="Complete transaction"
        loading={confirmReturn.isPending}
        onSubmit={(report) => confirmReturn.mutate(report)}
      />
      <DisputeForm open={disputeOpen} onClose={() => setDisputeOpen(false)} transactionId={id} />
      <ReviewForm open={reviewOpen} onClose={() => setReviewOpen(false)} transactionId={id} revieweeName={other.name} />
    </PageTransition>
  );
}
