import { SlidersHorizontal, X } from 'lucide-react';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { CATEGORIES, CONDITIONS } from '../../utils/constants';

/** Sidebar / collapsible filter controls for the Explore page. */
export default function FiltersPanel({ filters, onChange, onClear, open, onClose }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const content = (
    <div className="space-y-5">
      <div className="flex items-center justify-between lg:hidden">
        <h3 className="font-display text-base font-bold">Filters</h3>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-ink/5"><X size={17} /></button>
      </div>

      <Select label="Category" value={filters.category || ''} onChange={(e) => set('category', e.target.value)}>
        <option value="">All categories</option>
        {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
      </Select>

      <div>
        <label className="label-base">Condition</label>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => {
            const selected = (filters.condition || '').split(',').filter(Boolean);
            const isOn = selected.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  const next = isOn ? selected.filter((x) => x !== c) : [...selected, c];
                  set('condition', next.join(','));
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  isOn ? 'bg-brand-500 text-white shadow-glow' : 'bg-ink/[0.05] text-ink-soft hover:bg-ink/10'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="label-base">Price per day (₹)</label>
        <div className="flex items-center gap-2">
          <input
            type="number" min="0" placeholder="Min" value={filters.minPrice || ''}
            onChange={(e) => set('minPrice', e.target.value)} className="input-base"
          />
          <span className="text-ink-muted">–</span>
          <input
            type="number" min="0" placeholder="Max" value={filters.maxPrice || ''}
            onChange={(e) => set('maxPrice', e.target.value)} className="input-base"
          />
        </div>
      </div>

      <Select label="Distance" value={filters.maxDistance || ''} onChange={(e) => set('maxDistance', e.target.value)}>
        <option value="">Any distance</option>
        <option value="2">Within 2 km</option>
        <option value="5">Within 5 km</option>
        <option value="10">Within 10 km</option>
        <option value="25">Within 25 km</option>
      </Select>

      <Select label="Minimum rating" value={filters.minRating || ''} onChange={(e) => set('minRating', e.target.value)}>
        <option value="">Any rating</option>
        <option value="4.5">★ 4.5+</option>
        <option value="4">★ 4.0+</option>
        <option value="3">★ 3.0+</option>
      </Select>

      <Select label="Owner trust score" value={filters.minTrust || ''} onChange={(e) => set('minTrust', e.target.value)}>
        <option value="">Any trust level</option>
        <option value="85">Highly Trusted (85+)</option>
        <option value="65">Trusted (65+)</option>
        <option value="40">Reliable (40+)</option>
      </Select>

      <div>
        <label className="label-base">Needed between</label>
        <div className="space-y-2">
          <input type="date" value={filters.from || ''} min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => set('from', e.target.value)} className="input-base" />
          <input type="date" value={filters.to || ''} min={filters.from || new Date().toISOString().slice(0, 10)}
            onChange={(e) => set('to', e.target.value)} className="input-base" />
        </div>
        <p className="mt-1 text-[11px] text-ink-muted">Hides items already booked in this window.</p>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={onClear}>
        Clear all filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="card sticky top-24 hidden h-fit w-72 shrink-0 p-5 lg:block">
        <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold">
          <SlidersHorizontal size={16} className="text-brand-500" /> Filters
        </h3>
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-lift">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
