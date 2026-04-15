import { prisma } from '@/lib/prisma';

export const resolvers = {
  Query: {
    lastIncidents: async (_: unknown, { limit = 5 }: { limit?: number }) => {
      const incidents = await prisma.incident.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return incidents.map((incident) => ({
        ...incident,
        createdAt: incident.createdAt.getTime().toString(),
      }));
    },
  },

  Mutation: {
    createIncident: async (
      _: unknown,
      {
        description,
        machineName,
        severity,
        typeOfOccurrence,
      }: {
        description: string;
        machineName: string;
        severity: string;
        typeOfOccurrence: string;
      }
    ) => {
      const incident = await prisma.incident.create({
        data: {
          description,
          machineName,
          severity,
          typeOfOccurrence,
          status: 'Em Aberto',
        },
      });

      return {
        ...incident,
        createdAt: incident.createdAt.getTime().toString(),
      };
    },
  },
};
