import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ChevronRight, ShieldQuestion } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import StatusBadge from '../components/borrow/StatusBadge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import ItemImage from '../components/items/ItemImage';
import ConditionReport from '../components/transactions/ConditionReport';
import { disputeService } from '../services/borrowService';
import { useAuth } from '../store/AuthContext';
import { timeAgo, formatDate } from '../utils/format';

export default function DisputeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [response, setResponse] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dispute', id],
    queryFn: () => disputeService.get(id),
  });

  const addEvidence = useMutation({
    mutationFn: () => disputeService.addEvidence(id, { description: response }),
    onSuccess: () => {
      toast.success('Your response was added to the case.');
      setResponse('');
      queryClient.invalidateQueries({ queryKey: ['dispute', id] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner label="Loading dispute..." />;
  if (isError || !data?.dispute) return <div className="container-app py-10"><ErrorState onRetry={refetch} /></div>;

  const dispute = data.dispute;
  const isParty = [String(dispute.raisedBy?._id), String(dispute.against?._id)].includes(String(user?._id));
  const canRespond = isParty && ['open', 'under_review'].includes(dispute.status);

  return (
    <PageTransition className="container-app max-w-3xl py-8">
      <nav className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
        <Link to="/disputes" className="hover:text-brand-600">Disputes</Link>
        <ChevronRight size={12} />
        <span className="text-ink-soft">{dispute.reason}</span>
      </nav>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <ItemImage src={dispute.item?.images?.[0]} alt={dispute.item?.name} className="h-16 w-20 rounded-xl" />
            <div>
              <h1 className="font-display text-xl font-extrabold">{dispute.reason}</h1>
              <p className="text-xs text-ink-muted">
                {dispute.item?.name} · opened {timeAgo(dispute.createdAt)}
              </p>
            </div>
          </div>
          <StatusBadge status={dispute.status} />
        </div>

        <div className="mt-4 flex flex-wrap gap-6 border-t border-ink/5 pt-4 text-sm">
          <div className="flex items-center gap-2">
            <Avatar src={dispute.raisedBy?.avatar} name={dispute.raisedBy?.name} size="sm" />
            <div>
              <p className="text-xs font-bold">{dispute.raisedBy?.name}</p>
              <p className="text-[10px] text-ink-muted">Raised the dispute</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar src={dispute.against?.avatar} name={dispute.against?.name} size="sm" />
            <div>
              <p className="text-xs font-bold">{dispute.against?.name}</p>
              <p className="text-[10px] text-ink-muted">Responding party</p>
            </div>
          </div>
        </div>
      </div>

      {/* Condition comparison from the underlying transaction */}
      {dispute.transaction?.conditionBefore && (
        <div className="card mt-5 p-6">
          <h2 className="mb-4 font-display text-base font-bold">Recorded condition</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ConditionReport title="Condition before" report={dispute.transaction.conditionBefore} />
            <ConditionReport title="Condition after" report={dispute.transaction.conditionAfter} />
          </div>
        </div>
      )}

      {/* Evidence thread */}
      <div className="card mt-5 p-6">
        <h2 className="mb-4 font-display text-base font-bold">Evidence & statements</h2>
        <div className="space-y-4">
          {dispute.evidence.map((entry, i) => (
            <div key={i} className="flex gap-3">
              <Avatar src={entry.by?.avatar} name={entry.by?.name} size="sm" />
              <div className="flex-1 rounded-2xl bg-cream p-4">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <p className="text-xs font-bold">{entry.by?.name}</p>
                  <p className="text-[10px] text-ink-muted">{timeAgo(entry.at)}</p>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{entry.description}</p>
                {entry.photos?.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {entry.photos.map((p, j) => (
                      <ItemImage key={j} src={p} alt="evidence" className="h-16 w-20 rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {canRespond && (
          <div className="mt-5 border-t border-ink/5 pt-5">
            <Textarea
              label="Add your side"
              placeholder="Explain your perspective. Facts, dates and photos help the moderator decide fairly."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              maxLength={1000}
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={() => addEvidence.mutate()} loading={addEvidence.isPending} disabled={response.trim().length < 10}>
                Submit statement
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Resolution */}
      {dispute.resolution && (
        <div className="card mt-5 border-l-4 border-l-mint-500 p-6">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <ShieldQuestion size={17} className="text-mint-700" /> Moderator resolution
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{dispute.resolution}</p>
          {dispute.resolvedAt && <p className="mt-2 text-[11px] text-ink-muted">Resolved on {formatDate(dispute.resolvedAt)}</p>}
        </div>
      )}
    </PageTransition>
  );
}
