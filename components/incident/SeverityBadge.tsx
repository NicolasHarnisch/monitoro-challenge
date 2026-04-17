interface SeverityBadgeProps {
  severity: string;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const s = severity.toLowerCase();

  let colorClasses = 'bg-gray-100 text-gray-700';
  if (s === 'alta')                   colorClasses = 'bg-red-100 text-red-700';
  if (s === 'média' || s === 'media') colorClasses = 'bg-amber-100 text-amber-700';
  if (s === 'baixa')                  colorClasses = 'bg-green-100 text-green-700';

  return (
    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${colorClasses}`}>
      {severity}
    </span>
  );
}
