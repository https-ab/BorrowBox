import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { format, parse } from 'date-fns';

/** 6-month borrowing vs lending activity area chart. */
export default function ActivityChart({ data = [] }) {
  const chartData = data.map((d) => ({
    month: format(parse(d._id, 'yyyy-MM', new Date()), 'MMM'),
    Borrowed: d.borrowed,
    Lent: d.lent,
  }));

  if (!chartData.length) {
    return <p className="py-10 text-center text-sm text-ink-muted">Your activity chart appears after your first transaction.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="gBorrow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6D5EF3" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6D5EF3" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gLend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A8D62E" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#A8D62E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,20,31,0.06)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8B8697' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#8B8697' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid rgba(23,20,31,0.08)', fontSize: 12, boxShadow: '0 8px 24px -8px rgba(23,20,31,.15)' }}
        />
        <Area type="monotone" dataKey="Borrowed" stroke="#6D5EF3" strokeWidth={2.5} fill="url(#gBorrow)" />
        <Area type="monotone" dataKey="Lent" stroke="#A8D62E" strokeWidth={2.5} fill="url(#gLend)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
