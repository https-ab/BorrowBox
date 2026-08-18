/** Animated circular trust score ring (0-100). */
export default function TrustScoreRing({ score = 0, size = 96, label = true }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? '#22C55E' : score >= 65 ? '#6D5EF3' : score >= 40 ? '#0EA5E9' : '#8B8697';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(23,20,31,0.07)" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      {label && (
        <div className="absolute text-center">
          <div className="font-display text-2xl font-extrabold leading-none">{score}</div>
          <div className="text-[10px] font-semibold text-ink-muted">/ 100</div>
        </div>
      )}
    </div>
  );
}
