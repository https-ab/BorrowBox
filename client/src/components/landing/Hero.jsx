import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, MapPin, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { CATEGORIES } from '../../utils/constants';

/** Small floating item preview card used inside the hero. */
function FloatingCard({ className, delay, title, price, rating, distance, available }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className={`absolute hidden rounded-2xl border border-ink/5 bg-white/95 p-3.5 shadow-lift backdrop-blur lg:block ${className}`}
    >
      <div className="flex items-center justify-between gap-6">
        <p className="text-[13px] font-bold">{title}</p>
        {available && <span className="h-2 w-2 rounded-full bg-mint-500 ring-4 ring-mint-100" />}
      </div>
      <div className="mt-1.5 flex items-center gap-3 text-[11px] font-semibold text-ink-muted">
        <span className="flex items-center gap-0.5"><Star size={10} className="fill-amber-400 text-amber-400" /> {rating}</span>
        <span className="flex items-center gap-0.5"><MapPin size={10} /> {distance}</span>
      </div>
      <p className="mt-1.5 text-sm font-extrabold text-brand-600">{price}<span className="text-[10px] font-semibold text-ink-muted">/day</span></p>
    </motion.div>
  );
}

export default function Hero() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    navigate(`/explore${query ? `?search=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* soft background blobs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-40 h-72 w-72 rounded-full bg-lime-300/40 blur-3xl" />

      <div className="container-app relative pb-24 pt-16 text-center sm:pt-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-bold text-brand-700 shadow-soft">
            <Sparkles size={13} className="text-lime-600" />
            Community-powered borrowing in 5 Indian cities
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            Own less.{' '}
            <span className="relative inline-block text-brand-500">
              Experience more.
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 9" fill="none" preserveAspectRatio="none">
                <path d="M2 7c50-5 146-5 196 0" stroke="#C2EE4A" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Borrow the things you need from people around you like cameras, tools, books, gaming gear, camping equipment and more.
          </p>
        </motion.div>

        {/* Search */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-ink/5 bg-white p-2 shadow-lift"
        >
          <Search size={18} className="ml-3 shrink-0 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to borrow?"
            className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-ink-muted"
          />
          <Button type="submit" className="shrink-0 !rounded-xl">Search</Button>
        </motion.form>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/explore">
            <Button size="lg" icon={ArrowRight}>Explore items</Button>
          </Link>
          <Link to="/list">
            <Button size="lg" variant="outline">List something</Button>
          </Link>
        </motion.div>

        {/* Popular categories strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">Popular:</span>
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              to={`/explore?category=${name}`}
              className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition-all hover:border-brand-400 hover:text-brand-600 hover:shadow-soft"
            >
              <Icon size={13} /> {name}
            </Link>
          ))}
        </motion.div>

        {/* Floating cards */}
        <div className="animate-float"><FloatingCard className="left-4 top-24 xl:left-16" delay={0.5} title="Sony A6400" price="₹300" rating="4.9" distance="2.1 km" available /></div>
        <div className="animate-float-slow"><FloatingCard className="right-4 top-20 xl:right-16" delay={0.65} title="PS5 + 2 Controllers" price="₹400" rating="5.0" distance="3.4 km" available /></div>
        <div className="animate-float-slow"><FloatingCard className="left-10 bottom-16 xl:left-32" delay={0.8} title="Quechua 4P Tent" price="₹250" rating="4.8" distance="1.2 km" available /></div>
        <div className="animate-float"><FloatingCard className="right-10 bottom-20 xl:right-36" delay={0.95} title="Bosch Drill Kit" price="₹120" rating="5.0" distance="0.8 km" available /></div>

        {/* trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex items-center justify-center gap-2 text-xs font-semibold text-ink-muted"
        >
          <ShieldCheck size={14} className="text-mint-500" />
          Every borrow is backed by trust scores, condition tracking and refundable deposits.
        </motion.div>
      </div>
    </section>
  );
}
