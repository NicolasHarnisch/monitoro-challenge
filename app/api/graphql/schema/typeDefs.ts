export const typeDefs = `#graphql
  type Incident {
    id:               ID!
    machineName:      String!
    reason:           String!
    typeOfOccurrence: String!
    isMachineStopped: Boolean!
    description:      String!
    severity:         String!
    status:           String!
    createdAt:        String!
  }

  type Query {
    lastIncidents(limit: Int): [Incident!]!
  }

  type Mutation {
    createIncident(
      machineName:      String!
      reason:           String!
      typeOfOccurrence: String!
      isMachineStopped: Boolean!
      description:      String!
      severity:         String!
    ): Incident!

    updateIncident(
      id:               ID!
      machineName:      String
      reason:           String
      typeOfOccurrence: String
      isMachineStopped: Boolean
      description:      String
      severity:         String
      status:           String
    ): Incident!

    deleteIncident(id: ID!): Boolean!
  }
`;
