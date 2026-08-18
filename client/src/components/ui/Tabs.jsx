/** Pill-style tab switcher. tabs: [{ id, label, count? }] */
export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`inline-flex flex-wrap gap-1 rounded-2xl bg-ink/[0.05] p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
            active === tab.id ? 'bg-white text-ink shadow-soft' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {tab.label}
          {tab.count != null && tab.count > 0 && (
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active === tab.id ? 'bg-brand-500 text-white' : 'bg-ink/10 text-ink-soft'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
