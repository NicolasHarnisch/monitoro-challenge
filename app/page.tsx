'use client';

import { useState } from 'react';
import { IncidentForm } from '@/components/IncidentForm';
import { IncidentTable } from '@/components/IncidentTable';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [searchTerm, setSearchTerm]         = useState('');
  const [activeTypes, setActiveTypes]       = useState<string[]>([]);
  const [statusFilter, setStatusFilter]     = useState('Todos');
  const [severityFilter, setSeverityFilter] = useState('Todas');

  const toggleType = (type: string) => {
    setActiveTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa] font-sans text-black">
      <Toaster position="top-right" />

      <main className="flex-1 px-8 md:px-12 py-10 max-w-full mx-auto w-full flex flex-col">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 print:hidden">
          <h1 className="text-3xl font-extrabold text-black">Ordens de Serviço</h1>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger className="bg-[#382b22] hover:bg-[#2c211a] text-white px-5 rounded-[8px] h-10 font-bold flex items-center justify-center transition-colors">
              <Plus size={18} className="mr-2" />
              Nova Ordem de Serviço
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] p-0 border-0 overflow-hidden rounded-[16px] gap-0">
              <IncidentForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white p-4 rounded-[12px] shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 mb-8 items-center print:hidden">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Buscar por equipamento, código ou motivo..."
              className="pl-12 h-11 border-gray-200 rounded-[8px] text-base font-medium focus-visible:ring-1 focus-visible:ring-gray-300 w-full shadow-none bg-transparent text-black"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full xl:w-auto">
            {['Preventiva', 'Corretiva', 'Planejada'].map(filter => {
              const isActive = activeTypes.includes(filter);
              return (
                <Button
                  key={filter}
                  variant="outline"
                  onClick={() => toggleType(filter)}
                  className={`h-11 font-bold rounded-[8px] flex-1 xl:flex-none transition-colors ${
                    isActive
                      ? 'bg-[#382b22] text-white border-[#382b22] hover:bg-[#2c211a] hover:text-white'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </Button>
              );
            })}

            <div className="w-[160px] flex-none">
              <Select
                value={statusFilter}
                onValueChange={val => {
                  setStatusFilter(val || 'Todos');
                  setSeverityFilter('Todas');
                }}
              >
                <SelectTrigger className="h-11 px-4 border border-gray-200 rounded-[8px] font-bold text-[#1f2937] bg-white focus:ring-0 shadow-sm hover:bg-gray-50 flex items-center justify-between">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Em Aberto">Em Aberto</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <IncidentTable
            searchTerm={searchTerm}
            activeTypes={activeTypes}
            statusFilter={statusFilter}
            severityFilter={severityFilter}
            onStatusFilterChange={val => {
              setStatusFilter(val);
              setSeverityFilter('Todas');
            }}
            onSeverityFilterChange={val => {
              setSeverityFilter(val);
              setStatusFilter('Todos');
            }}
            onClearFilters={() => {
              setStatusFilter('Todos');
              setSeverityFilter('Todas');
              setSearchTerm('');
              setActiveTypes([]);
            }}
          />
        </div>
      </main>
    </div>
  );
}
