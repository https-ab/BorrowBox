import { useState } from 'react';
import { Star } from 'lucide-react';

/** Interactive 1-5 star picker used in review forms. */
export default function StarPicker({ value = 0, onChange, size = 22 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          aria-label={`${star} star`}
        >
          <Star
            size={size}
            className={
              star <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-ink/20'
            }
          />
        </button>
      ))}
    </div>
  );
}
