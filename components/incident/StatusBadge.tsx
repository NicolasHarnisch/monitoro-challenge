/** Indicador de status com ponto colorido (Em Aberto · Em Andamento · Concluído) */

interface StatusBadgeProps {
  status: string;
  isDarkBackground?: boolean; // Inverte a cor do texto para fundos escuros
}

export function StatusBadge({ status, isDarkBackground = false }: StatusBadgeProps) {
  const s = status.toLowerCase();

  let dotColor = 'bg-gray-500';
  if (s.includes('concluí') || s.includes('conclui'))     dotColor = 'bg-emerald-500';
  if (s.includes('aberto'))                               dotColor = 'bg-red-500';
  if (s.includes('andamento') || s.includes('progresso')) dotColor = 'bg-amber-500';

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className={`text-sm font-medium ${isDarkBackground ? 'text-gray-200' : 'text-gray-800'}`}>
        {status}
      </span>
    </div>
  );
}
