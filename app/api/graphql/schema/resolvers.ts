/**
 * Resolvers GraphQL — conectam queries e mutations ao banco via Prisma.
 *
 * A lógica aqui foi portada do projeto de referência:
 *   exemplos-para-desafio-ERP/BACKEND/service-order/service-order.service.ts
 *   exemplos-para-desafio-ERP/BACKEND/machine/machine.service.ts
 *
 * No projeto de referência (NestJS), cada método existe como um @Injectable Service
 * injetado no Resolver via DI. Aqui, consolidamos tudo neste arquivo pois o
 * Next.js não usa o padrão de módulos do NestJS.
 */

import { prisma } from '@/lib/prisma';

/** Converte uma Date do Prisma para timestamp Unix em string (padrão da API). */
const toTimestamp = (date: Date): string => date.getTime().toString();

export const resolvers = {
  // ─── QUERIES ──────────────────────────────────────────────────────────────
  // Baseadas nos @Query do ServiceOrderResolver e MachineService do projeto de referência.

  Query: {
    /**
     * Busca todas as ordens de serviço, incluindo a máquina relacionada.
     * Equivalente a serviceOrders() do ServiceOrderResolver de referência.
     */
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

    /**
     * Busca todas as máquinas para popular o formulário de criação de OS.
     * Equivalente a findAll() do MachineService de referência.
     */
    machines: async () => {
      return prisma.machine.findMany({ orderBy: { name: 'asc' } });
    },
  },

  // ─── MUTATIONS ────────────────────────────────────────────────────────────
  // Baseadas nos @Mutation do ServiceOrderResolver e na lógica do service de referência.

  Mutation: {
    /**
     * Abre uma nova Ordem de Serviço vinculada a uma Máquina.
     * Equivalente a create() do ServiceOrderService de referência, que usa
     * machine: { connect: { id: input.machineId } }.
     */
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

    /**
     * Edição geral dos campos de uma OS.
     * Equivalente a update() do ServiceOrderService de referência.
     */
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
      // Se houver serviceEndDate como string, convertemos para Date. 
      // Se for nulo, passamos nulo para o Prisma.
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

    /**
     * Fecha uma OS como "Concluída".
     * Equivalente a CompleteServiceOrderInput do projeto de referência —
     * registra data de fim, parecer técnico e link do documento.
     */
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

    /** Remove uma OS pelo ID. */
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
