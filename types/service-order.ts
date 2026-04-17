/**
 * Tipos TypeScript para Ordens de Serviço e Máquinas.
 */

// MÁQUINA

export interface Machine {
  id: string;
  code: string;
  name: string;
  department: string;
}

// ORDEM DE SERVIÇO
export interface ServiceOrder {
  id: string;
  machine: Machine;
  reason: string;
  type: string;
  isMachineStopped: boolean;
  description: string;
  servicePerformed?: string;
  severity: string;
  status: string;
  createdAt: string;
  serviceEndDate?: string;
  serviceOrderLink?: string;
}

// INPUTS — espelham os DTOs do projeto de referência
export interface CreateServiceOrderInput {
  machineId: string;
  reason: string;
  /** Preventiva | Corretiva | Planejada */
  type: string;
  isMachineStopped: boolean;
  description: string;
  severity: string;
}

/**
 * Dados para fechar uma OS (marcar como Concluída).
 */
export interface CompleteServiceOrderInput {
  id: string;
  serviceEndDate: string;
  servicePerformed?: string;
  serviceOrderLink?: string;
}

/** Configuração de ordenação de colunas da tabela. */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}
