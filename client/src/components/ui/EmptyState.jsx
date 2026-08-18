/** Generic empty state with icon, message and optional action. */
export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
          <Icon size={26} />
        </div>
      )}
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {message && <p className="max-w-sm text-sm text-ink-muted">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
