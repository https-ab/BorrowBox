import Select from '../ui/Select';

const options = [
  { value: 'recent', label: 'Recently added' },
  { value: 'nearby', label: 'Nearby' },
  { value: 'trusted', label: 'Most trusted' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price_low', label: 'Lowest price' },
  { value: 'price_high', label: 'Highest price' },
  { value: 'popular', label: 'Most borrowed' },
];

export default function SortSelect({ value, onChange, className = '' }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} className={className} aria-label="Sort">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );
}
