import { motion } from 'framer-motion';
import { ShieldCheck, ClipboardCheck, Landmark, Gavel } from 'lucide-react';
import TrustScoreRing from '../trust/TrustScoreRing';
import TrustBreakdown from '../trust/TrustBreakdown';

const pillars = [
  { icon: ShieldCheck, title: 'Trust Score', text: 'Every member earns a 0–100 score from real behaviour: completed borrows, on-time returns, reviews and verification (not just star ratings).' },
  { icon: ClipboardCheck, title: 'Condition tracking', text: 'Condition, photos and notes are recorded at handover and again at return, so “it was already broken” never becomes a debate.' },
  { icon: Landmark, title: 'Security deposits', text: 'A refundable deposit protects lenders. Return the item in shape and it comes straight back to you.' },
  { icon: Gavel, title: 'Fair disputes', text: 'If something goes wrong, both sides submit evidence and a neutral moderator resolves the case.' },
];

const demoBreakdown = {
  base: 10, successfulTransactions: 30, onTimeReturns: 25,
  positiveReviews: 20, verifiedIdentity: 10, accountAge: 9, penalties: 0,
};

export default function TrustSection() {
  return (
    <section id="trust" className="container-app py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Trust system</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Built on trust, backed by design</h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft">
            Lending your camera to a stranger is scary. That is why BorrowBox makes trust visible,
            earned and impossible to fake.
          </p>
          <div className="mt-8 space-y-5">
            {pillars.map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="card mx-auto w-full max-w-md p-8"
        >
          <div className="flex items-center gap-5">
            <TrustScoreRing score={94} size={104} />
            <div>
              <p className="font-display text-xl font-extrabold">94 / 100</p>
              <p className="text-sm font-bold text-mint-700">Highly Trusted</p>
              <p className="mt-1 text-xs text-ink-muted">Rahul S. · Pune</p>
            </div>
          </div>
          <div className="mt-6 border-t border-ink/5 pt-5">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-widest text-ink-muted">How this score is earned</p>
            <TrustBreakdown breakdown={demoBreakdown} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
