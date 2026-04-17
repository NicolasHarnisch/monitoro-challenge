import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const machineNames = [
  "Maromba 12",
  "Esteira 5",
  "Enchedeira Case 721",
  "Escavadeira 1550M",
  "Corrente de rebarba (21)",
  "Volvo L60",
  "Gerador Caterpillar",
  "Prensa Hidráulica 04",
  "Caminhão Munck",
  "Empilhadeira Toyota",
];

const departments = ["Produção", "Logística", "Manutenção", "Expedição"];

const reasons = [
  "Vazamento de óleo no cárter",
  "Superaquecimento do motor",
  "Ruído estranho na transmissão",
  "Correia transportadora frouxa",
  "Falha no sistema hidráulico",
  "Fumaça excessiva no escapamento",
  "Painel de controle sem resposta",
  "Vibração excessiva na base",
  "Troca de filtro de ar",
  "Lubrificação periódica",
  "Desgaste excessivo dos pneus",
  "Farol quebrado",
  "Bateria descarregada",
  "Válvula de pressão travada",
];

const types = ["Preventiva", "Corretiva", "Planejada"];
const severities = ["Crítica", "Alta", "Média", "Baixa"];
const statuses = ["Concluído", "Em Aberto"];

async function main() {
  console.log('Iniciando o seeding de dados...');

  // Limpar dados existentes
  await prisma.serviceOrder.deleteMany();
  await prisma.machine.deleteMany();

  console.log('Criando máquinas...');
  const createdMachines = [];
  for (let i = 0; i < machineNames.length; i++) {
    const machine = await prisma.machine.create({
      data: {
        code: `MAC-${(i + 1).toString().padStart(3, '0')}`,
        name: machineNames[i],
        department: departments[Math.floor(Math.random() * departments.length)],
      },
    });
    createdMachines.push(machine);
  }

  console.log('Criando ordens de serviço...');
  const now = new Date();
  
  for (let i = 0; i < 40; i++) {
    const machine = createdMachines[Math.floor(Math.random() * createdMachines.length)];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isMachineStopped = Math.random() > 0.7;

    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - daysAgo);

    await prisma.serviceOrder.create({
      data: {
        machineId: machine.id,
        reason,
        type,
        isMachineStopped,
        description: `Ocorrência gerada automaticamente para o cenário de teste. Detalhes técnicos simulados para a máquina ${machine.name} referente ao problema de ${reason}.`,
        severity,
        status,
        createdAt,
        servicePerformed: status === "Concluído" ? "Manutenção realizada conforme manual técnico." : null,
        serviceEndDate: status === "Concluído" ? new Date() : null,
      },
    });
  }

  console.log('Seeding finalizado com sucesso! Criadas 10 máquinas e 40 ordens de serviço.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
