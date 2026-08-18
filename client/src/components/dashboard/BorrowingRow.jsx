import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import ItemImage from '../items/ItemImage';
import Avatar from '../ui/Avatar';
import { formatDateShort } from '../../utils/format';
import { differenceInCalendarDays } from 'date-fns';

/** Compact row for "currently borrowing" / "upcoming returns" lists. */
export default function BorrowingRow({ transaction }) {
  const daysLeft = differenceInCalendarDays(new Date(transaction.endDate), new Date());
  const urgent = daysLeft <= 1;

  return (
    <Link
      to={`/transactions/${transaction._id}`}
      className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-brand-50/60"
    >
      <ItemImage src={transaction.item?.images?.[0]} alt={transaction.item?.name} className="h-14 w-16 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{transaction.item?.name}</p>
        <p className="flex items-center gap-1 text-xs text-ink-muted">
          {transaction.owner && (
            <>
              <Avatar src={transaction.owner.avatar} name={transaction.owner.name} size="xs" />
              {transaction.owner.name} ·
            </>
          )}
          due {formatDateShort(transaction.endDate)}
        </p>
      </div>
      <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${urgent ? 'bg-rose-100 text-rose-700' : 'bg-lime-300/60 text-ink'}`}>
        <CalendarClock size={11} />
        {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
      </span>
    </Link>
  );
}
