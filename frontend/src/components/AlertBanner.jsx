export default function AlertBanner({ alerts }) {
  if (!alerts.length) return null;

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((a, i) => (
        <div key={i} className="flex items-center gap-2 bg-red-900/40 border border-red-500/40 text-red-300 rounded-lg px-4 py-2 text-sm">
          <span>⚠️</span>
          <span>{a}</span>
        </div>
      ))}
    </div>
  );
}
