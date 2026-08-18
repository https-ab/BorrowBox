import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Gavel } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/borrow/StatusBadge';
import ItemImage from '../components/items/ItemImage';
import Avatar from '../components/ui/Avatar';
import { disputeService } from '../services/borrowService';
import { useAuth } from '../store/AuthContext';
import { timeAgo } from '../utils/format';

export default function Disputes() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['disputes'],
    queryFn: disputeService.mine,
  });

  if (isLoading) return <Spinner label="Loading disputes..." />;
  if (isError) return <div className="container-app py-10"><ErrorState onRetry={refetch} /></div>;

  const disputes = data?.disputes || [];

  return (
    <PageTransition className="container-app max-w-3xl py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Disputes</h1>
        <p className="mt-1 text-sm text-ink-muted">Cases you've raised or need to respond to.</p>
      </div>

      {disputes.length ? (
        <div className="space-y-4">
          {disputes.map((dispute) => {
            const raisedByMe = String(dispute.raisedBy?._id) === String(user?._id);
            const other = raisedByMe ? dispute.against : dispute.raisedBy;
            return (
              <Link key={dispute._id} to={`/disputes/${dispute._id}`} className="card flex items-center gap-4 p-4 transition-all hover:shadow-lift">
                <ItemImage src={dispute.item?.images?.[0]} alt={dispute.item?.name} className="h-16 w-20 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-bold">{dispute.reason}</p>
                    <StatusBadge status={dispute.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {dispute.item?.name} · opened {timeAgo(dispute.createdAt)} · {raisedByMe ? 'raised by you' : `raised by ${dispute.raisedBy?.name}`}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Avatar src={other?.avatar} name={other?.name} size="xs" />
                    <span className="text-xs font-semibold text-ink-soft">vs {other?.name}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Gavel}
          title="No disputes — that's a good thing!"
          message="If a transaction ever goes wrong, you can open a case from the transaction page and a moderator will step in."
        />
      )}
    </PageTransition>
  );
}
