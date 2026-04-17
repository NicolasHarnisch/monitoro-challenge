/**
 * Queries e Mutations GraphQL centralizadas.
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

export const UPDATE_STATUS = gql`
  mutation UpdateStatus($id: ID!, $status: String!) {
    updateServiceOrder(id: $id, status: $status) {
      id
      status
    }
  }
`;

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
export const GET_LAST_INCIDENTS   = GET_SERVICE_ORDERS;
export const CREATE_INCIDENT      = CREATE_SERVICE_ORDER;
export const UPDATE_INCIDENT      = UPDATE_SERVICE_ORDER;
export const DELETE_INCIDENT      = DELETE_SERVICE_ORDER;
