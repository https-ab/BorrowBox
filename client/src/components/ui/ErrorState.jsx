import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ message = 'Something went wrong while loading this page.', onRetry }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        <AlertTriangle size={26} />
      </div>
      <h3 className="font-display text-lg font-bold">Oops!</h3>
      <p className="max-w-sm text-sm text-ink-muted">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
