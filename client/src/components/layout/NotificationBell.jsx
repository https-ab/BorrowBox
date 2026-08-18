import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { notificationService } from '../../services/borrowService';
import NotificationItem from '../notifications/NotificationItem';

/** Navbar bell with unread badge + dropdown preview. */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: notificationService.unreadCount,
    refetchInterval: 60000,
  });
  const { data } = useQuery({
    queryKey: ['notifications', 'preview'],
    queryFn: () => notificationService.list({ limit: 6 }),
    enabled: open,
  });

  const markAll = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = countData?.count || 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white h-[18px]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-[22rem] max-w-[90vw] overflow-hidden rounded-2xl bg-white shadow-lift border border-ink/5"
          >
            <div className="flex items-center justify-between border-b border-ink/5 px-4 py-3">
              <h4 className="text-sm font-bold">Notifications</h4>
              {unread > 0 && (
                <button
                  onClick={() => markAll.mutate()}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {data?.items?.length ? (
                data.items.map((n) => <NotificationItem key={n._id} notification={n} compact onNavigate={() => setOpen(false)} />)
              ) : (
                <p className="px-4 py-8 text-center text-sm text-ink-muted">You're all caught up. 🎉</p>
              )}
            </div>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-ink/5 px-4 py-2.5 text-center text-xs font-bold text-brand-600 hover:bg-brand-50"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
