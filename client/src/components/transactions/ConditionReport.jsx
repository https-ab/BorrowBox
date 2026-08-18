import { Camera } from 'lucide-react';
import ConditionBadge from '../items/ConditionBadge';
import ItemImage from '../items/ItemImage';
import { formatDate } from '../../utils/format';

/** Displays one condition report (before or after) side of the comparison. */
export default function ConditionReport({ title, report, emptyHint }) {
  return (
    <div className="rounded-2xl border border-ink/10 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-ink-muted">{title}</h4>
        {report && <ConditionBadge condition={report.condition} />}
      </div>
      {report ? (
        <>
          {report.notes && <p className="text-sm leading-relaxed text-ink-soft">{report.notes}</p>}
          {report.photos?.length > 0 && (
            <div className="mt-3 flex gap-2">
              {report.photos.map((photo, i) => (
                <ItemImage key={i} src={photo} alt={`${title} photo ${i + 1}`} className="h-16 w-20 rounded-lg" />
              ))}
            </div>
          )}
          <p className="mt-2 text-[11px] text-ink-muted">Recorded {formatDate(report.recordedAt)}</p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-5 text-center">
          <Camera size={20} className="text-ink/20" />
          <p className="text-xs text-ink-muted">{emptyHint || 'Not recorded yet.'}</p>
        </div>
      )}
    </div>
  );
}
