import Avatar from '../ui/Avatar';
import StarRating from '../ui/StarRating';
import { timeAgo } from '../../utils/format';

/** One review with reviewer, stars and comment. */
export default function ReviewCard({ review }) {
  return (
    <div className="flex gap-3 border-b border-ink/5 py-4 last:border-0">
      <Avatar src={review.reviewer?.avatar} name={review.reviewer?.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <div>
            <p className="text-sm font-bold">{review.reviewer?.name}</p>
            <p className="text-[11px] text-ink-muted">
              {review.reviewer?.city ? `${review.reviewer.city} · ` : ''}{timeAgo(review.createdAt)}
              {review.item?.name ? ` · ${review.item.name}` : ''}
            </p>
          </div>
          <StarRating rating={review.overall} size={13} />
        </div>
        {review.comment && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{review.comment}</p>}
      </div>
    </div>
  );
}
