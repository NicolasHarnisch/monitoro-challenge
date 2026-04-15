'use client';

import { IncidentForm } from '@/components/IncidentForm';
import { IncidentTable } from '@/components/IncidentTable';
import { Activity, Bell, BarChart3, Settings, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-20 bg-white border-r border-gray-100 items-center py-8 gap-8 shadow-sm sticky top-0 h-screen z-40">
        {/* Logo */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-3 rounded-2xl shadow-lg shadow-[#1a1a2e44]">
          <Activity size={22} className="text-white" />
        </div>
        <nav className="flex flex-col gap-5 mt-4">
          {[
            { icon: <Shield size={22} />, active: true },
            { icon: <BarChart3 size={22} />, active: false },
            { icon: <Bell size={22} />, active: false },
            { icon: <Settings size={22} />, active: false },
          ].map((item, i) => (
            <button
              key={i}
              className={`p-3 rounded-xl transition-all ${
                item.active
                  ? 'bg-[#1a1a2e] text-white shadow-lg shadow-[#1a1a2e33]'
                  : 'text-gray-300 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.icon}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
        {/* Topo: heading e badges */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
              Sistema de Manutenção
            </p>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
              Registro de Ocorrências
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-500 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistema Online
            </span>
          </div>
        </div>

        {/* Layout em grade */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Tabela de Incidentes */}
          <div className="xl:col-span-7 space-y-8">
            <IncidentTable />
          </div>

          {/* Formulário (sticky) */}
          <div className="xl:col-span-5">
            <div className="sticky top-8">
              <IncidentForm />
              {/* Card informativo */}
              <div className="mt-6 p-6 bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-[#1a1a2e44]">
                <div className="relative z-10">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">
                    Campos Obrigatórios
                  </p>
                  <h3 className="text-lg font-black mb-3">
                    Como registrar?
                  </h3>
                  <ul className="space-y-2">
                    {[
                      '📋 Selecione a máquina afetada',
                      '⚠️ Defina a severidade do problema',
                      '🔧 Escolha o tipo de ocorrência',
                      '📝 Descreva o problema em detalhes',
                    ].map((item) => (
                      <li key={item} className="text-white/70 text-xs font-medium">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Activity className="absolute -right-8 -bottom-8 text-white/5 w-40 h-40 rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
