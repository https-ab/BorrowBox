import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-sm hover:shadow-lift',
  secondary:
    'bg-lime-500 text-ink hover:bg-lime-600 active:scale-[0.98] shadow-sm',
  outline:
    'border border-ink/15 bg-white text-ink hover:border-brand-400 hover:text-brand-600 active:scale-[0.98]',
  ghost: 'text-ink-soft hover:bg-ink/5 hover:text-ink',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98]',
  dark: 'bg-ink text-white hover:bg-ink/85 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-3.5 py-2 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-2xl gap-2',
};

export default function Button({
  children, variant = 'primary', size = 'md', loading = false,
  disabled, className = '', icon: Icon, ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200
        disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
