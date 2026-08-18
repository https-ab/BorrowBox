import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth,
  isBefore, isAfter, isSameDay, format, startOfDay,
} from 'date-fns';

/** True if `day` falls inside any booked range. */
function isBooked(day, ranges) {
  return ranges.some(
    (r) => !isBefore(day, startOfDay(new Date(r.startDate))) && !isAfter(day, startOfDay(new Date(r.endDate)))
  );
}

/** True if any booked day exists between start and end (inclusive). */
function rangeHitsBooking(start, end, ranges) {
  let cursor = start;
  while (!isAfter(cursor, end)) {
    if (isBooked(cursor, ranges)) return true;
    cursor = addDays(cursor, 1);
  }
  return false;
}

/**
 * Interactive availability calendar with range selection.
 * Booked/past dates are disabled; selecting across a booking is blocked.
 */
export default function AvailabilityCalendar({ bookedRanges = [], value = {}, onChange, selectable = true }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const today = startOfDay(new Date());
  const { start, end } = value;

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const clickDay = (day) => {
    if (!selectable || !onChange) return;
    if (isBefore(day, today) || isBooked(day, bookedRanges)) return;

    if (!start || (start && end)) {
      onChange({ start: day, end: null });
    } else if (isBefore(day, start)) {
      onChange({ start: day, end: null });
    } else if (rangeHitsBooking(start, day, bookedRanges)) {
      onChange({ start: day, end: null }); // selection crosses a booking - restart
    } else {
      onChange({ start, end: day });
    }
  };

  const inSelection = (day) =>
    start && end && !isBefore(day, start) && !isAfter(day, end);

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          disabled={isSameMonth(month, today)}
          className="rounded-lg p-1.5 text-ink-soft hover:bg-ink/5 disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold">{format(month, 'MMMM yyyy')}</span>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="rounded-lg p-1.5 text-ink-soft hover:bg-ink/5"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <span key={d} className="py-1 text-[10px] font-bold uppercase tracking-wide text-ink-muted">{d}</span>
        ))}
        {days.map((day) => {
          const outside = !isSameMonth(day, month);
          const past = isBefore(day, today);
          const booked = isBooked(day, bookedRanges);
          const selectedEdge = (start && isSameDay(day, start)) || (end && isSameDay(day, end));
          const selected = inSelection(day) || (start && !end && isSameDay(day, start));
          const disabled = past || booked;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => clickDay(day)}
              disabled={disabled || !selectable}
              title={booked ? 'Booked' : undefined}
              className={`relative aspect-square rounded-lg text-xs font-semibold transition-all
                ${outside ? 'opacity-30' : ''}
                ${past ? 'text-ink/25 cursor-not-allowed' : ''}
                ${booked ? 'bg-rose-50 text-rose-300 line-through cursor-not-allowed' : ''}
                ${!disabled && !selected ? 'hover:bg-brand-100 text-ink-soft' : ''}
                ${selected && !selectedEdge ? 'bg-brand-100 text-brand-700' : ''}
                ${selectedEdge ? 'bg-brand-500 text-white shadow-glow' : ''}
                ${isSameDay(day, today) && !selected ? 'ring-1 ring-brand-300' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-brand-500" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-rose-100 ring-1 ring-rose-200" /> Booked</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-ink/10" /> Unavailable</span>
      </div>
    </div>
  );
}
