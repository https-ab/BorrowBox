import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '../../components/ui/PageTransition';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import StatusBadge from '../../components/borrow/StatusBadge';
import { adminService } from '../../services/borrowService';
import { formatINR, formatDateShort } from '../../utils/format';

export default function AdminTransactions() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-transactions', status, page],
    queryFn: () => adminService.transactions({ status: status || undefined, page, limit: 15 }),
  });

  return (
    <PageTransition>
      <h1 className="font-display text-2xl font-extrabold">Transactions</h1>
      <p className="mt-1 text-sm text-ink-muted">Full borrowing history across the platform.</p>

      <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="mt-5 max-w-[14rem]">
        <option value="">All statuses</option>
        {['approved', 'active', 'returned', 'completed', 'disputed', 'cancelled'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>

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
                <th className="px-5 py-3.5">Borrower</th>
                <th className="px-5 py-3.5">Period</th>
                <th className="px-5 py-3.5">Rent</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((t) => (
                <tr key={t._id} className="border-b border-ink/5 last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3 font-bold">{t.item?.name || '—'}</td>
                  <td className="px-5 py-3 text-ink-soft">{t.owner?.name}</td>
                  <td className="px-5 py-3 text-ink-soft">{t.borrower?.name}</td>
                  <td className="px-5 py-3 text-ink-soft">
                    {formatDateShort(t.startDate)} – {formatDateShort(t.endDate)}
                  </td>
                  <td className="px-5 py-3 font-semibold">{formatINR(t.rentTotal)}</td>
                  <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
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
    </PageTransition>
  );
}
