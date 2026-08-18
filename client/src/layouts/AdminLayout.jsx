import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ArrowLeftRight, Gavel, ArrowLeft } from 'lucide-react';
import Logo from '../components/layout/Logo';

const links = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/listings', label: 'Listings', icon: Package },
  { to: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/admin/disputes', label: 'Disputes', icon: Gavel },
];

/** Operational admin shell: dark sidebar + content area. */
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-ink p-5 text-white lg:flex">
        <Logo className="[&_span]:text-white" />
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Admin console</p>

        <nav className="mt-8 flex-1 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-brand-500 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/" className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white">
          <ArrowLeft size={16} /> Back to BorrowBox
        </NavLink>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile nav */}
        <div className="sticky top-0 z-30 flex gap-1 overflow-x-auto border-b border-ink/5 bg-white px-4 py-2 lg:hidden">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${isActive ? 'bg-brand-500 text-white' : 'text-ink-soft'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
