import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import Avatar from '../ui/Avatar';
import StarRating from '../ui/StarRating';

const testimonials = [
  {
    name: 'Ananya Iyer', city: 'Pune', rating: 5,
    text: 'I borrowed a guitar for two weeks to see if I would actually stick with learning. I did and I made a friend in the process. This is how buying decisions should work.',
  },
  {
    name: 'Rohan Nair', city: 'Mumbai', rating: 5,
    text: 'My projector used to gather dust between movie nights. It has now paid for itself twice over, and the condition tracking means I never worry about lending it out.',
  },
  {
    name: 'Sneha Kulkarni', city: 'Pune', rating: 5,
    text: 'Trekking gear is expensive and used maybe five times a year. Between my tent and backpack, my whole society treks with my gear and my trust score keeps climbing.',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-20">
      <div className="container-app">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Community voices</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold">People are talking</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card relative p-6"
            >
              <Quote size={28} className="absolute right-5 top-5 text-brand-100" />
              <StarRating rating={t.rating} showValue={false} />
              <blockquote className="mt-3 text-sm leading-relaxed text-ink-soft">“{t.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-ink/5 pt-4">
                <Avatar name={t.name} size="sm" src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(t.name)}&backgroundColor=ede9fe`} />
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-ink-muted">{t.city}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
