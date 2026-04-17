/**
 * Schema GraphQL (SDL).
 */

export const typeDefs = `#graphql

  # ─── MÁQUINA ───────────────────────────────────────────────────────────────
  # Equivale ao modelo Machine e à entidade Machine do projeto de referência.

  type Machine {
    id:         ID!
    code:       String!
    name:       String!
    department: String!
  }

  # ─── ORDEM DE SERVIÇO ───────────────────────────────────────────────────────
  # Equivale ao modelo ServiceOrder e à entidade ServiceOrder do projeto de referência.

  type ServiceOrder {
    id:               ID!
    machine:          Machine!
    reason:           String!
    type:             String!
    isMachineStopped: Boolean!
    description:      String!
    servicePerformed: String
    severity:         String!
    status:           String!
    createdAt:        String!
    serviceEndDate:   String
    serviceOrderLink: String
  }

  # ─── QUERIES ─────────────────────────────────────────────────────────────────
  # Baseadas nos @Query do ServiceOrderResolver e MachineResolver do projeto de referência.

  type Query {
    # Retorna todas as ordens de serviço (equivalente a serviceOrders no resolver de referência).
    serviceOrders(limit: Int): [ServiceOrder!]!

    # Retorna todas as máquinas disponíveis para seleção no formulário.
    machines: [Machine!]!
  }

  # ─── MUTATIONS ───────────────────────────────────────────────────────────────
  # Baseadas nos @Mutation do ServiceOrderResolver do projeto de referência.

  type Mutation {
    # Abre uma nova Ordem de Serviço — equivalente a createServiceOrder.
    createServiceOrder(
      machineId:        String!
      reason:           String!
      type:             String!
      isMachineStopped: Boolean!
      description:      String!
      severity:         String!
    ): ServiceOrder!

    # Atualiza os dados de uma OS (edição inline na tabela).
    updateServiceOrder(
      id:               ID!
      reason:           String
      type:             String
      isMachineStopped: Boolean
      description:      String
      severity:         String
      status:           String
      serviceEndDate:   String
      servicePerformed: String
      serviceOrderLink: String
    ): ServiceOrder!

    # Fecha uma OS como Concluída — equivalente a completeServiceOrder do projeto de referência.
    # Registra a data de encerramento, o parecer técnico e o link do documento.
    completeServiceOrder(
      id:               ID!
      serviceEndDate:   String!
      servicePerformed: String
      serviceOrderLink: String
    ): ServiceOrder!

    deleteServiceOrder(id: ID!): Boolean!
  }
`;
