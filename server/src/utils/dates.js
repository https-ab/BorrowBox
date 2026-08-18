/** Date helpers shared by availability + transaction logic. */

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysBetweenInclusive(start, end) {
  const ms = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.round(ms / 86400000) + 1;
}

/** True when [aStart, aEnd] overlaps [bStart, bEnd] (inclusive). */
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return startOfDay(aStart) <= startOfDay(bEnd) && startOfDay(bStart) <= startOfDay(aEnd);
}
