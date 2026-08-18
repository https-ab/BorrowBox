import { ShieldCheck } from 'lucide-react';

const levelStyles = {
  'Highly Trusted': 'bg-mint-100 text-mint-700',
  'Trusted': 'bg-brand-100 text-brand-700',
  'Reliable': 'bg-sky-100 text-sky-700',
  'New Member': 'bg-ink/[0.06] text-ink-soft',
};

/** Compact trust pill shown next to owners: shield + score. */
export default function TrustBadge({ score, level, className = '' }) {
  if (score == null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${levelStyles[level] || levelStyles['New Member']} ${className}`}
      title={`Trust score ${score}/100 · ${level}`}
    >
      <ShieldCheck size={11} strokeWidth={2.5} />
      {score}
    </span>
  );
}
