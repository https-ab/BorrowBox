import { Star } from 'lucide-react';

/** Read-only star display, e.g. ★ 4.9 (12) */
export default function StarRating({ rating = 0, count, size = 13, showValue = true, className = '' }) {
  if (!rating) {
    return <span className={`text-xs text-ink-muted ${className}`}>No ratings yet</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold text-ink ${className}`}>
      <Star size={size} className="fill-amber-400 text-amber-400" />
      {showValue && <span>{Number(rating).toFixed(1)}</span>}
      {count != null && <span className="font-normal text-ink-muted">({count})</span>}
    </span>
  );
}
