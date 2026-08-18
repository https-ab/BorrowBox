import { BadgeCheck, Handshake, Clock3, Award } from 'lucide-react';

const badgeConfig = {
  'Verified User': { icon: BadgeCheck, cls: 'bg-brand-100 text-brand-700' },
  'Reliable Borrower': { icon: Handshake, cls: 'bg-mint-100 text-mint-700' },
  'On-Time Returner': { icon: Clock3, cls: 'bg-sky-100 text-sky-700' },
  'Trusted Lender': { icon: Award, cls: 'bg-amber-100 text-amber-700' },
};

/** Earned behaviour badges displayed on profiles. */
export default function UserBadges({ badges = [], size = 'md' }) {
  if (!badges.length) return null;
  const small = size === 'sm';
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const cfg = badgeConfig[badge] || { icon: Award, cls: 'bg-ink/[0.06] text-ink-soft' };
        const Icon = cfg.icon;
        return (
          <span key={badge} className={`inline-flex items-center gap-1.5 rounded-full font-bold ${cfg.cls} ${small ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'}`}>
            <Icon size={small ? 11 : 13} />
            {badge}
          </span>
        );
      })}
    </div>
  );
}
