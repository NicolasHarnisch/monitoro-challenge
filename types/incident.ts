/**
 * Tipos TypeScript compartilhados em todo o projeto.
 */

// Representa uma Ordem de Serviço retornada pela API GraphQL.
// createdAt é um timestamp Unix em string — convertemos com parseInt() quando necessário.
export interface Incident {
  id: string;
  machineName: string;
  reason: string;
  typeOfOccurrence: string;
  isMachineStopped: boolean;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}
