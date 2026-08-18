import { NavLink } from 'react-router-dom';
import { Compass, MapPin, Plus, ArrowLeftRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

const tabs = [
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/nearby', label: 'Nearby', icon: MapPin },
  { to: '/list', label: 'List', icon: Plus, primary: true },
  { to: '/requests', label: 'Activity', icon: ArrowLeftRight },
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
];

/** Mobile-only bottom navigation for authenticated users. */
export default function BottomNav() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {tabs.map(({ to, label, icon: Icon, primary }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-brand-600' : 'text-ink-muted'
              }`
            }
          >
            {primary ? (
              <span className="flex h-9 w-9 -mt-3 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lift">
                <Icon size={18} />
              </span>
            ) : (
              <Icon size={19} />
            )}
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
