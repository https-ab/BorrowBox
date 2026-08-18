import Badge from '../ui/Badge';

const toneMap = { 'New': 'mint', 'Like New': 'brand', 'Good': 'sky', 'Used': 'amber', 'Damaged': 'rose' };

export default function ConditionBadge({ condition }) {
  if (!condition) return null;
  return <Badge tone={toneMap[condition] || 'gray'}>{condition}</Badge>;
}
