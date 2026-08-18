import { useState } from 'react';
import { PackageOpen } from 'lucide-react';

/** Item image with graceful fallback when a remote image fails. */
export default function ItemImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-brand-50 text-brand-300 ${className}`}>
        <PackageOpen size={36} strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
