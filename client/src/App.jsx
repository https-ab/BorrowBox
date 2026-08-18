import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Spinner from './components/ui/Spinner';
import { ProtectedRoute, AdminRoute } from './routes/guards';
import useSocket from './hooks/useSocket';

// Eager: the pages a visitor hits first
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy: everything behind interaction (code splitting)
const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const ListItem = lazy(() => import('./pages/ListItem'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyItems = lazy(() => import('./pages/MyItems'));
const Requests = lazy(() => import('./pages/Requests'));
const TransactionDetails = lazy(() => import('./pages/TransactionDetails'));
const Nearby = lazy(() => import('./pages/Nearby'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const Disputes = lazy(() => import('./pages/Disputes'));
const DisputeDetails = lazy(() => import('./pages/DisputeDetails'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminListings = lazy(() => import('./pages/admin/AdminListings'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const AdminDisputes = lazy(() => import('./pages/admin/AdminDisputes'));

export default function App() {
  useSocket(); // real-time notifications while logged in

  return (
    <Suspense fallback={<Spinner label="Loading..." />}>
      <Routes>
          <Route element={<MainLayout />}>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/nearby" element={<Nearby />} />
            <Route path="/users/:id" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/list" element={<ListItem />} />
              <Route path="/items/:id/edit" element={<ListItem />} />
              <Route path="/my-items" element={<MyItems />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/transactions/:id" element={<TransactionDetails />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/disputes" element={<Disputes />} />
              <Route path="/disputes/:id" element={<DisputeDetails />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin console (own layout) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="listings" element={<AdminListings />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="disputes" element={<AdminDisputes />} />
            </Route>
          </Route>
      </Routes>
    </Suspense>
  );
}
