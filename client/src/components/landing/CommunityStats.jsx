import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/** Counts up from 0 when scrolled into view. */
function Counter({ target, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return <span ref={ref}>{value.toLocaleString('en-IN')}{suffix}</span>;
}

const stats = [
  { value: 2400, suffix: '+', label: 'Community members' },
  { value: 5800, suffix: '+', label: 'Successful borrows' },
  { value: 38, suffix: ' L+', label: 'Saved by borrowers (₹)' },
  { value: 97, suffix: '%', label: 'On-time returns' },
];

export default function CommunityStats() {
  return (
    <section className="bg-brand-500 py-16 text-white">
      <div className="container-app grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
        {stats.map(({ value, suffix, label }) => (
          <div key={label}>
            <p className="font-display text-4xl font-extrabold tracking-tight">
              <Counter target={value} suffix={suffix} />
            </p>
            <p className="mt-1 text-sm font-semibold text-white/70">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
