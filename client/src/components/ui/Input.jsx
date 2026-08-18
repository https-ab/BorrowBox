import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** Text input with label, error message and optional password visibility toggle. */
const Input = forwardRef(function Input(
  { label, error, type = 'text', hint, className = '', ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={className}>
      {label && <label className="label-base">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          type={isPassword && show ? 'text' : type}
          className={`input-base ${isPassword ? 'pr-11' : ''} ${error ? 'border-rose-400 focus:border-rose-400' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
});

export default Input;
