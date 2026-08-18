const tones = {
  brand: 'bg-brand-100 text-brand-700',
  lime: 'bg-lime-300/60 text-ink',
  mint: 'bg-mint-100 text-mint-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  sky: 'bg-sky-100 text-sky-700',
  gray: 'bg-ink/[0.06] text-ink-soft',
  ink: 'bg-ink text-white',
};

export default function Badge({ children, tone = 'gray', icon: Icon, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${tones[tone]} ${className}`}
    >
      {Icon && <Icon size={11} strokeWidth={2.5} />}
      {children}
    </span>
  );
}
