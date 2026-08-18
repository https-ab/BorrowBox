import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import Avatar from '../ui/Avatar';
import TrustBadge from '../trust/TrustBadge';
import UserBadges from '../trust/UserBadges';
import { memberSince } from '../../utils/format';

/** Owner summary card on the item details page. */
export default function OwnerCard({ owner }) {
  if (!owner) return null;
  return (
    <Link to={`/users/${owner._id}`} className="card block p-5 transition-all hover:shadow-lift">
      <div className="flex items-center gap-4">
        <Avatar src={owner.avatar} name={owner.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-display text-sm font-bold">
            {owner.name}
            {owner.isVerified && <BadgeCheck size={15} className="text-brand-500" />}
          </p>
          <p className="text-xs text-ink-muted">{owner.city} · member since {memberSince(owner.createdAt)}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <TrustBadge score={owner.trustScore} level={owner.trustLevel} />
            <span className="text-[11px] font-semibold text-ink-soft">{owner.trustLevel}</span>
          </div>
        </div>
      </div>
      {owner.bio && <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-muted">{owner.bio}</p>}
      <div className="mt-3">
        <UserBadges badges={owner.badges} size="sm" />
      </div>
    </Link>
  );
}
