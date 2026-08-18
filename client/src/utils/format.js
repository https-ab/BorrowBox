import { format, formatDistanceToNow, differenceInCalendarDays } from 'date-fns';

export const formatINR = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export const formatDate = (date) => (date ? format(new Date(date), 'd MMM yyyy') : '');

export const formatDateShort = (date) => (date ? format(new Date(date), 'd MMM') : '');

export const timeAgo = (date) =>
  date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : '';

export const daysInclusive = (start, end) =>
  differenceInCalendarDays(new Date(end), new Date(start)) + 1;

export const memberSince = (date) => (date ? format(new Date(date), 'MMM yyyy') : '');

/** Greeting for the dashboard header. */
export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
