import { CheckCircle2, Clock, Star, BadgeCheck, CalendarDays, MinusCircle } from 'lucide-react';

const rows = [
  { key: 'successfulTransactions', label: 'Successful transactions', icon: CheckCircle2, max: 30 },
  { key: 'onTimeReturns', label: 'On-time returns', icon: Clock, max: 25 },
  { key: 'positiveReviews', label: 'Positive reviews', icon: Star, max: 20 },
  { key: 'verifiedIdentity', label: 'Verified identity', icon: BadgeCheck, max: 10 },
  { key: 'accountAge', label: 'Account age', icon: CalendarDays, max: 9 },
];

/** Explains exactly how a trust score was calculated. */
export default function TrustBreakdown({ breakdown }) {
  if (!breakdown) return null;
  return (
    <div className="space-y-3">
      {rows.map(({ key, label, icon: Icon, max }) => {
        const value = breakdown[key] || 0;
        return (
          <div key={key} className="flex items-center gap-3">
            <Icon size={16} className="shrink-0 text-brand-500" />
            <span className="flex-1 text-sm text-ink-soft">{label}</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink/[0.07]">
              <div className="h-full rounded-full bg-brand-500 transition-all duration-700" style={{ width: `${(value / max) * 100}%` }} />
            </div>
            <span className="w-9 text-right text-sm font-bold">+{value}</span>
          </div>
        );
      })}
      {breakdown.penalties < 0 && (
        <div className="flex items-center gap-3">
          <MinusCircle size={16} className="shrink-0 text-rose-500" />
          <span className="flex-1 text-sm text-ink-soft">Penalties (cancellations / disputes)</span>
          <span className="text-sm font-bold text-rose-600">{breakdown.penalties}</span>
        </div>
      )}
    </div>
  );
}
