import { CheckCircle2, Package, Clock3, Star } from 'lucide-react';

/** Trust-emphasising stats row on profiles. */
export default function ProfileStats({ stats, itemCount }) {
  const cells = [
    { icon: CheckCircle2, label: 'Successful borrows', value: stats?.successfulBorrows || 0, cls: 'text-mint-700 bg-mint-100' },
    { icon: Package, label: 'Items listed', value: itemCount ?? 0, cls: 'text-brand-600 bg-brand-100' },
    { icon: Clock3, label: 'On-time returns', value: stats?.onTimeReturns || 0, cls: 'text-sky-700 bg-sky-100' },
    { icon: Star, label: 'Reviews received', value: stats?.reviewCount || 0, cls: 'text-amber-700 bg-amber-100' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cells.map(({ icon: Icon, label, value, cls }) => (
        <div key={label} className="card flex items-center gap-3 p-4">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cls}`}>
            <Icon size={16} />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold leading-none">{value}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-ink-muted">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
