import { motion } from 'framer-motion';
import { Wallet, Leaf, Users, ShieldCheck } from 'lucide-react';

const reasons = [
  { icon: Wallet, title: 'Save serious money', text: 'Why spend ₹45,000 on a camera you need for one weekend? Borrow it for ₹300 a day.' },
  { icon: Leaf, title: 'Waste less', text: 'The average drill is used for 13 minutes in its lifetime. Shared items mean fewer idle things.' },
  { icon: Users, title: 'Meet your neighbours', text: 'Every borrow is a handshake. BorrowBox turns streets into communities.' },
  { icon: ShieldCheck, title: 'Borrow with confidence', text: 'Trust scores, condition tracking, deposits and dispute resolution protect both sides.' },
];

export default function WhyBorrowBox() {
  return (
    <section className="bg-ink py-20 text-white">
      <div className="container-app">
        <div className="max-w-xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-lime-400">Why BorrowBox</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
            The things you need already exist  <span className="text-lime-400">around the corner.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2.5xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:bg-white/10"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400 text-ink">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 font-display text-base font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
