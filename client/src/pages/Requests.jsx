import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Inbox, Send, ArrowLeftRight } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import Tabs from '../components/ui/Tabs';
import RequestCard from '../components/borrow/RequestCard';
import TransactionCard from '../components/transactions/TransactionCard';
import { requestService, transactionService } from '../services/borrowService';
import { useAuth } from '../store/AuthContext';

/** Requests & Borrowings hub: incoming, outgoing and transaction history. */
export default function Requests() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const tab = params.get('tab') || 'incoming';

  const incoming = useQuery({
    queryKey: ['requests', 'incoming'],
    queryFn: () => requestService.list({ role: 'incoming' }),
  });
  const outgoing = useQuery({
    queryKey: ['requests', 'outgoing'],
    queryFn: () => requestService.list({ role: 'outgoing' }),
  });
  const transactions = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.list({}),
  });

  const active = { incoming, outgoing, activity: transactions }[tab] || incoming;
  const pendingIncoming = incoming.data?.requests?.filter((r) => r.status === 'pending').length || 0;
  const pendingOutgoing = outgoing.data?.requests?.filter((r) => r.status === 'pending').length || 0;

  return (
    <PageTransition className="container-app max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Requests & borrowings</h1>
        <p className="mt-1 text-sm text-ink-muted">Everything moving in and out of your BorrowBox.</p>
      </div>

      <Tabs
        className="mb-6"
        active={tab}
        onChange={(t) => setParams({ tab: t })}
        tabs={[
          { id: 'incoming', label: 'Incoming', count: pendingIncoming },
          { id: 'outgoing', label: 'My requests', count: pendingOutgoing },
          { id: 'activity', label: 'Transactions' },
        ]}
      />

      {active.isLoading ? (
        <Spinner />
      ) : active.isError ? (
        <ErrorState onRetry={active.refetch} />
      ) : tab === 'activity' ? (
        transactions.data?.transactions?.length ? (
          <div className="space-y-4">
            {transactions.data.transactions.map((t) => (
              <TransactionCard key={t._id} transaction={t} viewerId={user?._id} />
            ))}
          </div>
        ) : (
          <EmptyState icon={ArrowLeftRight} title="No transactions yet" message="Once a request is approved, the full transaction lifecycle shows up here." />
        )
      ) : (
        (() => {
          const requests = (tab === 'incoming' ? incoming : outgoing).data?.requests || [];
          return requests.length ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestCard key={request._id} request={request} mode={tab} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={tab === 'incoming' ? Inbox : Send}
              title={tab === 'incoming' ? 'No incoming requests' : 'No requests sent'}
              message={
                tab === 'incoming'
                  ? 'When someone wants to borrow your items, their requests appear here.'
                  : "You haven't borrowed anything yet. Find something worth experiencing!"
              }
            />
          );
        })()
      )}
    </PageTransition>
  );
}
