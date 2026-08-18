/** Aggregate review dimensions as horizontal bars. */
export default function RatingBars({ aggregate }) {
  if (!aggregate) return null;
  const rows = [
    { label: 'Communication', value: aggregate.communication },
    { label: 'Reliability', value: aggregate.reliability },
    { label: 'Item condition', value: aggregate.condition },
    { label: 'On-time return', value: aggregate.onTime },
  ];
  return (
    <div className="space-y-2.5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-xs font-semibold text-ink-soft">{row.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
              style={{ width: `${((row.value || 0) / 5) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right text-sm font-bold">{(row.value || 0).toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}
