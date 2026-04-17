'use client';

import { Clock, AlertTriangle, Activity, ListTodo } from 'lucide-react';

interface KpiCardsProps {
  openCount: number;
  criticalCount: number;
  mediumCount: number;
  totalCount: number;
  statusFilter: string;
  severityFilter: string;
  onStatusFilterChange: (status: string) => void;
  onSeverityFilterChange: (severity: string) => void;
  onClearFilters: () => void;
}

export function KpiCards({
  openCount,
  criticalCount,
  mediumCount,
  totalCount,
  statusFilter,
  severityFilter,
  onStatusFilterChange,
  onSeverityFilterChange,
  onClearFilters,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden mb-8">

      <button
        onClick={() => onStatusFilterChange('Em Aberto')}
        className={`bg-white p-5 rounded-[12px] shadow-sm border flex items-center justify-between transition-all group
          ${statusFilter === 'Em Aberto'
            ? 'border-orange-500 ring-1 ring-orange-500'
            : 'border-gray-100 hover:border-gray-300'}`}
      >
        <div className="text-left">
          <p className="text-sm text-gray-500 font-medium mb-1">Em Aberto</p>
          <h3 className="text-2xl font-black text-gray-900">{openCount}</h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
          ${statusFilter === 'Em Aberto' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-500 group-hover:bg-orange-100'}`}>
          <Clock size={24} />
        </div>
      </button>

      <button
        onClick={() => onSeverityFilterChange('Alta')}
        className={`bg-white p-5 rounded-[12px] shadow-sm border flex items-center justify-between transition-all group
          ${severityFilter === 'Alta'
            ? 'border-red-500 ring-1 ring-red-500'
            : 'border-gray-100 hover:border-gray-300'}`}
      >
        <div className="text-left">
          <p className="text-sm text-gray-500 font-medium mb-1">Críticas (Alta)</p>
          <h3 className="text-2xl font-black text-red-600">{criticalCount}</h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
          ${severityFilter === 'Alta' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-500 group-hover:bg-red-100'}`}>
          <AlertTriangle size={24} />
        </div>
      </button>

      <button
        onClick={() => onSeverityFilterChange('Média')}
        className={`bg-white p-5 rounded-[12px] shadow-sm border flex items-center justify-between transition-all group
          ${severityFilter === 'Média'
            ? 'border-amber-500 ring-1 ring-amber-500'
            : 'border-gray-100 hover:border-gray-300'}`}
      >
        <div className="text-left">
          <p className="text-sm text-gray-500 font-medium mb-1">Média</p>
          <h3 className="text-2xl font-black text-amber-600">{mediumCount}</h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
          ${severityFilter === 'Média' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-500 group-hover:bg-amber-100'}`}>
          <Activity size={24} />
        </div>
      </button>

      <button
        onClick={onClearFilters}
        className={`bg-white p-5 rounded-[12px] shadow-sm border flex items-center justify-between transition-all group
          ${statusFilter === 'Todos' && severityFilter === 'Todas'
            ? 'border-blue-600 ring-1 ring-blue-600'
            : 'border-gray-100 hover:border-gray-300'}`}
      >
        <div className="text-left">
          <p className="text-sm text-gray-500 font-medium mb-1">Total de Ordens</p>
          <h3 className="text-2xl font-black text-gray-900">{totalCount}</h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
          ${statusFilter === 'Todos' && severityFilter === 'Todas'
            ? 'bg-blue-600 text-white'
            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
          <ListTodo size={24} />
        </div>
      </button>

    </div>
  );
}
