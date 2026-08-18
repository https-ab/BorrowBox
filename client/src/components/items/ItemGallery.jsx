import { useState } from 'react';
import ItemImage from './ItemImage';

/** Large gallery with thumbnail strip for the item details page. */
export default function ItemGallery({ images = [], name }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="card overflow-hidden">
        <ItemImage src={images[active]} alt={name} className="aspect-[4/3] w-full" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-xl border-2 transition-all ${
                i === active ? 'border-brand-500 shadow-glow' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <ItemImage src={src} alt={`${name} ${i + 1}`} className="h-16 w-20" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
