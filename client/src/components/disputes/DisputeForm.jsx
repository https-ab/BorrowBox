import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { disputeService } from '../../services/borrowService';

/** Raise-a-dispute modal from a transaction. */
export default function DisputeForm({ open, onClose, transactionId }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: () => disputeService.create({ transaction: transactionId, reason, description }),
    onSuccess: () => {
      toast.success('Dispute opened. Our moderators will review both sides.');
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal open={open} onClose={onClose} title="Open a dispute">
      <p className="mb-4 text-xs leading-relaxed text-ink-muted">
        Use this only when you can't resolve the issue directly. Both parties can submit evidence,
        and a moderator makes the final call. Disputes affect trust scores.
      </p>
      <div className="space-y-4">
        <Input
          label="Reason"
          placeholder='e.g. "Item was returned damaged"'
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={200}
        />
        <Textarea
          label="What happened?"
          placeholder="Describe the issue in detail. Mention dates, condition, and anything the moderator should know."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={2000}
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={() => mutation.mutate()} loading={mutation.isPending}>
            Open dispute
          </Button>
        </div>
      </div>
    </Modal>
  );
}
