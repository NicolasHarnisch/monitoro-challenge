'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClipboardList, RefreshCw, AlertCircle } from 'lucide-react';

const GET_LAST_INCIDENTS = gql`
  query GetLastIncidents($limit: Int) {
    lastIncidents(limit: $limit) {
      id
      description
      machineName
      severity
      status
      typeOfOccurrence
      createdAt
    }
  }
`;

interface Incident {
  id: string;
  description: string;
  machineName: string;
  severity: string;
  status: string;
  typeOfOccurrence: string;
  createdAt: string;
}

interface LastIncidentsData {
  lastIncidents: Incident[];
}

const SEVERITY_CONFIG: Record<string, { label: string; className: string }> = {
  'Baixa': { label: 'Baixa', className: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
  'Média': { label: 'Média', className: 'bg-amber-100 text-amber-800 border border-amber-200' },
  'Alta': { label: 'Alta', className: 'bg-red-100 text-red-800 border border-red-200' },
};

const TYPE_CONFIG: Record<string, { className: string }> = {
  'Preventiva': { className: 'bg-blue-100 text-blue-800 border border-blue-200' },
  'Corretiva': { className: 'bg-orange-100 text-orange-800 border border-orange-200' },
  'Planejada': { className: 'bg-purple-100 text-purple-800 border border-purple-200' },
};

function SeverityBadge({ severity }: { severity: string }) {
  const config = SEVERITY_CONFIG[severity] ?? { label: severity, className: 'bg-gray-100 text-gray-600 border border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${config.className}`}>
      {config.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const config = TYPE_CONFIG[type] ?? { className: 'bg-gray-100 text-gray-600 border border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${config.className}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
      {status}
    </span>
  );
}

const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-6 py-5">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${60 + i * 10}%` }} />
      </td>
    ))}
  </tr>
);

export function IncidentTable() {
  const { data, loading, error, refetch } = useQuery<LastIncidentsData>(GET_LAST_INCIDENTS, {
    variables: { limit: 5 },
    pollInterval: 10000,
  });

  const incidents = data?.lastIncidents ?? [];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-2.5 rounded-xl">
            <ClipboardList className="text-white" size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              Últimos Incidentes
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Exibindo os últimos 5 registros
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-gray-700 transition-colors px-3 py-2 hover:bg-gray-50 rounded-xl"
        >
          <RefreshCw size={14} />
          Atualizar
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 mx-6 my-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
          <AlertCircle size={18} />
          <div>
            <p className="font-black text-sm">Erro ao carregar dados</p>
            <p className="text-xs font-medium opacity-80">{error.message}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Máquina</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Severidade</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

            {!loading && !error && incidents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-300">
                    <ClipboardList size={48} strokeWidth={1} />
                    <p className="font-black text-sm">Nenhum incidente registrado ainda</p>
                    <p className="text-xs">Use o formulário acima para registrar a primeira ocorrência</p>
                  </div>
                </td>
              </tr>
            )}

            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-gray-50/60 transition-colors group">
                <td className="px-6 py-5">
                  <div className="font-bold text-sm text-gray-900 group-hover:text-[#1a1a2e] transition-colors">
                    {incident.machineName}
                  </div>
                  <div className="text-[10px] font-mono text-gray-300 mt-0.5">
                    #{incident.id.slice(-6).toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <SeverityBadge severity={incident.severity} />
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={incident.status} />
                </td>
                <td className="px-6 py-5">
                  <TypeBadge type={incident.typeOfOccurrence} />
                </td>
                <td className="px-6 py-5 text-sm font-bold text-gray-400">
                  {format(new Date(parseInt(incident.createdAt)), "dd/MM/yy, HH:mm", { locale: ptBR })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Painel de detalhes – aparece ao selecionar um incidente futuramente */}
      {incidents.length > 0 && (
        <div className="px-6 pb-4 pt-2 border-t border-gray-50">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">
              Descrições Recentes
            </p>
            {incidents.slice(0, 3).map((incident) => (
              <div key={incident.id} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-black text-gray-600">{incident.machineName}</span>
                  <span className="text-xs text-gray-400 ml-2 font-medium">{incident.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
