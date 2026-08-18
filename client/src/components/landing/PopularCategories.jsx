import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { itemService } from '../../services/itemService';
import { CATEGORIES } from '../../utils/constants';

export default function PopularCategories() {
  const { data } = useQuery({ queryKey: ['categories'], queryFn: itemService.categories });
  const counts = Object.fromEntries((data?.categories || []).map((c) => [c.name, c.count]));

  return (
    <section className="bg-white py-20">
      <div className="container-app">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Categories</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold">What do you need today?</h2>
          </div>
          <Link to="/explore" className="text-sm font-bold text-brand-600 hover:text-brand-700">Browse everything →</Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map(({ name, icon: Icon, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/explore?category=${name}`}
                className="group flex items-center gap-4 rounded-2.5xl border border-ink/5 bg-cream p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${color}`}>
                  <Icon size={22} />
                </span>
                <span>
                  <span className="block font-display text-sm font-bold group-hover:text-brand-600">{name}</span>
                  <span className="text-xs text-ink-muted">{counts[name] ?? '–'} items</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
