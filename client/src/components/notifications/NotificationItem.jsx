import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Inbox, CheckCircle2, XCircle, Ban, HandHelping, Undo2, BadgeCheck, Clock, Star, Gavel, Info,
} from 'lucide-react';
import { notificationService } from '../../services/borrowService';
import { timeAgo } from '../../utils/format';

const typeIcons = {
  request_received: { icon: Inbox, cls: 'bg-brand-100 text-brand-600' },
  request_approved: { icon: CheckCircle2, cls: 'bg-mint-100 text-mint-700' },
  request_rejected: { icon: XCircle, cls: 'bg-rose-100 text-rose-600' },
  request_cancelled: { icon: Ban, cls: 'bg-ink/[0.06] text-ink-soft' },
  handover: { icon: HandHelping, cls: 'bg-lime-300/60 text-ink' },
  return_initiated: { icon: Undo2, cls: 'bg-sky-100 text-sky-700' },
  return_confirmed: { icon: BadgeCheck, cls: 'bg-mint-100 text-mint-700' },
  return_due: { icon: Clock, cls: 'bg-amber-100 text-amber-700' },
  review_received: { icon: Star, cls: 'bg-amber-100 text-amber-700' },
  dispute_opened: { icon: Gavel, cls: 'bg-rose-100 text-rose-600' },
  dispute_resolved: { icon: Gavel, cls: 'bg-mint-100 text-mint-700' },
  system: { icon: Info, cls: 'bg-ink/[0.06] text-ink-soft' },
};

/** Single notification row (dropdown preview + full page). */
export default function NotificationItem({ notification, compact = false, onNavigate }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { icon: Icon, cls } = typeIcons[notification.type] || typeIcons.system;

  const markRead = useMutation({
    mutationFn: () => notificationService.markRead(notification._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleClick = () => {
    if (!notification.isRead) markRead.mutate();
    onNavigate?.();
    if (notification.link) navigate(notification.link);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-50/60 ${
        !notification.isRead ? 'bg-brand-50/40' : ''
      }`}
    >
      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cls}`}>
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm leading-snug ${notification.isRead ? 'font-medium text-ink-soft' : 'font-bold text-ink'}`}>
          {notification.title}
        </span>
        {!compact && notification.body && (
          <span className="mt-0.5 block text-xs text-ink-muted">{notification.body}</span>
        )}
        <span className="mt-0.5 block text-[11px] text-ink-muted">{timeAgo(notification.createdAt)}</span>
      </span>
      {!notification.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
    </button>
  );
}
