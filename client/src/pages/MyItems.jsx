import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Plus } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import MyItemCard from '../components/items/MyItemCard';
import { itemService } from '../services/itemService';

export default function MyItems() {
  const [tab, setTab] = useState('all');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-items'],
    queryFn: itemService.mine,
  });

  if (isLoading) return <Spinner label="Loading your items..." />;
  if (isError) return <div className="container-app py-10"><ErrorState onRetry={refetch} /></div>;

  const items = data?.items || [];
  const filtered = items.filter((item) => {
    if (tab === 'all') return true;
    if (tab === 'active') return item.status === 'active' && !item.currentBorrow;
    if (tab === 'borrowed') return Boolean(item.currentBorrow);
    if (tab === 'paused') return item.status === 'paused';
    if (tab === 'drafts') return item.status === 'draft';
    return true;
  });

  const counts = {
    active: items.filter((i) => i.status === 'active' && !i.currentBorrow).length,
    borrowed: items.filter((i) => i.currentBorrow).length,
    paused: items.filter((i) => i.status === 'paused').length,
    drafts: items.filter((i) => i.status === 'draft').length,
  };

  return (
    <PageTransition className="container-app py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">My items</h1>
          <p className="mt-1 text-sm text-ink-muted">Manage listings, track requests and watch your earnings grow.</p>
        </div>
        <Link to="/list"><Button icon={Plus}>List an item</Button></Link>
      </div>

      <Tabs
        className="mb-6"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'all', label: 'All', count: items.length },
          { id: 'active', label: 'Active', count: counts.active },
          { id: 'borrowed', label: 'Being borrowed', count: counts.borrowed },
          { id: 'paused', label: 'Paused', count: counts.paused },
          { id: 'drafts', label: 'Drafts', count: counts.drafts },
        ]}
      />

      {filtered.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => <MyItemCard key={item._id} item={item} />)}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={items.length ? 'Nothing in this tab' : 'No items listed yet'}
          message={items.length ? 'Try another tab.' : 'Your first listing takes two minutes — and your idle stuff starts paying rent.'}
          action={!items.length && <Link to="/list"><Button icon={Plus}>List your first item</Button></Link>}
        />
      )}
    </PageTransition>
  );
}
