import { Check, Clock } from 'lucide-react';
import { formatDate } from '../../utils/format';

const FULL_FLOW = [
  { key: 'requested', label: 'Request submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'handover', label: 'Pickup / Handover' },
  { key: 'returned', label: 'Return' },
  { key: 'confirmed', label: 'Condition confirmed' },
  { key: 'completed', label: 'Completed' },
];

/** Vertical timeline showing where a transaction currently stands. */
export default function TransactionTimeline({ timeline = [], status }) {
  const eventMap = {};
  timeline.forEach((e) => { eventMap[e.key] = e; });
  const disputed = status === 'disputed' || eventMap.disputed;

  const steps = disputed
    ? [...FULL_FLOW.slice(0, 4), { key: 'disputed', label: 'Disputed' }]
    : FULL_FLOW;

  return (
    <ol className="relative space-y-0">
      {steps.map((step, i) => {
        const event = eventMap[step.key];
        const done = Boolean(event);
        const isLast = i === steps.length - 1;
        const isDisputeStep = step.key === 'disputed';

        return (
          <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span className={`absolute left-[13px] top-7 h-[calc(100%-20px)] w-0.5 rounded ${done ? 'bg-brand-400' : 'bg-ink/10'}`} />
            )}
            <span
              className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition-colors
                ${done ? (isDisputeStep ? 'bg-rose-500' : 'bg-brand-500') : 'bg-ink/10 text-ink-muted'}`}
            >
              {done ? <Check size={14} strokeWidth={3} /> : <Clock size={13} />}
            </span>
            <div className="pt-0.5">
              <p className={`text-sm font-semibold ${done ? 'text-ink' : 'text-ink-muted'}`}>{step.label}</p>
              {event && <p className="text-[11px] text-ink-muted">{formatDate(event.at)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
