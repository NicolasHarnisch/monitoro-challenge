/** Badge colorido para o Tipo de Manutenção (Preventiva, Corretiva, Planejada) */

const TYPE_STYLES: Record<string, string> = {
  'Preventiva': 'bg-[#382b22] text-white',
  'Corretiva':  'bg-[#dc2626] text-white',
  'Planejada':  'bg-[#f3f4f6] text-[#4b5563]',
  'planejada':  'bg-[#f3f4f6] text-[#4b5563]',
};

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const className = TYPE_STYLES[type] ?? 'bg-gray-100 text-gray-600';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-[6px] text-[11px] font-semibold ${className}`}>
      {type}
    </span>
  );
}
