import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ArrowLeftRight, User, LogOut, ShieldAlert, Gavel, ChevronDown,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import TrustBadge from '../trust/TrustBadge';
import { useAuth } from '../../store/AuthContext';

/** Avatar dropdown menu for authenticated users. */
export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/my-items', label: 'My Items', icon: Package },
    { to: '/requests', label: 'Requests & Borrowings', icon: ArrowLeftRight },
    { to: '/disputes', label: 'Disputes', icon: Gavel },
    { to: '/profile', label: 'Profile', icon: User },
  ];
  if (user?.role === 'admin') items.push({ to: '/admin', label: 'Admin Panel', icon: ShieldAlert });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-ink/5"
      >
        <Avatar src={user?.avatar} name={user?.name} size="sm" />
        <ChevronDown size={14} className={`text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-lift"
          >
            <div className="border-b border-ink/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar src={user?.avatar} name={user?.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{user?.name}</p>
                  <div className="flex items-center gap-1.5">
                    <TrustBadge score={user?.trustScore} level={user?.trustLevel} />
                    <span className="text-[11px] text-ink-muted">{user?.trustLevel}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-1.5">
              {items.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  <Icon size={16} /> {label}
                </Link>
              ))}
              <button
                onClick={() => { logout(); setOpen(false); navigate('/'); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
