/** Circular avatar with graceful fallback to initials. */
export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const sizes = { xs: 'h-6 w-6 text-[9px]', sm: 'h-8 w-8 text-[10px]', md: 'h-10 w-10 text-xs', lg: 'h-14 w-14 text-sm', xl: 'h-20 w-20 text-lg', '2xl': 'h-28 w-28 text-2xl' };
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full bg-brand-100 ${sizes[size]} ${className}`}>
      <span className="absolute inset-0 flex items-center justify-center font-bold text-brand-700">{initials || '?'}</span>
      {src && (
        <img
          src={src}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
    </div>
  );
}
