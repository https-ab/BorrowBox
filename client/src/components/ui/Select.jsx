import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <div className={className}>
      {label && <label className="label-base">{label}</label>}
      <div className="relative">
        <select ref={ref} className={`input-base appearance-none pr-10 ${error ? 'border-rose-400' : ''}`} {...props}>
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
});

export default Select;
