import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarDays } from 'lucide-react';
import AvailabilityCalendar from '../calendar/AvailabilityCalendar';
import CostBreakdown from './CostBreakdown';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { requestService } from '../../services/borrowService';
import { useAuth } from '../../store/AuthContext';
import { daysInclusive, formatDate } from '../../utils/format';

/** Right-hand booking panel on the item details page. */
export default function BorrowRequestPanel({ item, bookedRanges }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [range, setRange] = useState({ start: null, end: null });
  const [message, setMessage] = useState('');

  const isOwner = user && String(user._id) === String(item.owner?._id);
  const days = range.start && range.end ? daysInclusive(range.start, range.end) : 0;

  const mutation = useMutation({
    mutationFn: requestService.create,
    onSuccess: () => {
      toast.success('Borrow request sent! The owner will respond soon.');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      navigate('/requests?tab=outgoing');
    },
    onError: (err) => toast.error(err.message),
  });

  const submit = () => {
    if (!isAuthenticated) return navigate('/login');
    if (!range.start || !range.end) return toast.error('Pick your start and end dates first.');
    mutation.mutate({
      item: item._id,
      startDate: range.start.toISOString(),
      endDate: range.end.toISOString(),
      message,
    });
  };

  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-2 font-display text-base font-bold">
        <CalendarDays size={17} className="text-brand-500" />
        Choose your dates
      </h3>
      <p className="mb-4 mt-1 text-xs text-ink-muted">
        Min {item.minDays} day{item.minDays > 1 ? 's' : ''} · Max {item.maxDays} days
      </p>

      <AvailabilityCalendar bookedRanges={bookedRanges} value={range} onChange={setRange} selectable={!isOwner} />

      {range.start && range.end && (
        <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
          {formatDate(range.start)} → {formatDate(range.end)} · {days} day{days > 1 ? 's' : ''}
        </p>
      )}

      <div className="mt-4">
        <CostBreakdown pricePerDay={item.pricePerDay} days={days} deposit={item.deposit} />
      </div>

      {!isOwner && (
        <>
          <Textarea
            className="mt-4"
            label="Message to owner (optional)"
            placeholder='e.g. "I need this camera for a college photography event."'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <Button className="mt-4 w-full" size="lg" onClick={submit} loading={mutation.isPending}>
            {isAuthenticated ? 'Request to borrow' : 'Log in to borrow'}
          </Button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-muted">
            You won't be charged yet. The owner approves your request first, and the deposit is fully refundable.
          </p>
        </>
      )}
      {isOwner && (
        <p className="mt-4 rounded-xl bg-ink/[0.04] px-3 py-2.5 text-center text-xs font-semibold text-ink-soft">
          This is your listing — you cannot borrow your own item.
        </p>
      )}
    </div>
  );
}
