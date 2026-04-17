/**
 * conecta queries e mutations ao banco via Prisma.
 */

import { prisma } from '@/lib/prisma';

/** Converte uma Date do Prisma para timestamp Unix em string (padrão da API). */
const toTimestamp = (date: Date): string => date.getTime().toString();

/** Busca máquina pelo nome ou cria se não existir. */
async function getOrCreateMachine(name: string) {
  // Limpa o nome caso venha no formato "Nome (Código)"
  const cleanName = name.split(' (')[0].trim();

  let machine = await prisma.machine.findFirst({
    where: { 
      OR: [
        { name: cleanName },
        { name: name.trim() }
      ]
    }
  });

  if (!machine) {
    // Gera um código curto aleatório para a nova máquina
    const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
    machine = await prisma.machine.create({
      data: {
        name: cleanName,
        code: `MAQ-${shortId}`,
        department: 'Geral', // Valor padrão para máquinas novas
      }
    });
  }
  return machine;
}

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
        machineName: string;
        reason: string;
        type: string;
        isMachineStopped: boolean;
        description: string;
        severity: string;
      }
    ) => {
      const machine = await getOrCreateMachine(args.machineName);

      const order = await prisma.serviceOrder.create({
        data: {
          machine:         { connect: { id: machine.id } },
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
      { id, machineName, ...updates }: {
        id: string;
        machineName?: string;
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
      const data: Record<string, unknown> = { ...updates };
      
      if (machineName) {
        const machine = await getOrCreateMachine(machineName);
        data.machine = { connect: { id: machine.id } };
      }

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
