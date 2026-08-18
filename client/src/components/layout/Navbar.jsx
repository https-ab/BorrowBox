import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Plus, Menu, X, Compass, MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from './Logo';
import Button from '../ui/Button';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import { useAuth } from '../../store/AuthContext';

const navLinks = [
  { to: '/explore', label: 'Explore' },
  { to: '/nearby', label: 'Nearby' },
  { to: '/#how-it-works', label: 'How it works', anchor: true },
];

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/explore?search=${encodeURIComponent(query)}`);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-cream/80 backdrop-blur-lg">
      <div className="container-app flex h-16 items-center gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) =>
            link.anchor ? (
              <a key={link.to} href={link.to} className="rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink">
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
                  }`
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Desktop search */}
        <form onSubmit={submitSearch} className="relative ml-auto hidden w-full max-w-xs md:block">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cameras, tools, books..."
            className="input-base !rounded-full !py-2 pl-9 text-[13px]"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          {isAuthenticated ? (
            <>
              <Link to="/list" className="hidden sm:block">
                <Button size="sm" variant="secondary" icon={Plus} className="!rounded-full">
                  List an item
                </Button>
              </Link>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button size="sm" variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="!rounded-full">Get Started</Button>
              </Link>
            </>
          )}
          <button
            className="rounded-xl p-2 text-ink-soft hover:bg-ink/5 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-ink/5 bg-white lg:hidden"
          >
            <div className="container-app space-y-1 py-3">
              <form onSubmit={submitSearch} className="relative mb-2 md:hidden">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What do you want to borrow?"
                  className="input-base !rounded-full pl-9"
                />
              </form>
              <Link to="/explore" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-ink/5">
                <Compass size={17} /> Explore
              </Link>
              <Link to="/nearby" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-ink/5">
                <MapPin size={17} /> Nearby
              </Link>
              <a href="/#how-it-works" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-ink/5">
                How it works
              </a>
              {isAuthenticated ? (
                <Link to="/list" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 rounded-xl bg-lime-400/40 px-3 py-2.5 text-sm font-bold text-ink">
                  <Plus size={17} /> List an item
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-ink/5">
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
