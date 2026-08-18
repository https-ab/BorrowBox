import { motion } from 'framer-motion';

/** Dashboard stat tile. */
export default function StatCard({ icon: Icon, label, value, tone = 'brand', delay = 0 }) {
  const tones = {
    brand: 'bg-brand-100 text-brand-600',
    lime: 'bg-lime-300/60 text-ink',
    mint: 'bg-mint-100 text-mint-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="card flex items-center gap-4 p-5"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-2xl font-extrabold leading-none">{value}</p>
        <p className="mt-1 truncate text-xs font-semibold text-ink-muted">{label}</p>
      </div>
    </motion.div>
  );
}
