import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, Inbox, Repeat, IndianRupee, Pencil, Trash2, Pause, Play, MoreVertical } from 'lucide-react';
import ItemImage from '../items/ItemImage';
import StatusBadge from '../borrow/StatusBadge';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import { itemService } from '../../services/itemService';
import { formatINR, formatDateShort } from '../../utils/format';

/** Owner's management card for one listed item. */
export default function MyItemCard({ item }) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['my-items'] });

  const toggleStatus = useMutation({
    mutationFn: () => itemService.setStatus(item._id, item.status === 'active' ? 'paused' : 'active'),
    onSuccess: () => { toast.success(item.status === 'active' ? 'Listing paused.' : 'Listing is live again!'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => itemService.remove(item._id),
    onSuccess: () => { toast.success('Item removed.'); setConfirmDelete(false); invalidate(); },
    onError: (e) => { toast.error(e.message); setConfirmDelete(false); },
  });

  return (
    <div className="card overflow-hidden">
      <div className="relative">
        <Link to={`/items/${item._id}`}>
          <ItemImage src={item.images?.[0]} alt={item.name} className="aspect-[16/9] w-full" />
        </Link>
        <div className="absolute left-3 top-3 flex gap-2">
          <StatusBadge status={item.status} />
          {item.currentBorrow && <Badge tone="lime">Borrowed until {formatDateShort(item.currentBorrow.endDate)}</Badge>}
        </div>
        {item.pendingRequests > 0 && (
          <Link to="/requests?tab=incoming" className="absolute right-3 top-3">
            <Badge tone="amber" icon={Inbox}>{item.pendingRequests} request{item.pendingRequests > 1 ? 's' : ''}</Badge>
          </Link>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/items/${item._id}`} className="line-clamp-1 font-display text-sm font-bold hover:text-brand-600">
              {item.name}
            </Link>
            <p className="text-xs text-ink-muted">{item.category} · {formatINR(item.pricePerDay)}/day</p>
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="rounded-lg p-1.5 text-ink-muted hover:bg-ink/5">
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-ink/5 bg-white py-1 shadow-lift" onMouseLeave={() => setMenuOpen(false)}>
                <Link to={`/items/${item._id}/edit`} className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-brand-50">
                  <Pencil size={13} /> Edit listing
                </Link>
                <button
                  onClick={() => { toggleStatus.mutate(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-brand-50"
                >
                  {item.status === 'active' ? <><Pause size={13} /> Pause listing</> : <><Play size={13} /> Activate listing</>}
                </button>
                <button
                  onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-ink/5 pt-3 text-center">
          <div>
            <p className="flex items-center justify-center gap-1 text-sm font-extrabold"><Eye size={12} className="text-ink-muted" />{item.views}</p>
            <p className="text-[10px] font-semibold text-ink-muted">Views</p>
          </div>
          <div>
            <p className="flex items-center justify-center gap-1 text-sm font-extrabold"><Repeat size={12} className="text-ink-muted" />{item.borrowCount}</p>
            <p className="text-[10px] font-semibold text-ink-muted">Borrows</p>
          </div>
          <div>
            <p className="text-sm font-extrabold">{item.rating ? item.rating.toFixed(1) : '–'}</p>
            <p className="text-[10px] font-semibold text-ink-muted">Rating</p>
          </div>
          <div>
            <p className="flex items-center justify-center text-sm font-extrabold text-mint-700"><IndianRupee size={11} />{(item.totalEarnings || 0).toLocaleString('en-IN')}</p>
            <p className="text-[10px] font-semibold text-ink-muted">Earned</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        danger
        title="Delete this listing?"
        message={`"${item.name}" will be removed from BorrowBox. Past transaction history is kept for both parties.`}
        confirmLabel="Delete listing"
      />
    </div>
  );
}
