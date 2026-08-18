import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea({ label, error, hint, className = '', rows = 4, ...props }, ref) {
  return (
    <div className={className}>
      {label && <label className="label-base">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={`input-base resize-none ${error ? 'border-rose-400' : ''}`}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
});

export default Textarea;
