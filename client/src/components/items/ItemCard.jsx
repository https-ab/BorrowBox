import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import ItemImage from './ItemImage';
import ConditionBadge from './ConditionBadge';
import TrustBadge from '../trust/TrustBadge';
import Avatar from '../ui/Avatar';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';
import { formatINR } from '../../utils/format';

/** The main discovery card used on Explore / Landing / Nearby. */
export default function ItemCard({ item, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.35 }}
    >
      <Link
        to={`/items/${item._id}`}
        className="card group block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <ItemImage
            src={item.images?.[0]}
            alt={item.name}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            <ConditionBadge condition={item.condition} />
          </div>
          <div className="absolute right-3 top-3">
            {item.status === 'paused' ? (
              <Badge tone="amber">Paused</Badge>
            ) : (
              <Badge tone="lime">Available</Badge>
            )}
          </div>
          <div className="absolute bottom-3 right-3 rounded-xl bg-ink/80 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
            {formatINR(item.pricePerDay)}<span className="text-[10px] font-medium text-white/70">/day</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-display text-[15px] font-bold group-hover:text-brand-600 transition-colors">
              {item.name}
            </h3>
            <StarRating rating={item.rating} size={12} className="shrink-0 !text-xs" />
          </div>
          <p className="mt-0.5 text-xs font-medium text-ink-muted">{item.category}</p>

          <div className="mt-3 flex items-center justify-between border-t border-ink/5 pt-3">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar src={item.owner?.avatar} name={item.owner?.name} size="xs" />
              <span className="truncate text-xs font-semibold text-ink-soft">{item.owner?.name}</span>
              <TrustBadge score={item.owner?.trustScore} level={item.owner?.trustLevel} />
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs text-ink-muted">
              <MapPin size={11} />
              {item.distanceKm != null ? `${item.distanceKm} km` : item.city}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
