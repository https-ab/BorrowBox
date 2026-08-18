import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Gavel } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Avatar from '../../components/ui/Avatar';
import StatusBadge from '../../components/borrow/StatusBadge';
import ItemImage from '../../components/items/ItemImage';
import { adminService } from '../../services/borrowService';
import { timeAgo } from '../../utils/format';

/** Admin dispute resolution queue. */
export default function AdminDisputes() {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState(null); // dispute being resolved
  const [form, setForm] = useState({ status: 'resolved', resolution: '', ruledAgainst: '' });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => adminService.disputes({}),
  });

  const resolve = useMutation({
    mutationFn: () =>
      adminService.resolveDispute(target._id, {
        status: form.status,
        resolution: form.resolution,
        ruledAgainst: form.ruledAgainst || undefined,
      }),
    onSuccess: () => {
      toast.success('Dispute updated. Both parties have been notified.');
      setTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner label="Loading disputes..." />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const disputes = data?.disputes || [];

  return (
    <PageTransition>
      <h1 className="font-display text-2xl font-extrabold">Dispute resolution</h1>
      <p className="mt-1 text-sm text-ink-muted">Review evidence from both sides and make a fair call.</p>

      {disputes.length ? (
        <div className="mt-6 space-y-5">
          {disputes.map((dispute) => (
            <div key={dispute._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ItemImage src={dispute.item?.images?.[0]} alt="" className="h-14 w-18 w-[4.5rem] rounded-xl" />
                  <div>
                    <p className="font-display text-sm font-bold">{dispute.reason}</p>
                    <p className="text-xs text-ink-muted">{dispute.item?.name} · opened {timeAgo(dispute.createdAt)}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Avatar src={dispute.raisedBy?.avatar} name={dispute.raisedBy?.name} size="xs" />
                        <strong>{dispute.raisedBy?.name}</strong> (raised)
                      </span>
                      <span>vs</span>
                      <span className="flex items-center gap-1">
                        <Avatar src={dispute.against?.avatar} name={dispute.against?.name} size="xs" />
                        <strong>{dispute.against?.name}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={dispute.status} />
                  {['open', 'under_review'].includes(dispute.status) && (
                    <Button
                      size="sm" icon={Gavel}
                      onClick={() => { setTarget(dispute); setForm({ status: 'resolved', resolution: '', ruledAgainst: '' }); }}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>

              {/* Evidence preview */}
              <div className="mt-4 space-y-2 border-t border-ink/5 pt-4">
                {dispute.evidence.map((entry, i) => (
                  <div key={i} className="rounded-xl bg-cream px-4 py-2.5 text-xs">
                    <strong>{entry.by?.name}:</strong>{' '}
                    <span className="text-ink-soft">{entry.description}</span>
                  </div>
                ))}
              </div>

              {dispute.resolution && (
                <p className="mt-3 rounded-xl bg-mint-100 px-4 py-2.5 text-xs font-semibold text-mint-700">
                  Resolution: {dispute.resolution}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState icon={Gavel} title="No disputes" message="The community is getting along beautifully." />
        </div>
      )}

      {/* Resolve modal */}
      <Modal open={Boolean(target)} onClose={() => setTarget(null)} title="Resolve dispute">
        <div className="space-y-4">
          <Select label="Outcome" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="resolved">Resolved (uphold complaint)</option>
            <option value="rejected">Rejected (dismiss complaint)</option>
            <option value="under_review">Keep under review</option>
          </Select>
          {form.status !== 'under_review' && (
            <Select
              label="Rule against (applies trust penalty)"
              value={form.ruledAgainst}
              onChange={(e) => setForm((f) => ({ ...f, ruledAgainst: e.target.value }))}
            >
              <option value="">No penalty for anyone</option>
              <option value={target?.raisedBy?._id}>{target?.raisedBy?.name} (raised the dispute)</option>
              <option value={target?.against?._id}>{target?.against?.name}</option>
            </Select>
          )}
          <Textarea
            label="Resolution note (shared with both parties)"
            placeholder="Explain the decision clearly and neutrally..."
            value={form.resolution}
            onChange={(e) => setForm((f) => ({ ...f, resolution: e.target.value }))}
            maxLength={2000}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button>
            <Button onClick={() => resolve.mutate()} loading={resolve.isPending}>Submit decision</Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
