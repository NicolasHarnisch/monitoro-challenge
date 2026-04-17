'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { format, subMonths, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ServiceOrder } from '@/types/service-order';

const getMachineName = (i: ServiceOrder) => i.machine?.name ?? (i as ServiceOrder & { machineName?: string }).machineName ?? 'Desconhecida';

export function IncidentAnalytics({ incidents }: { incidents: ServiceOrder[] }) {
  // Processar dados para as 2 visualizações
  const data = useMemo(() => {
    // 1. Considerar apenas os últimos 3 meses
    const threeMonthsAgo = subMonths(new Date(), 3);
    const recentIncidents = incidents.filter(i => isAfter(new Date(parseInt(i.createdAt)), threeMonthsAgo));

    const volumeMap = new Map<string, number>();
    const severityMap = new Map<string, { name: string; Alta: number; Média: number; Baixa: number }>();

    // Pré-preencher os meses para o gráfico de área ter uma linha contínua, mesmo com poucos dados
    for (let i = 3; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const dateStr = format(d, "MMM/yy", { locale: ptBR });
      volumeMap.set(dateStr, 0);
    }

    recentIncidents.forEach(incident => {
      // Data para Volume agrupado por Mes/Ano
      const dateStr = format(new Date(parseInt(incident.createdAt)), "MMM/yy", { locale: ptBR });
      if (volumeMap.has(dateStr)) {
         volumeMap.set(dateStr, volumeMap.get(dateStr)! + 1);
      }

      // Data para Severidade por Máquina
      const machine = getMachineName(incident);
      if (!severityMap.has(machine)) {
        severityMap.set(machine, { name: machine, Alta: 0, Média: 0, Baixa: 0 });
      }
      const sevObj = severityMap.get(machine)!;
      if (incident.severity === 'Alta') sevObj.Alta += 1;
      else if (incident.severity.toLowerCase() === 'média' || incident.severity.toLowerCase() === 'media') sevObj.Média += 1;
      else sevObj.Baixa += 1;
    });

    const volumeData = Array.from(volumeMap.entries())
      .map(([date, count]) => ({ date, count }));

    const severityData = Array.from(severityMap.values())
      .sort((a, b) => (b.Alta + b.Média + b.Baixa) - (a.Alta + a.Média + a.Baixa))
      .reverse()
      .slice(0, 5);

    return { volumeData, severityData };
  }, [incidents]);

  if (incidents.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print:hidden">
      {/* Gráfico 1: Volume Acumulado (Últimos 3 Meses) */}
      <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex flex-col hover:border-gray-200 transition-colors">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Volume de Ocorrências</h3>
          <p className="text-sm text-gray-500 font-medium">Evolução do registro de ordens nos últimos 3 meses</p>
        </div>
        <div className="h-70 w-full">
          {data.volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#382b22" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#382b22" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 12, fill: '#6b7280', fontWeight: 500}} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{fontSize: 12, fill: '#6b7280', fontWeight: 500}} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false} 
                />
                <Tooltip 
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Ordens Abertas" 
                  stroke="#382b22" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                  activeDot={{ r: 6, fill: '#382b22', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">Dados insuficientes para os últimos 3 meses</div>
          )}
        </div>
      </div>

      {/* Gráfico 2: Top Máquinas por Severidade */}
      <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex flex-col hover:border-gray-200 transition-colors">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Maiores Ocorrências</h3>
          <p className="text-sm text-gray-500 font-medium">Top 5 equipamentos agrupados por severidade</p>
        </div>
        <div className="h-70 w-full">
          {data.severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data.severityData} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  type="number"
                  tick={{fontSize: 12, fill: '#6b7280', fontWeight: 500}} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  tick={{fontSize: 11, fill: '#111827', fontWeight: 600}} 
                  tickLine={false} 
                  axisLine={false} 
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                />
                <Legend 
                   iconType="circle" 
                   verticalAlign="top"
                   align="right"
                   wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', paddingBottom: '20px' }} 
                />
                {/* Usamos radius apenas na barra que costuma ficar na ponta (opcional) ou removemos para visual sólido */}
                <Bar dataKey="Baixa" name="Baixa" stackId="a" fill="#d1d5db" />
                <Bar dataKey="Média" name="Média" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Alta" name="Alta" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
           ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">Nenhum dado disponível</div>
          )}
        </div>
      </div>
    </div>
  );
}