export default function StatCard({ icon, label, value, unit, color = 'green', sub }) {
  const colors = {
    green: 'border-green-500/30 bg-green-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    yellow: 'border-yellow-500/30 bg-yellow-500/5',
    red: 'border-red-500/30 bg-red-500/5'
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-3xl font-bold text-white">
        {value ?? '—'}
        {unit && <span className="text-lg text-gray-400 ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}
