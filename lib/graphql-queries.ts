/**
 * Queries e Mutations GraphQL centralizadas.
 *
 * Estruturadas a partir das mesmas operações definidas nos resolvers do projeto de referência:
 *   exemplos-para-desafio-ERP/BACKEND/service-order/service-order.resolver.ts
 *
 * Equivalências:
 *   GET_SERVICE_ORDERS   → @Query(() => [ServiceOrder])  serviceOrders()
 *   GET_MACHINES         → @Query(() => [Machine])        machines()
 *   CREATE_SERVICE_ORDER → @Mutation createServiceOrder()
 *   UPDATE_SERVICE_ORDER → @Mutation updateServiceOrder()
 *   COMPLETE_SERVICE_ORDER → @Mutation completeServiceOrder() (CompleteServiceOrderInput)
 *   DELETE_SERVICE_ORDER → @Mutation deleteServiceOrder()
 */

import { gql } from '@apollo/client';

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export const GET_SERVICE_ORDERS = gql`
  query GetServiceOrders($limit: Int) {
    serviceOrders(limit: $limit) {
      id
      machine {
        id
        code
        name
        department
      }
      reason
      type
      isMachineStopped
      description
      servicePerformed
      severity
      status
      createdAt
      serviceEndDate
      serviceOrderLink
    }
  }
`;

export const GET_MACHINES = gql`
  query GetMachines {
    machines {
      id
      code
      name
      department
    }
  }
`;

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

/** Abre uma nova OS — equivalente a createServiceOrder no resolver de referência. */
export const CREATE_SERVICE_ORDER = gql`
  mutation CreateServiceOrder(
    $machineId:        String!
    $reason:           String!
    $type:             String!
    $isMachineStopped: Boolean!
    $description:      String!
    $severity:         String!
  ) {
    createServiceOrder(
      machineId:        $machineId
      reason:           $reason
      type:             $type
      isMachineStopped: $isMachineStopped
      description:      $description
      severity:         $severity
    ) {
      id
      status
      createdAt
      machine { id name code department }
    }
  }
`;

/** Edição geral dos campos de uma OS. */
export const UPDATE_SERVICE_ORDER = gql`
  mutation UpdateServiceOrder(
    $id:               ID!
    $reason:           String
    $type:             String
    $isMachineStopped: Boolean
    $description:      String
    $severity:         String
    $status:           String
  ) {
    updateServiceOrder(
      id:               $id
      reason:           $reason
      type:             $type
      isMachineStopped: $isMachineStopped
      description:      $description
      severity:         $severity
      status:           $status
    ) {
      id
      status
    }
  }
`;

/**
 * Mutation para atualização rápida de status — usada nas ações rápidas da tabela.
 * Mantém compatibilidade com o padrão de updateServiceOrder do projeto de referência.
 */
export const UPDATE_STATUS = gql`
  mutation UpdateStatus($id: ID!, $status: String!) {
    updateServiceOrder(id: $id, status: $status) {
      id
      status
    }
  }
`;

/**
 * Fecha uma OS como Concluída.
 * Equivalente a CompleteServiceOrderInput do projeto de referência —
 * registra data de fim, parecer técnico e link do documento.
 */
export const COMPLETE_SERVICE_ORDER = gql`
  mutation CompleteServiceOrder(
    $id:               ID!
    $serviceEndDate:   String!
    $servicePerformed: String
    $serviceOrderLink: String
  ) {
    completeServiceOrder(
      id:               $id
      serviceEndDate:   $serviceEndDate
      servicePerformed: $servicePerformed
      serviceOrderLink: $serviceOrderLink
    ) {
      id
      status
      serviceEndDate
      servicePerformed
      serviceOrderLink
    }
  }
`;

export const DELETE_SERVICE_ORDER = gql`
  mutation DeleteServiceOrder($id: ID!) {
    deleteServiceOrder(id: $id)
  }
`;

// ─── ALIASES DE RETROCOMPATIBILIDADE ─────────────────────────────────────────
// Mantidos para não quebrar referências legadas durante a migração.
export const GET_LAST_INCIDENTS   = GET_SERVICE_ORDERS;
export const CREATE_INCIDENT      = CREATE_SERVICE_ORDER;
export const UPDATE_INCIDENT      = UPDATE_SERVICE_ORDER;
export const DELETE_INCIDENT      = DELETE_SERVICE_ORDER;
