import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BottomNav from '../components/layout/BottomNav';

/** Default layout: navbar + routed page + footer + mobile bottom nav. */
export default function MainLayout() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      {isLanding && <Footer />}
      <BottomNav />
    </div>
  );
}
