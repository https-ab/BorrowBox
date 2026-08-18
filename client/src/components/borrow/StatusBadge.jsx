import Badge from '../ui/Badge';

const map = {
  pending: { tone: 'amber', label: 'Pending' },
  approved: { tone: 'brand', label: 'Approved' },
  rejected: { tone: 'rose', label: 'Rejected' },
  cancelled: { tone: 'gray', label: 'Cancelled' },
  expired: { tone: 'gray', label: 'Expired' },
  active: { tone: 'lime', label: 'Active' },
  returned: { tone: 'sky', label: 'Returned' },
  completed: { tone: 'mint', label: 'Completed' },
  disputed: { tone: 'rose', label: 'Disputed' },
  open: { tone: 'amber', label: 'Open' },
  under_review: { tone: 'sky', label: 'Under Review' },
  resolved: { tone: 'mint', label: 'Resolved' },
};

/** Colored status badge for requests / transactions / disputes. */
export default function StatusBadge({ status }) {
  const cfg = map[status] || { tone: 'gray', label: status };
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}
