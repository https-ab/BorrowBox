import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Check, X, ExternalLink } from 'lucide-react';
import ItemImage from '../items/ItemImage';
import Avatar from '../ui/Avatar';
import TrustBadge from '../trust/TrustBadge';
import StatusBadge from './StatusBadge';
import Button from '../ui/Button';
import { requestService } from '../../services/borrowService';
import { formatINR, formatDateShort, timeAgo } from '../../utils/format';

/** A single borrow request row - incoming (owner view) or outgoing (borrower view). */
export default function RequestCard({ request, mode }) {
  const queryClient = useQueryClient();
  const otherUser = mode === 'incoming' ? request.borrower : request.owner;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['requests'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const approve = useMutation({
    mutationFn: () => requestService.approve(request._id),
    onSuccess: () => { toast.success('Request approved! A transaction has been created.'); invalidate(); },
    onError: (e) => { toast.error(e.message); invalidate(); },
  });
  const reject = useMutation({
    mutationFn: () => requestService.reject(request._id),
    onSuccess: () => { toast('Request declined.'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const cancel = useMutation({
    mutationFn: () => requestService.cancel(request._id),
    onSuccess: () => { toast('Request cancelled.'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex gap-4">
        <Link to={`/items/${request.item?._id}`} className="shrink-0">
          <ItemImage src={request.item?.images?.[0]} alt={request.item?.name} className="h-20 w-24 rounded-xl sm:h-24 sm:w-32" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to={`/items/${request.item?._id}`} className="font-display text-sm font-bold hover:text-brand-600 sm:text-base">
                {request.item?.name}
              </Link>
              <p className="text-xs text-ink-muted">
                {formatDateShort(request.startDate)} – {formatDateShort(request.endDate)} · {request.days} day{request.days > 1 ? 's' : ''} · requested {timeAgo(request.createdAt)}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Link to={`/users/${otherUser?._id}`} className="flex items-center gap-1.5 rounded-full bg-ink/[0.04] py-1 pl-1 pr-2.5 transition-colors hover:bg-brand-50">
              <Avatar src={otherUser?.avatar} name={otherUser?.name} size="xs" />
              <span className="text-xs font-semibold">{otherUser?.name}</span>
              <TrustBadge score={otherUser?.trustScore} level={otherUser?.trustLevel} />
            </Link>
            <span className="text-sm font-bold text-brand-600">{formatINR(request.grandTotal)}</span>
            <span className="text-[11px] text-ink-muted">incl. {formatINR(request.deposit)} deposit</span>
          </div>

          {request.message && (
            <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-xs italic leading-relaxed text-ink-soft">
              “{request.message}”
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {mode === 'incoming' && request.status === 'pending' && (
              <>
                <Button size="sm" icon={Check} onClick={() => approve.mutate()} loading={approve.isPending}>
                  Accept
                </Button>
                <Button size="sm" variant="outline" icon={X} onClick={() => reject.mutate()} loading={reject.isPending}>
                  Decline
                </Button>
              </>
            )}
            {mode === 'outgoing' && request.status === 'pending' && (
              <Button size="sm" variant="outline" icon={X} onClick={() => cancel.mutate()} loading={cancel.isPending}>
                Cancel request
              </Button>
            )}
            {request.transaction && ['approved'].includes(request.status) && (
              <Link to={`/transactions/${request.transaction}`}>
                <Button size="sm" variant="ghost" icon={ExternalLink}>View transaction</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
