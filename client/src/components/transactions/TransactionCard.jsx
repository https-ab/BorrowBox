import { Link } from 'react-router-dom';
import ItemImage from '../items/ItemImage';
import StatusBadge from '../borrow/StatusBadge';
import Avatar from '../ui/Avatar';
import { formatINR, formatDateShort } from '../../utils/format';

/** Compact transaction row used in the Activity tab. */
export default function TransactionCard({ transaction, viewerId }) {
  const isBorrower = String(transaction.borrower?._id) === String(viewerId);
  const other = isBorrower ? transaction.owner : transaction.borrower;

  return (
    <Link to={`/transactions/${transaction._id}`} className="card flex items-center gap-4 p-4 transition-all hover:shadow-lift">
      <ItemImage src={transaction.item?.images?.[0]} alt={transaction.item?.name} className="h-16 w-20 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-display text-sm font-bold">{transaction.item?.name}</p>
          <StatusBadge status={transaction.status} />
        </div>
        <p className="mt-0.5 text-xs text-ink-muted">
          {formatDateShort(transaction.startDate)} – {formatDateShort(transaction.endDate)} · {isBorrower ? 'borrowing from' : 'lending to'}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <Avatar src={other?.avatar} name={other?.name} size="xs" />
          <span className="text-xs font-semibold text-ink-soft">{other?.name}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-extrabold text-brand-600">{formatINR(transaction.rentTotal)}</p>
        <p className="text-[10px] text-ink-muted">+{formatINR(transaction.deposit)} deposit</p>
      </div>
    </Link>
  );
}
