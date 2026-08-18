import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Ban, BadgeCheck, ShieldCheck } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import TrustBadge from '../../components/trust/TrustBadge';
import useDebounce from '../../hooks/useDebounce';
import { adminService } from '../../services/borrowService';
import { formatDate } from '../../utils/format';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users', debounced, page],
    queryFn: () => adminService.users({ search: debounced || undefined, page, limit: 15 }),
  });

  const suspend = useMutation({
    mutationFn: ({ id, value }) => adminService.suspendUser(id, value),
    onSuccess: (_, { value }) => {
      toast.success(value ? 'User suspended.' : 'User reinstated.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e) => toast.error(e.message),
  });
  const verify = useMutation({
    mutationFn: ({ id, value }) => adminService.verifyUser(id, value),
    onSuccess: () => {
      toast.success('Verification updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <PageTransition>
      <h1 className="font-display text-2xl font-extrabold">Users</h1>
      <p className="mt-1 text-sm text-ink-muted">Manage members, verification and suspensions.</p>

      <div className="relative mt-5 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
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
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Trust</th>
                <th className="px-5 py-3.5">City</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u._id} className="border-b border-ink/5 last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div>
                        <p className="flex items-center gap-1 font-bold">
                          {u.name}
                          {u.isVerified && <BadgeCheck size={13} className="text-brand-500" />}
                          {u.role === 'admin' && <Badge tone="ink">admin</Badge>}
                        </p>
                        <p className="text-xs text-ink-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><TrustBadge score={u.trustScore} level={u.trustLevel} /></td>
                  <td className="px-5 py-3 text-ink-soft">{u.city}</td>
                  <td className="px-5 py-3 text-ink-soft">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3">
                    {u.isSuspended ? <Badge tone="rose">Suspended</Badge> : <Badge tone="mint">Active</Badge>}
                  </td>
                  <td className="px-5 py-3">
                    {u.role !== 'admin' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm" variant="ghost" icon={ShieldCheck}
                          onClick={() => verify.mutate({ id: u._id, value: !u.isVerified })}
                        >
                          {u.isVerified ? 'Unverify' : 'Verify'}
                        </Button>
                        <Button
                          size="sm" variant={u.isSuspended ? 'outline' : 'danger'} icon={Ban}
                          onClick={() => suspend.mutate({ id: u._id, value: !u.isSuspended })}
                        >
                          {u.isSuspended ? 'Reinstate' : 'Suspend'}
                        </Button>
                      </div>
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
    </PageTransition>
  );
}
