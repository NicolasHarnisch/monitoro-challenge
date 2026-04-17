/**
 * conecta queries e mutations ao banco via Prisma.
 */

import { prisma } from '@/lib/prisma';

/** Converte uma Date do Prisma para timestamp Unix em string (padrão da API). */
const toTimestamp = (date: Date): string => date.getTime().toString();

export const resolvers = {

  // ─── QUERIES ──────────────────────────────────────────────────────────────
  Query: {
    serviceOrders: async (_: unknown, { limit }: { limit?: number }) => {
      const orders = await prisma.serviceOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit ?? undefined,
        include: { machine: true },
      });

      return orders.map(order => ({
        ...order,
        createdAt:       toTimestamp(order.createdAt),
        serviceEndDate:  order.serviceEndDate  ? toTimestamp(order.serviceEndDate)  : null,
      }));
    },

    machines: async () => {
      return prisma.machine.findMany({ orderBy: { name: 'asc' } });
    },
  },

  // ─── MUTATIONS ────────────────────────────────────────────────────────────

  Mutation: {
    createServiceOrder: async (
      _: unknown,
      args: {
        machineId: string;
        reason: string;
        type: string;
        isMachineStopped: boolean;
        description: string;
        severity: string;
      }
    ) => {
      const order = await prisma.serviceOrder.create({
        data: {
          machine:         { connect: { id: args.machineId } },
          reason:          args.reason,
          type:            args.type,
          isMachineStopped: args.isMachineStopped,
          description:     args.description,
          severity:        args.severity,
          status:          'Em Aberto',
        },
        include: { machine: true },
      });

      return { ...order, createdAt: toTimestamp(order.createdAt), serviceEndDate: null };
    },

    updateServiceOrder: async (
      _: unknown,
      { id, ...updates }: {
        id: string;
        reason?: string;
        type?: string;
        isMachineStopped?: boolean;
        description?: string;
        severity?: string;
        status?: string;
        serviceEndDate?: string | null;
        servicePerformed?: string | null;
        serviceOrderLink?: string | null;
      }
    ) => {
      const data: any = { ...updates };
      if (updates.serviceEndDate !== undefined) {
        data.serviceEndDate = updates.serviceEndDate ? new Date(updates.serviceEndDate) : null;
      }

      const order = await prisma.serviceOrder.update({
        where: { id },
        data,
        include: { machine: true },
      });

      return {
        ...order,
        createdAt:      toTimestamp(order.createdAt),
        serviceEndDate: order.serviceEndDate ? toTimestamp(order.serviceEndDate) : null,
      };
    },

    completeServiceOrder: async (
      _: unknown,
      args: {
        id: string;
        serviceEndDate: string;
        servicePerformed?: string;
        serviceOrderLink?: string;
      }
    ) => {
      const order = await prisma.serviceOrder.update({
        where: { id: args.id },
        data: {
          status:          'Concluído',
          serviceEndDate:  new Date(args.serviceEndDate),
          servicePerformed: args.servicePerformed ?? undefined,
          serviceOrderLink: args.serviceOrderLink ?? undefined,
        },
        include: { machine: true },
      });

      return {
        ...order,
        createdAt:      toTimestamp(order.createdAt),
        serviceEndDate: order.serviceEndDate ? toTimestamp(order.serviceEndDate) : null,
      };
    },

    deleteServiceOrder: async (_: unknown, { id }: { id: string }) => {
      try {
        await prisma.serviceOrder.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
  },
};
