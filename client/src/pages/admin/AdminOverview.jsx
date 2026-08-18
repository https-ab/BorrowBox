import { useQuery } from '@tanstack/react-query';
import {
  Users, Package, ArrowLeftRight, CheckCircle2, Gavel, Inbox, Star, IndianRupee,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import PageTransition from '../../components/ui/PageTransition';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import { adminService } from '../../services/borrowService';
import { formatINR } from '../../utils/format';
import { format, parse } from 'date-fns';

const PIE_COLORS = ['#6D5EF3', '#A8D62E', '#F59E0B', '#0EA5E9', '#EC4899', '#22C55E', '#8B5CF6', '#F97316'];

function KpiCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="font-display text-2xl font-extrabold leading-none">{value}</p>
        <p className="mt-1 text-xs font-semibold text-ink-muted">{label}</p>
      </div>
    </div>
  );
}

const toMonthly = (series) =>
  (series || []).map((d) => ({ month: format(parse(d._id, 'yyyy-MM', new Date()), 'MMM'), count: d.count }));

export default function AdminOverview() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.stats,
  });

  if (isLoading) return <Spinner label="Loading platform stats..." />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const { totals, charts } = data;

  // Merge user/listing/transaction series into one chart dataset
  const months = [...new Set([...charts.usersSeries, ...charts.itemsSeries, ...charts.txnSeries].map((d) => d._id))].sort();
  const growth = months.map((m) => ({
    month: format(parse(m, 'yyyy-MM', new Date()), 'MMM'),
    Users: charts.usersSeries.find((d) => d._id === m)?.count || 0,
    Listings: charts.itemsSeries.find((d) => d._id === m)?.count || 0,
    Transactions: charts.txnSeries.find((d) => d._id === m)?.count || 0,
  }));

  const categoryData = charts.categorySplit.map((c) => ({ name: c._id, value: c.count }));

  return (
    <PageTransition>
      <h1 className="font-display text-2xl font-extrabold">Platform overview</h1>
      <p className="mt-1 text-sm text-ink-muted">Live operational metrics for BorrowBox.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard icon={Users} label="Total users" value={totals.totalUsers} tone="bg-brand-100 text-brand-600" />
        <KpiCard icon={Package} label="Active listings" value={totals.activeListings} tone="bg-lime-300/60 text-ink" />
        <KpiCard icon={ArrowLeftRight} label="Active transactions" value={totals.activeTransactions} tone="bg-sky-100 text-sky-700" />
        <KpiCard icon={CheckCircle2} label="Completed transactions" value={totals.completedTransactions} tone="bg-mint-100 text-mint-700" />
        <KpiCard icon={Gavel} label="Open disputes" value={totals.openDisputes} tone="bg-rose-100 text-rose-600" />
        <KpiCard icon={Inbox} label="Pending requests" value={totals.pendingRequests} tone="bg-amber-100 text-amber-700" />
        <KpiCard icon={Star} label="Total reviews" value={totals.totalReviews} tone="bg-fuchsia-100 text-fuchsia-700" />
        <KpiCard icon={IndianRupee} label="Rental volume" value={formatINR(totals.gmv)} tone="bg-indigo-100 text-indigo-700" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-display text-base font-bold">Growth — last 6 months</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growth} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,20,31,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8B8697' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8B8697' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Users" stroke="#6D5EF3" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Listings" stroke="#A8D62E" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Transactions" stroke="#F59E0B" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-display text-base font-bold">Listings by category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {categoryData.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 xl:col-span-2">
          <h2 className="mb-4 font-display text-base font-bold">Disputes opened per month</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={toMonthly(charts.disputeSeries)} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,20,31,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8B8697' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8B8697' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" name="Disputes" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageTransition>
  );
}
