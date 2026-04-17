/** Resolvers GraphQL: conectam as queries/mutations ao banco via Prisma */

import { prisma } from '@/lib/prisma';

export const resolvers = {
  Query: {
    lastIncidents: async (_: unknown, { limit = 5 }: { limit?: number }) => {
      const incidents = await prisma.incident.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      // createdAt é convertido para timestamp string pois o GraphQL não tem tipo Date nativo
      return incidents.map(incident => ({
        ...incident,
        createdAt: incident.createdAt.getTime().toString(),
      }));
    },
  },

  Mutation: {
    createIncident: async (
      _: unknown,
      args: {
        machineName: string;
        reason: string;
        typeOfOccurrence: string;
        isMachineStopped: boolean;
        description: string;
        severity: string;
      }
    ) => {
      const incident = await prisma.incident.create({
        data: { ...args, status: 'Em Aberto' },
      });

      return { ...incident, createdAt: incident.createdAt.getTime().toString() };
    },

    updateIncident: async (
      _: unknown,
      { id, ...updates }: {
        id: string;
        machineName?: string;
        reason?: string;
        typeOfOccurrence?: string;
        isMachineStopped?: boolean;
        description?: string;
        severity?: string;
        status?: string;
      }
    ) => {
      const incident = await prisma.incident.update({ where: { id }, data: updates });
      return { ...incident, createdAt: incident.createdAt.getTime().toString() };
    },

    deleteIncident: async (_: unknown, { id }: { id: string }) => {
      try {
        await prisma.incident.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
  },
};
