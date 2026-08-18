import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Trash2 } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/borrow/StatusBadge';
import ItemImage from '../../components/items/ItemImage';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import useDebounce from '../../hooks/useDebounce';
import { adminService } from '../../services/borrowService';
import { formatINR } from '../../utils/format';

export default function AdminListings() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const debounced = useDebounce(search);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-items', debounced, page],
    queryFn: () => adminService.items({ search: debounced || undefined, page, limit: 15 }),
  });

  const remove = useMutation({
    mutationFn: (id) => adminService.removeItem(id, 'Removed by moderation.'),
    onSuccess: () => {
      toast.success('Listing removed and the owner has been notified.');
      setTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <PageTransition>
      <h1 className="font-display text-2xl font-extrabold">Listings</h1>
      <p className="mt-1 text-sm text-ink-muted">Review and moderate all items on the platform.</p>

      <div className="relative mt-5 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search listings..."
          className="input-base pl-9"
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="card mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink/5 text-left text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                <th className="px-5 py-3.5">Item</th>
                <th className="px-5 py-3.5">Owner</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Borrows</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item._id} className="border-b border-ink/5 last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3">
                    <Link to={`/items/${item._id}`} className="flex items-center gap-3 hover:text-brand-600">
                      <ItemImage src={item.images?.[0]} alt="" className="h-10 w-14 rounded-lg" />
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-ink-muted">{item.category} · {item.city}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{item.owner?.name}</td>
                  <td className="px-5 py-3 font-semibold">{formatINR(item.pricePerDay)}/d</td>
                  <td className="px-5 py-3 text-ink-soft">{item.borrowCount}</td>
                  <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-5 py-3 text-right">
                    {item.status !== 'removed' && (
                      <Button size="sm" variant="danger" icon={Trash2} onClick={() => setTarget(item)}>
                        Remove
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 px-5 py-3">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <span className="text-xs font-semibold text-ink-muted">{page}/{data.pagination.totalPages}</span>
              <Button size="sm" variant="outline" disabled={!data.pagination.hasMore} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        onConfirm={() => remove.mutate(target._id)}
        loading={remove.isPending}
        danger
        title="Remove this listing?"
        message={`"${target?.name}" will be taken off the platform and its owner will be notified.`}
        confirmLabel="Remove listing"
      />
    </PageTransition>
  );
}
