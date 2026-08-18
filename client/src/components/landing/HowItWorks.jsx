import { motion } from 'framer-motion';
import { Search, Send, HandHelping, Undo2, Star } from 'lucide-react';

const steps = [
  { icon: Search, title: 'Discover', text: 'Find items near you with search, filters and the nearby map.' },
  { icon: Send, title: 'Request', text: 'Pick your dates, see the full cost upfront and send a request.' },
  { icon: HandHelping, title: 'Borrow', text: 'Meet the owner, record the condition together and enjoy.' },
  { icon: Undo2, title: 'Return', text: 'Return on time. Your deposit comes back, your trust goes up.' },
  { icon: Star, title: 'Review', text: 'Rate each other and grow the community’s trust network.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="container-app py-20">
      <div className="text-center">
        <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500">How it works</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Borrowing, made beautifully simple</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">Five steps between you and the thing you need - no buying, no clutter.</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="card relative p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="absolute right-4 top-3 font-display text-3xl font-extrabold text-ink/[0.06]">{i + 1}</span>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-glow">
              <Icon size={21} />
            </div>
            <h3 className="mt-4 font-display text-base font-bold">{title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
