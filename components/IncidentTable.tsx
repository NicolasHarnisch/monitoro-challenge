'use client';

/**
 * Dashboard principal: lista, filtra, ordena e gerencia ordens de serviço
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Printer, ExternalLink, Edit, Trash2, LayoutDashboard,
  AlertTriangle, CheckCircle2, Activity, ArrowUpDown,
  PlayCircle, Undo2, X, Download, FilterX, RefreshCw,
} from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

import { GET_SERVICE_ORDERS, DELETE_SERVICE_ORDER, UPDATE_STATUS, COMPLETE_SERVICE_ORDER } from '@/lib/graphql-queries';
import type { ServiceOrder, SortConfig } from '@/types/service-order';

// retrocompatibilidade de nomes
type Incident = ServiceOrder;

import { KpiCards } from '@/components/incident/KpiCards';
import { TypeBadge } from '@/components/incident/TypeBadge';
import { StatusBadge } from '@/components/incident/StatusBadge';
import { SeverityBadge } from '@/components/incident/SeverityBadge';
import { IncidentForm } from '@/components/IncidentForm';
import { IncidentAnalytics } from '@/components/IncidentAnalytics';

interface ServiceOrdersData {
  serviceOrders: ServiceOrder[];
}

interface IncidentTableProps {
  searchTerm: string;
  activeTypes: string[];
  statusFilter: string;
  severityFilter: string;
  onStatusFilterChange: (status: string) => void;
  onSeverityFilterChange: (severity: string) => void;
  onClearFilters: () => void;
}

export function IncidentTable({
  searchTerm,
  activeTypes,
  statusFilter,
  severityFilter,
  onStatusFilterChange,
  onSeverityFilterChange,
  onClearFilters,
}: IncidentTableProps) {
  // --- Busca de dados (polling a cada 10s) ---
  const { data, loading, error } = useQuery<ServiceOrdersData>(GET_SERVICE_ORDERS, {
    variables: { limit: 100 },
    pollInterval: 10000,
    notifyOnNetworkStatusChange: false,
  });

  const [deleteServiceOrderMutation] = useMutation(DELETE_SERVICE_ORDER, {
    refetchQueries: [{ query: GET_SERVICE_ORDERS, variables: { limit: 100 } }],
  });

  const [updateStatusMutation] = useMutation(UPDATE_STATUS, {
    refetchQueries: [{ query: GET_SERVICE_ORDERS, variables: { limit: 100 } }],
  });

  // Mutation para concluir OS — equivalente a completeServiceOrder do projeto de referência.
  const [completeServiceOrderMutation] = useMutation(COMPLETE_SERVICE_ORDER, {
    refetchQueries: [{ query: GET_SERVICE_ORDERS, variables: { limit: 100 } }],
  });

  // --- Estados locais ---
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen]       = useState(false);
  const [isDeleteOpen, setIsDeleteOpen]   = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [completeForm, setCompleteForm] = useState({ serviceEndDate: '', servicePerformed: '', serviceOrderLink: '' });
  const [machineFilter, setMachineFilter] = useState<string | null>(null);
  const [sortConfig, setSortConfig]       = useState<SortConfig>({ key: 'status', direction: 'asc' });

  const incidents = data?.serviceOrders ?? [];

  // --- Helpers ---
  /** Extrai o departamento da máquina relacionada */
  const getDepartment = (incident: Incident | null): string => {
    if (!incident) return 'N/A';
    if (incident.machine?.department) return incident.machine.department;
    return 'N/A';
  };

  /** Retorna o nome de exibição da máquina */
  const getMachineName = (incident: Incident | null): string => {
    if (!incident) return '';
    return incident.machine?.name ?? (incident as any).machineName ?? '';
  };

  /** Retorna o código da máquina relacionada */
  const getMachineCode = (incident: Incident | null): string => {
    if (!incident) return '';
    return incident.machine?.code ?? '';
  };

  const getStatusWeight = (status: string): number => {
    const s = status.toLowerCase();
    if (s.includes('aberto'))   return 1;
    if (s.includes('andamento') || s.includes('progresso')) return 2;
    if (s.includes('concluí')   || s.includes('conclui'))   return 3;
    return 4;
  };

  // --- Filtragem composta ---
  const filteredIncidents = incidents.filter(inc => {
    if (machineFilter && getMachineName(inc) !== machineFilter) return false;

    const term = searchTerm.toLowerCase();
    const textMatch =
      getMachineName(inc).toLowerCase().includes(term) ||
      inc.reason.toLowerCase().includes(term) ||
      inc.id.toLowerCase().includes(term);

    const incType = inc.type ?? (inc as any).typeOfOccurrence ?? '';
    const typeMatch = activeTypes.length === 0 ||
      activeTypes.some(t => t.toLowerCase() === incType.toLowerCase());

    let statusMatch = true;
    if (statusFilter !== 'Todos') {
      const s = inc.status.toLowerCase();
      if (statusFilter === 'Concluído'    && !s.includes('concluí') && !s.includes('conclui')) statusMatch = false;
      if (statusFilter === 'Em Aberto'    && !s.includes('aberto'))                            statusMatch = false;
      if (statusFilter === 'Em Andamento' && !s.includes('andamento') && !s.includes('progresso')) statusMatch = false;
    }

    let severityMatch = true;
    if (severityFilter !== 'Todas') {
      const sev = inc.severity.toLowerCase();
      if (severityFilter === 'Alta'  && sev !== 'alta')                       severityMatch = false;
      if (severityFilter === 'Média' && sev !== 'média' && sev !== 'media')   severityMatch = false;
    }

    return textMatch && typeMatch && statusMatch && severityMatch;
  });

  // --- Ordenação ---
  const finalIncidents = [...filteredIncidents].sort((a, b) => {
    let valA: string | number = a[sortConfig.key as keyof Incident] as string;
    let valB: string | number = b[sortConfig.key as keyof Incident] as string;

    if (sortConfig.key === 'createdAt') {
      valA = parseInt(valA as string);
      valB = parseInt(valB as string);
    } else if (sortConfig.key === 'status') {
      valA = getStatusWeight(a.status);
      valB = getStatusWeight(b.status);
    } else {
      valA = (valA ?? '').toString().toLowerCase();
      valB = (valB ?? '').toString().toLowerCase();
    }

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ?  1 : -1;
    return 0;
  });

  // --- Cálculo dos KPIs ---
  const kpiBase       = machineFilter ? incidents.filter(i => getMachineName(i) === machineFilter) : incidents;
  const totalCount    = kpiBase.length;
  const openCount     = kpiBase.filter(i => i.status.toLowerCase().includes('aberto')).length;
  const criticalCount = kpiBase.filter(i => i.severity.toLowerCase() === 'alta').length;
  const mediumCount   = kpiBase.filter(i => i.severity.toLowerCase() === 'média' || i.severity.toLowerCase() === 'media').length;

  // --- Action handlers ---
  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const handlePrint = (incident: Incident) => {
    setSelectedIncident(incident);
    setTimeout(() => window.print(), 100);
  };

  const handleOpenDetails = (incident: Incident) => { setSelectedIncident(incident); setIsDetailsOpen(true); };
  const handleOpenEdit    = (incident: Incident) => { setSelectedIncident(incident); setIsEditOpen(true); };
  const handleOpenDelete  = (incident: Incident) => { setSelectedIncident(incident); setIsDeleteOpen(true); };

  const confirmDelete = async () => {
    if (!selectedIncident) return;
    try {
      await deleteServiceOrderMutation({ variables: { id: selectedIncident.id } });
      toast.success('Ordem de serviço excluída com sucesso.');
      setIsDeleteOpen(false);
    } catch {
      toast.error('Erro ao excluir ordem de serviço.');
    }
  };

  // Abre o modal de conclusão
  const handleOpenComplete = (incident: Incident, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIncident(incident);
    setCompleteForm({ serviceEndDate: '', servicePerformed: '', serviceOrderLink: '' });
    setIsCompleteOpen(true);
  };

  const confirmComplete = async () => {
    if (!selectedIncident || !completeForm.serviceEndDate) {
      toast.error('Preencha a data de término do serviço.');
      return;
    }
    try {
      await completeServiceOrderMutation({
        variables: {
          id: selectedIncident.id,
          serviceEndDate: new Date(completeForm.serviceEndDate + 'T12:00:00.000Z').toISOString(),
          servicePerformed: completeForm.servicePerformed || undefined,
          serviceOrderLink: completeForm.serviceOrderLink || undefined,
        },
      });
      toast.success('Ordem de serviço concluída com sucesso!');
      setIsCompleteOpen(false);
      
      // Aciona automaticamente a impressão da OS concluída para o PDF final
      setTimeout(() => {
        handlePrint(selectedIncident);
      }, 500);
    } catch {
      toast.error('Erro ao concluir a ordem de serviço.');
    }
  };

  const handleFastStatusUpdate = async (incident: Incident, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (incident.status === 'Concluído' && (newStatus === 'Em Andamento' || newStatus === 'Em Aberto')) {
        await updateStatusMutation({ 
          variables: { 
            id: incident.id, 
            status: newStatus,
          },
        });

      } else {
        await updateStatusMutation({ variables: { id: incident.id, status: newStatus } });
      }
      toast.success(`Status atualizado para "${newStatus}"!`);
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  };

  /** Função para reabrir OS limpando os dados de conclusão */
  const [reopenServiceOrderMutation] = useMutation(gql`
    mutation ReopenServiceOrder($id: ID!, $status: String!) {
      updateServiceOrder(id: $id, status: $status, serviceEndDate: null, servicePerformed: null, serviceOrderLink: null) {
        id
        status
      }
    }
  `, {
    refetchQueries: [{ query: GET_SERVICE_ORDERS, variables: { limit: 100 } }],
  });

  const handleReopen = async (incident: Incident, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await reopenServiceOrderMutation({ variables: { id: incident.id, status: 'Em Andamento' } });
      toast.success('Ordem de serviço reaberta com sucesso!');
    } catch {
      toast.error('Erro ao reabrir ordem de serviço.');
    }
  };

  // --- Exportação CSV ---
  const handleExportCSV = () => {
    if (finalIncidents.length === 0) {
      toast.error('Nenhum dado para exportar.');
      return;
    }

    const headers = ['ID', 'Cód. Máquina', 'Equipamento', 'Departamento', 'Motivo', 'Tipo', 'Status', 'Severidade', 'Máquina Parada?', 'Data de Criação', 'Data Conclusão'];
    const escapeField = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const rows = finalIncidents.map(i => [
      escapeField(i.id),
      escapeField(getMachineCode(i)),
      escapeField(getMachineName(i)),
      escapeField(getDepartment(i)),
      escapeField(i.reason),
      escapeField(i.type ?? (i as any).typeOfOccurrence ?? ''),
      escapeField(i.status),
      escapeField(i.severity),
      escapeField(i.isMachineStopped ? 'Sim' : 'Não'),
      escapeField(format(new Date(parseInt(i.createdAt)), 'dd/MM/yyyy HH:mm', { locale: ptBR })),
      escapeField(i.serviceEndDate ? format(new Date(parseInt(i.serviceEndDate)), 'dd/MM/yyyy', { locale: ptBR }) : '-'),
    ].join(';'));

    // '\uFEFF' é o BOM UTF-8 — necessário para o Excel Windows ler acentos corretamente
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-os-${format(new Date(), 'dd-MM-yyyy')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Relatório CSV exportado com sucesso!');
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Erro ao comunicar com o servidor. Verifique a conexão com o MongoDB.
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { margin: 0mm; size: auto; }
          body { 
            background-color: white !important; 
            margin: 0 !important; 
            padding: 0 !important;
            overflow: visible !important;
          }
          /* Esconde o layout principal do site */
          #main-layout, 
          header, 
          header *,
          footer, 
          nav, 
          button, 
          .no-print { 
            display: none !important; 
          }
          /* Garante que o container de impressão ocupe a página toda */
          .print-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            z-index: 9999 !important;
            background: white !important;
          }
        }
      `}</style>

      <div id="main-layout" className="w-full flex-1 flex flex-col gap-6 relative">



      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-[550px] border-0 rounded-[20px] p-0 overflow-hidden bg-white shadow-2xl flex flex-col max-h-[95vh]">
          <div className="bg-[#382b22] px-6 sm:px-8 py-5 sm:py-6 text-white relative flex flex-col justify-center min-h-[90px] flex-shrink-0">
            <button onClick={() => setIsDetailsOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 mb-1">Detalhes da Ocorrência</p>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  #{selectedIncident?.id.slice(-8).toUpperCase()}
                </DialogTitle>
              </div>
              <div className="pr-4">
                <StatusBadge status={selectedIncident?.status || ''} isDarkBackground />
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Equipamento</p>
                <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                  {getMachineName(selectedIncident)}
                  {selectedIncident?.isMachineStopped && (
                    <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                      <AlertTriangle size={10} /> Parada
                    </span>
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Departamento</p>
                <p className="text-base font-bold text-gray-900">
                  {selectedIncident ? getDepartment(selectedIncident) : '-'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo de Serviço</p>
                <div className="pt-1"><TypeBadge type={selectedIncident?.type ?? (selectedIncident as any)?.typeOfOccurrence ?? ''} /></div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Severidade</p>
                <div className="pt-1"><SeverityBadge severity={selectedIncident?.severity || 'Média'} /></div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Motivo da Solicitação</p>
              <p className="text-base font-medium text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {selectedIncident?.reason}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição Técnica</p>
              <div className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200 min-h-[100px] whitespace-pre-wrap">
                {selectedIncident?.description || 'Nenhuma observação técnica adicional foi registrada para esta ordem de serviço.'}
              </div>
            </div>

            {selectedIncident?.status === 'Concluído' && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="h-[1px] bg-gray-100 w-full" />
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={12} /> Parecer Técnico de Conclusão
                  </p>
                  <div className="text-sm font-medium text-emerald-900 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    {selectedIncident?.servicePerformed || 'Serviço concluído conforme padrões técnicos.'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 text-[10px] font-bold uppercase tracking-widest">
                  <div className="space-y-1">
                    <p className="text-gray-400">Data de Início</p>
                    <p className="text-gray-900">
                      {selectedIncident?.createdAt 
                        ? format(new Date(parseInt(selectedIncident.createdAt)), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400">Data de Término</p>
                    <p className="text-emerald-700">
                      {selectedIncident?.serviceEndDate 
                        ? format(new Date(parseInt(selectedIncident.serviceEndDate)), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </p>
                  </div>
                  {selectedIncident?.serviceOrderLink && (
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <p className="text-gray-400">Doc. Técnico</p>
                      <a href={selectedIncident.serviceOrderLink.startsWith('http') ? selectedIncident.serviceOrderLink : `https://${selectedIncident.serviceOrderLink}`} 
                         target="_blank" rel="noopener noreferrer" 
                         className="text-indigo-600 hover:underline flex items-center gap-1">
                        <ExternalLink size={10} /> Ver Documento
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Activity size={12} />
                Abertura: {selectedIncident?.createdAt
                  ? format(new Date(parseInt(selectedIncident.createdAt)), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                  : '-'}
              </div>
              <Button variant="ghost" size="sm" onClick={() => selectedIncident && handlePrint(selectedIncident)}
                className="w-full sm:w-auto h-8 text-[10px] gap-2 hover:bg-[#382b22] hover:text-white transition-all">
                <Printer size={12} /> Gerar PDF da OS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[700px] p-0 border-0 overflow-y-auto rounded-[16px] gap-0 max-h-[95vh] custom-scrollbar">
          <IncidentForm
            initialData={selectedIncident}
            onSuccess={() => setIsEditOpen(false)}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="w-[90vw] sm:max-w-[400px] border-0 rounded-[16px] text-center p-6 sm:p-8">
          <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
            <Trash2 size={32} />
          </div>
          <DialogTitle className="text-xl font-bold mb-2">Excluir Ordem?</DialogTitle>
          <DialogDescription className="text-base text-gray-600 mb-8">
            Deseja mesmo excluir a ocorrência da máquina <strong>{selectedIncident ? getMachineName(selectedIncident) : ''}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
          <DialogFooter className="flex justify-center gap-3 sm:justify-center">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="px-6 rounded-[8px]">Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} className="px-6 rounded-[8px]">Sim, Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[450px] border-0 rounded-[16px] p-6 sm:p-8 max-h-[95vh] overflow-y-auto custom-scrollbar">
          <DialogTitle className="text-xl font-bold mb-4">Concluir Ordem de Serviço</DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Data de Término</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg p-2 mt-1"
                value={completeForm.serviceEndDate} onChange={e => setCompleteForm({...completeForm, serviceEndDate: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Serviço Realizado</label>
              <textarea className="w-full border border-gray-200 rounded-lg p-2 mt-1" rows={3}
                value={completeForm.servicePerformed} onChange={e => setCompleteForm({...completeForm, servicePerformed: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Link da OS (Opcional)</label>
              <input type="text" className="w-full border border-gray-200 rounded-lg p-2 mt-1"
                value={completeForm.serviceOrderLink} onChange={e => setCompleteForm({...completeForm, serviceOrderLink: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsCompleteOpen(false)}>Cancelar</Button>
            <Button onClick={confirmComplete} className="bg-emerald-600 hover:bg-emerald-700">Confirmar Conclusão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-4 print:hidden">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Visão Geral</h2>
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-400">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Sincronizando...' : 'Live Sync On'}
        </div>
      </div>

      {incidents.length > 0 && <IncidentAnalytics incidents={incidents} />}

      {machineFilter && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-[12px] mb-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FilterX size={16} />
            Filtro Global ativado para a máquina: <strong>{machineFilter}</strong>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setMachineFilter(null)}
            className="h-7 text-xs font-bold text-orange-600 hover:bg-orange-100 uppercase tracking-widest">
            Remover Filtro
          </Button>
        </div>
      )}

      <KpiCards
        openCount={openCount}
        criticalCount={criticalCount}
        mediumCount={mediumCount}
        totalCount={totalCount}
        statusFilter={statusFilter}
        severityFilter={severityFilter}
        onStatusFilterChange={onStatusFilterChange}
        onSeverityFilterChange={onSeverityFilterChange}
        onClearFilters={onClearFilters}
      />

      <div className="w-full flex-1 overflow-auto bg-white rounded-[12px] shadow-sm border border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-gray-900">Resultados da Busca</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {finalIncidents.length}
            </span>
          </div>
          <Button onClick={handleExportCSV} variant="outline" size="sm"
            className="h-8 text-xs font-bold gap-2 text-gray-700 bg-white shadow-sm border-gray-200">
            <Download size={12} /> Exportar CSV
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-100 bg-gray-50/50">
              <TableHead className="py-3 px-4 h-auto w-[25%] md:w-[20%]">
                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Equipamento</span>
              </TableHead>
              <TableHead className="py-3 px-4 h-auto min-w-[150px]">
                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Tipo & Severidade</span>
              </TableHead>
              <TableHead className="py-3 px-4 h-auto w-[20%]">
                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Motivo</span>
              </TableHead>
              <TableHead onClick={() => handleSort('status')} className="cursor-pointer group py-3 px-4 h-auto">
                <div className={`flex items-center text-[11px] uppercase tracking-wider transition-colors ${sortConfig?.key === 'status' ? 'text-[#382b22] font-black' : 'font-bold text-gray-800 group-hover:text-black'}`}>
                  Status <ArrowUpDown className={`ml-1 h-3 w-3 ${sortConfig?.key === 'status' ? 'opacity-100' : 'opacity-40'}`} />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer group py-3 px-4 h-auto">
                <div className={`flex items-center text-[11px] uppercase tracking-wider transition-colors ${sortConfig?.key === 'createdAt' ? 'text-[#382b22] font-black' : 'font-bold text-gray-800 group-hover:text-black'}`}>
                  Data <ArrowUpDown className={`ml-1 h-3 w-3 ${sortConfig?.key === 'createdAt' ? 'opacity-100' : 'opacity-40'}`} />
                </div>
              </TableHead>
              <TableHead className="py-3 px-4 h-auto">
                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Departamento</span>
              </TableHead>
              <TableHead className="py-3 px-4 h-auto text-center print:hidden">
                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && !data && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-400">Aguardando dados...</TableCell>
              </TableRow>
            )}

            {!loading && finalIncidents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-gray-400">
                  <LayoutDashboard className="mx-auto mb-3 opacity-20" size={48} />
                  <p className="text-base font-medium text-gray-500">Nenhuma ordem encontrada</p>
                  <p className="text-sm mt-1">Ajuste os filtros de busca no topo para visualizar resultados.</p>
                </TableCell>
              </TableRow>
            )}

            {finalIncidents.map(incident => (
              <TableRow
                key={incident.id}
                onClick={() => handleOpenDetails(incident)}
                className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer"
              >
                <TableCell className="px-4 py-3">
                  <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <span
                      className={`truncate max-w-[160px] cursor-pointer hover:underline ${machineFilter === getMachineName(incident) ? 'text-orange-600' : ''}`}
                      title={`${getMachineName(incident)} (${getMachineCode(incident)}) — Clique para filtrar`}
                      onClick={e => { e.stopPropagation(); setMachineFilter(machineFilter === getMachineName(incident) ? null : getMachineName(incident)); }}
                    >
                      {getMachineName(incident)}
                    </span>
                    {incident.isMachineStopped && (
                      <span title="Máquina Parada!" className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <AlertTriangle size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">{getMachineCode(incident)}</div>
                  <div className="text-[13px] text-gray-500 font-bold font-mono mt-0.5 tracking-tight" title={incident.id}>
                    <span className="text-[#382b22]">#</span>
                    <span className="opacity-80">{incident.id.slice(-6).toUpperCase()}</span>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div className="flex flex-row items-center gap-2 flex-nowrap">
                    <TypeBadge type={incident.type ?? (incident as any).typeOfOccurrence ?? ''} />
                    <SeverityBadge severity={incident.severity || 'Média'} />
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 max-w-[250px]">
                  <div className="text-sm text-gray-700 truncate" title={incident.reason}>{incident.reason}</div>
                </TableCell>

                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={incident.status} />
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div className="flex flex-col text-sm text-gray-600 gap-0.5 whitespace-nowrap">
                    <span className="font-medium text-gray-800">
                      {format(new Date(parseInt(incident.createdAt)), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    <span className="text-[11px] opacity-75">
                      {format(new Date(parseInt(incident.createdAt)), 'HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <span className="text-[12px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    {getDepartment(incident)}
                  </span>
                </TableCell>

                <TableCell className="px-4 py-3 print:hidden">
                  <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-end gap-1 w-[72px]">
                      {/* Botão Concluir OS — aparece apenas para OS em aberto */}
                      {!incident.serviceEndDate && incident.status !== 'Concluído' && (
                        <Button onClick={e => handleOpenComplete(incident, e)}
                          variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 rounded-md hover:bg-emerald-50" title="Concluir OS">
                          <CheckCircle2 size={14} />
                        </Button>
                      )}
                      {incident.status === 'Em Aberto' && (
                        <Button onClick={e => handleFastStatusUpdate(incident, 'Em Andamento', e)}
                          variant="ghost" size="icon" className="h-7 w-7 text-blue-500 rounded-md hover:bg-blue-50" title="Iniciar Atendimento">
                          <PlayCircle size={14} />
                        </Button>
                      )}
                      {incident.status === 'Em Andamento' && (
                        <Button onClick={e => handleFastStatusUpdate(incident, 'Em Aberto', e)}
                          variant="ghost" size="icon" className="h-7 w-7 text-orange-500 rounded-md hover:bg-orange-50" title="Voltar para Em Aberto">
                          <Undo2 size={14} />
                        </Button>
                      )}
                      {incident.status === 'Concluído' && (
                        <Button onClick={e => handleReopen(incident, e)}
                          variant="ghost" size="icon" className="h-7 w-7 text-orange-600 rounded-md hover:bg-orange-50" title="Reabrir (Voltar para Em Andamento)">
                          <Undo2 size={14} />
                        </Button>
                      )}
                      {/* Link externo — visível quando OS foi concluída com documento anexado */}
                      {incident.serviceOrderLink && (
                        <Button onClick={e => { e.stopPropagation(); window.open(incident.serviceOrderLink!.startsWith('http') ? incident.serviceOrderLink! : `https://${incident.serviceOrderLink}`, '_blank'); }}
                          variant="ghost" size="icon" className="h-7 w-7 text-indigo-600 rounded-md hover:bg-indigo-50" title="Abrir Documento">
                          <ExternalLink size={14} />
                        </Button>
                      )}
                    </div>

                    <div className="w-[1px] h-4 bg-gray-200 mx-2" />

                    <div className="flex items-center justify-start gap-1 w-[120px]">
                      <Button onClick={e => { e.stopPropagation(); handlePrint(incident); }}
                        variant="ghost" size="icon" className="h-7 w-7 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-900" title="Imprimir">
                        <Printer size={14} />
                      </Button>
                      <Button onClick={e => { e.stopPropagation(); handleOpenDetails(incident); }}
                        variant="ghost" size="icon" className="h-7 w-7 text-blue-600 rounded-md hover:bg-blue-50" title="Ver Detalhes">
                        <ExternalLink size={14} />
                      </Button>
                      <Button onClick={e => { e.stopPropagation(); handleOpenEdit(incident); }}
                        variant="ghost" size="icon" className="h-7 w-7 text-amber-600 rounded-md hover:bg-amber-50" title="Editar">
                        <Edit size={14} />
                      </Button>
                      <Button onClick={e => { e.stopPropagation(); handleOpenDelete(incident); }}
                        variant="ghost" size="icon" className="h-7 w-7 text-red-600 rounded-md hover:bg-red-50" title="Excluir">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>

    {/* Documento imprimível — visível apenas ao acionar window.print() */}
      <div className="hidden print:block print-container bg-white text-black">
        {selectedIncident && (
          <div className="p-10 max-w-4xl mx-auto h-full flex flex-col">
            <div className="border-b-4 border-[#382b22] pb-6 mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tight text-[#382b22]">Ordem de Serviço</h1>
                <div className="mt-2 flex items-center gap-3">
                  <span className="bg-[#382b22] text-white px-3 py-1 text-lg font-bold rounded-sm">
                    Nº {selectedIncident.id.slice(-8).toUpperCase()}
                  </span>
                  <p className="text-xs font-mono text-gray-400">ID COMPLETO: {selectedIncident.id}</p>
                </div>
              </div>
              <div className="flex gap-10">
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Data de Emissão</p>
                  <p className="text-sm font-bold">{format(new Date(parseInt(selectedIncident.createdAt)), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  <p className="text-xs text-gray-500">{format(new Date(parseInt(selectedIncident.createdAt)), "HH:mm'h'", { locale: ptBR })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#382b22] uppercase tracking-widest mb-1">Data de Programação</p>
                  <p className="text-sm font-bold">{format(new Date(parseInt(selectedIncident.createdAt) + 86400000), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  <p className="text-xs text-gray-500">PREVISÃO 24H</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10">
              <div className="border-l-4 border-gray-100 pl-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Equipamento / Máquina</p>
                <p className="text-xl font-black uppercase text-gray-900">{getMachineName(selectedIncident)}</p>
                {getMachineCode(selectedIncident) && (
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{getMachineCode(selectedIncident)}</p>
                )}
                {selectedIncident.isMachineStopped && (
                  <p className="text-xs font-bold text-red-600 uppercase mt-1 flex items-center">
                    <AlertTriangle size={12} className="mr-1" /> MÁQUINA PARADA!
                  </p>
                )}
              </div>
              <div className="border-l-4 border-gray-100 pl-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Departamento</p>
                <p className="text-lg font-bold uppercase">{getDepartment(selectedIncident)}</p>
              </div>
              <div className="border-l-4 border-gray-100 pl-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tipo de Manutenção</p>
                <p className="text-lg uppercase font-bold text-[#382b22]">{selectedIncident.type ?? (selectedIncident as any).typeOfOccurrence}</p>
              </div>
              <div className="border-l-4 border-gray-100 pl-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Severidade</p>
                <p className={`text-lg uppercase font-bold ${selectedIncident.severity.toLowerCase() === 'alta' ? 'text-red-600' : 'text-gray-900'}`}>
                  {selectedIncident.severity}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Motivo da Solicitação</p>
              <div className="border-2 border-gray-100 p-4 bg-gray-50/50 rounded-sm">
                <p className="text-lg font-medium">{selectedIncident.reason}</p>
              </div>
            </div>
            <div className="mb-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Descrição Detalhada do Serviço</p>
              <div className="border-2 border-gray-100 p-4 bg-gray-50/50 rounded-sm">
                <p className="text-sm whitespace-pre-wrap leading-tight text-gray-800">
                  {selectedIncident.description || 'Nenhuma descrição adicional informada.'}
                </p>
              </div>
            </div>
            <div className="mb-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Peças e Materiais Utilizados</p>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1 text-left w-1/2 uppercase">Descrição do Item</th>
                    <th className="border border-gray-300 p-1 text-center w-1/6 uppercase">Qtd</th>
                    <th className="border border-gray-300 p-1 text-center w-1/3 uppercase">Código/Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map(i => (
                    <tr key={i}>
                      <td className="border border-gray-300 h-6" />
                      <td className="border border-gray-300 h-6" />
                      <td className="border border-gray-300 h-6" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mb-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Parecer Técnico e Observações Finais</p>
              <div className="border border-gray-300 min-h-24 rounded-sm flex flex-col justify-between p-3 bg-gray-50/30">
                <div className="text-sm italic text-gray-800 leading-tight">
                  {selectedIncident.servicePerformed || (
                    <span className="text-gray-300 font-mono">__________________________________________________________________</span>
                  )}
                </div>
                <div className="flex justify-between text-[8px] text-gray-500 uppercase mt-4 font-bold tracking-wider">
                  <span>Início: {format(new Date(parseInt(selectedIncident.createdAt)), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  <span>Conclusão: {selectedIncident.serviceEndDate ? format(new Date(parseInt(selectedIncident.serviceEndDate)), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '___/___/___ ___:___'}</span>
                  <span>H. Totais: {selectedIncident.serviceEndDate ? `${Math.round((parseInt(selectedIncident.serviceEndDate) - parseInt(selectedIncident.createdAt)) / 3600000)}h` : '_______'}</span>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-4 grid grid-cols-3 gap-10 px-4">
              {['Solicitante', 'Técnico Executante', 'Gestor / Qualidade'].map(role => (
                <div key={role} className="text-center">
                  <div className="border-t border-gray-400 pt-1">
                    <p className="font-bold text-[9px] uppercase text-gray-500">{role}</p>
                    <p className="text-[8px] text-gray-300 mt-1">NOME E VISTO</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-gray-100 text-center text-[9px] text-gray-400 font-mono flex justify-between items-center">
              <span>MONITORO v1.0 - GESTÃO DE MANUTENÇÃO</span>
              <span className="uppercase font-bold">Status: {selectedIncident.status}</span>
              <span>PÁGINA 1 DE 1</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
