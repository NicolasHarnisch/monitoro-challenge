export const typeDefs = `#graphql
  type Incident {
    id: ID!
    description: String!
    machineName: String!
    severity: String!
    status: String!
    typeOfOccurrence: String!
    createdAt: String!
  }

  type Query {
    lastIncidents(limit: Int): [Incident!]!
  }

  type Mutation {
    createIncident(
      description: String!
      machineName: String!
      severity: String!
      typeOfOccurrence: String!
    ): Incident!
  }
`;
