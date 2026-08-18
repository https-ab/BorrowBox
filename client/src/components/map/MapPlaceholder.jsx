import { MapPin } from 'lucide-react';

/**
 * Clean map placeholder with a pin grid aesthetic.
 * Swap this component for a real map provider (Mapbox/Google/Leaflet)
 * without touching the pages that use it.
 */
export default function MapPlaceholder({ label, sublabel, pins = [], className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2.5xl border border-ink/10 bg-[#EEF3EE] ${className}`}>
      {/* street-grid pattern */}
      <svg className="absolute inset-0 h-full w-full opacity-60" aria-hidden="true">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#CBD8CB" strokeWidth="1" />
          </pattern>
          <pattern id="roads" width="192" height="192" patternUnits="userSpaceOnUse">
            <path d="M0 96 H192 M96 0 V192" fill="none" stroke="#B7C9B7" strokeWidth="4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#roads)" />
      </svg>

      {/* decorative water + park blobs */}
      <div className="absolute -left-10 top-8 h-28 w-40 rounded-[50%] bg-sky-200/70 blur-[1px]" />
      <div className="absolute bottom-10 right-6 h-24 w-32 rounded-[45%] bg-mint-100" />

      {/* pins */}
      {pins.map((pin, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          title={pin.label}
        >
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold shadow-lift ${pin.primary ? 'bg-brand-500 text-white' : 'bg-white text-ink'}`}>
            <MapPin size={11} className={pin.primary ? 'text-lime-400' : 'text-brand-500'} />
            {pin.label}
          </div>
          <div className={`mx-auto h-2 w-2 rotate-45 ${pin.primary ? 'bg-brand-500' : 'bg-white'} -mt-1 shadow`} />
        </div>
      ))}

      {/* center label */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 to-transparent p-4 pt-10">
        <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <MapPin size={14} className="text-brand-500" /> {label}
        </p>
        {sublabel && <p className="mt-0.5 text-xs text-ink-muted">{sublabel}</p>}
        <p className="mt-1 text-[10px] text-ink-muted/70">Map preview · exact location shared after approval</p>
      </div>
    </div>
  );
}
