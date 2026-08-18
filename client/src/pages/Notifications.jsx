import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BellOff, CheckCheck } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import NotificationItem from '../components/notifications/NotificationItem';
import { notificationService } from '../services/borrowService';

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 'full'],
    queryFn: () => notificationService.list({ limit: 50 }),
  });

  const markAll = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  if (isLoading) return <Spinner label="Loading notifications..." />;
  if (isError) return <div className="container-app py-10"><ErrorState onRetry={refetch} /></div>;

  const notifications = data?.items || [];

  return (
    <PageTransition className="container-app max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {data.unreadCount > 0 ? `${data.unreadCount} unread` : "You're all caught up."}
          </p>
        </div>
        {data.unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={() => markAll.mutate()} loading={markAll.isPending}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length ? (
        <div className="card divide-y divide-ink/5 overflow-hidden">
          {notifications.map((n) => <NotificationItem key={n._id} notification={n} />)}
        </div>
      ) : (
        <EmptyState icon={BellOff} title="You're all caught up." message="Requests, approvals, reviews and reminders will show up here." />
      )}
    </PageTransition>
  );
}
