import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

export default function FinalCTA() {
  return (
    <section className="container-app py-20 pb-0">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-6 py-16 text-center text-white sm:px-16"
      >
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-lime-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <h2 className="relative font-display text-3xl font-extrabold sm:text-4xl">
          Your next experience is 2 km away.
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/75">
          Join thousands of neighbours lending and borrowing everything from cameras to camping gear.
          It takes a minute to start.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/register">
            <Button size="lg" variant="secondary" icon={ArrowRight}>Get started free</Button>
          </Link>
          <Link to="/explore">
            <Button size="lg" className="!bg-white/10 !text-white ring-1 ring-white/30 hover:!bg-white/20">
              Browse items first
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
