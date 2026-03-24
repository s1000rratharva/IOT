export default function MoistureGauge({ value = 0 }) {
  const clamped = Math.min(100, Math.max(0, value));
  const color =
    clamped < 20 ? '#ef4444' :
    clamped < 40 ? '#f97316' :
    clamped < 70 ? '#22c55e' : '#0ea5e9';

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1f2937" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
        />
        <text x="70" y="65" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
          {clamped}%
        </text>
        <text x="70" y="85" textAnchor="middle" fill="#9ca3af" fontSize="11">
          Moisture
        </text>
      </svg>
    </div>
  );
}
