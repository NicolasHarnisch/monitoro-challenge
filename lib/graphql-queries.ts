import { gql } from '@apollo/client';

export const GET_LAST_INCIDENTS = gql`
  query GetLastIncidents($limit: Int) {
    lastIncidents(limit: $limit) {
      id
      machineName
      reason
      typeOfOccurrence
      isMachineStopped
      description
      severity
      status
      createdAt
    }
  }
`;

export const CREATE_INCIDENT = gql`
  mutation CreateIncident(
    $machineName: String!
    $reason: String!
    $typeOfOccurrence: String!
    $isMachineStopped: Boolean!
    $description: String!
    $severity: String!
  ) {
    createIncident(
      machineName: $machineName
      reason: $reason
      typeOfOccurrence: $typeOfOccurrence
      isMachineStopped: $isMachineStopped
      description: $description
      severity: $severity
    ) {
      id
      status
      createdAt
    }
  }
`;

export const UPDATE_INCIDENT = gql`
  mutation UpdateIncident(
    $id: ID!
    $machineName: String
    $reason: String
    $typeOfOccurrence: String
    $isMachineStopped: Boolean
    $description: String
    $severity: String
    $status: String
  ) {
    updateIncident(
      id: $id
      machineName: $machineName
      reason: $reason
      typeOfOccurrence: $typeOfOccurrence
      isMachineStopped: $isMachineStopped
      description: $description
      severity: $severity
      status: $status
    ) {
      id
      status
    }
  }
`;

// Mutation separada para atualização rápida de status — usada nas ações da tabela
export const UPDATE_STATUS = gql`
  mutation UpdateStatus($id: ID!, $status: String!) {
    updateIncident(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const DELETE_INCIDENT = gql`
  mutation DeleteIncident($id: ID!) {
    deleteIncident(id: $id)
  }
`;
