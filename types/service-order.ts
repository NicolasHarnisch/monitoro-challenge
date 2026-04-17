/**
 * Tipos TypeScript para Ordens de Serviço e Máquinas.
 *
 * Adaptado de:
 *   exemplos-para-desafio-ERP/BACKEND/service-order/dto/create-service-order.input.ts
 *   exemplos-para-desafio-ERP/BACKEND/service-order/dto/complete-service-order.input.ts
 *
 * Os decorators NestJS (@InputType, @Field, @IsNotEmpty) foram removidos pois
 * a validação aqui é feita via Zod + React Hook Form no frontend.
 */

// ──────────────────────────────────────────────────────────────────────────────
// MÁQUINA
// Corresponde ao modelo Machine do schema.prisma.
// ──────────────────────────────────────────────────────────────────────────────

/** Representa um equipamento cadastrado no sistema. */
export interface Machine {
  id: string;
  code: string;
  name: string;
  department: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// ORDEM DE SERVIÇO
// Corresponde ao modelo ServiceOrder do schema.prisma.
// ──────────────────────────────────────────────────────────────────────────────

/** Representa uma Ordem de Serviço retornada pela API GraphQL. */
export interface ServiceOrder {
  id: string;
  machine: Machine;
  reason: string;
  /** Tipo de manutenção: Preventiva | Corretiva | Planejada */
  type: string;
  isMachineStopped: boolean;
  description: string;
  /** Descrição do que foi realizado — preenchida ao concluir a OS. */
  servicePerformed?: string;
  severity: string;
  status: string;
  /** Timestamp Unix em string, convertido com parseInt() quando necessário. */
  createdAt: string;
  /** Data de fechamento da OS — presença indica OS concluída. */
  serviceEndDate?: string;
  /** Link para o documento técnico impresso e assinado. */
  serviceOrderLink?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// INPUTS — espelham os DTOs do projeto de referência
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Dados obrigatórios para abrir uma nova OS.
 * Equivalente a CreateServiceOrderInput do projeto de referência.
 */
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
 * Equivalente a CompleteServiceOrderInput do projeto de referência.
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
