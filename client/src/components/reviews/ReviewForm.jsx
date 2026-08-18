import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import StarPicker from '../ui/StarPicker';
import { reviewService } from '../../services/borrowService';

const DIMENSIONS = [
  { key: 'communication', label: 'Communication' },
  { key: 'reliability', label: 'Reliability' },
  { key: 'condition', label: 'Item condition' },
  { key: 'onTime', label: 'On-time' },
];

/** Post-transaction review modal with 4 rating dimensions + comment. */
export default function ReviewForm({ open, onClose, transactionId, revieweeName }) {
  const queryClient = useQueryClient();
  const [ratings, setRatings] = useState({ communication: 5, reliability: 5, condition: 5, onTime: 5 });
  const [comment, setComment] = useState('');

  const mutation = useMutation({
    mutationFn: () => reviewService.create({ transaction: transactionId, ratings, comment }),
    onSuccess: () => {
      toast.success('Review submitted. Thanks for keeping the community trustworthy!');
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal open={open} onClose={onClose} title={`Review ${revieweeName || 'your experience'}`}>
      <div className="space-y-4">
        {DIMENSIONS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-soft">{label}</span>
            <StarPicker value={ratings[key]} onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))} />
          </div>
        ))}
        <Textarea
          label="Written feedback (optional)"
          placeholder="How was the experience? Anything future borrowers or lenders should know?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Later</Button>
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Submit review</Button>
        </div>
      </div>
    </Modal>
  );
}
