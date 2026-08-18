import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-ink-muted ${className}`}>
      <Loader2 size={28} className="animate-spin text-brand-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
