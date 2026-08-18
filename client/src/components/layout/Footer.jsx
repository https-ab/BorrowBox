import { Link } from 'react-router-dom';
import Logo from './Logo';
import { CATEGORIES } from '../../utils/constants';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/5 bg-white">
      <div className="container-app grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
            Own less. Experience more. Borrow the things you need from trusted people around you.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-ink-muted">Categories</h4>
          <ul className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <li key={c.name}>
                <Link to={`/explore?category=${c.name}`} className="text-sm text-ink-soft transition-colors hover:text-brand-600">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-ink-muted">Platform</h4>
          <ul className="space-y-2">
            <li><Link to="/explore" className="text-sm text-ink-soft hover:text-brand-600">Explore items</Link></li>
            <li><Link to="/nearby" className="text-sm text-ink-soft hover:text-brand-600">Nearby discovery</Link></li>
            <li><Link to="/list" className="text-sm text-ink-soft hover:text-brand-600">List an item</Link></li>
            <li><a href="/#how-it-works" className="text-sm text-ink-soft hover:text-brand-600">How it works</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-ink-muted">Trust & Safety</h4>
          <ul className="space-y-2">
            <li><a href="/#trust" className="text-sm text-ink-soft hover:text-brand-600">Trust scores</a></li>
            <li><span className="text-sm text-ink-soft">Condition tracking</span></li>
            <li><span className="text-sm text-ink-soft">Security deposits</span></li>
            <li><span className="text-sm text-ink-soft">Dispute resolution</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/5 py-5">
        <p className="container-app text-xs text-ink-muted">
          © {new Date().getFullYear()} BorrowBox · A community lending platform · Made with 💜 in India
        </p>
      </div>
    </footer>
  );
}
