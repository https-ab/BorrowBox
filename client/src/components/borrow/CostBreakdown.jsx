import { formatINR } from '../../utils/format';

/** Transparent price breakdown: rent x days + deposit = total. */
export default function CostBreakdown({ pricePerDay, days, deposit }) {
  if (!days) return null;
  const rent = pricePerDay * days;
  return (
    <div className="space-y-2 rounded-2xl bg-ink/[0.03] p-4 text-sm">
      <div className="flex justify-between text-ink-soft">
        <span>{formatINR(pricePerDay)} × {days} day{days > 1 ? 's' : ''}</span>
        <span className="font-semibold text-ink">{formatINR(rent)}</span>
      </div>
      <div className="flex justify-between text-ink-soft">
        <span>Security deposit <span className="text-[11px] text-ink-muted">(refundable)</span></span>
        <span className="font-semibold text-ink">{formatINR(deposit)}</span>
      </div>
      <div className="flex justify-between border-t border-ink/10 pt-2 font-bold">
        <span>Total</span>
        <span className="text-brand-600">{formatINR(rent + deposit)}</span>
      </div>
    </div>
  );
}
