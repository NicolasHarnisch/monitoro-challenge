import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const machines = [
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
const severities = ["Alta", "Média", "Baixa"];
const statuses = ["Concluído", "Em Aberto", "Em Andamento"];

async function main() {
  console.log('Iniciando o seeding de dados...');

  // Limpar dados existentes para começar do zero no cenário de teste
  await prisma.incident.deleteMany();

  const now = new Date();
  
  for (let i = 0; i < 40; i++) {
    const machineName = machines[Math.floor(Math.random() * machines.length)];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const typeOfOccurrence = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isMachineStopped = Math.random() > 0.7; // 30% chance of machine stopped

    // Random date within the last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - daysAgo);

    await prisma.incident.create({
      data: {
        machineName,
        reason,
        typeOfOccurrence,
        isMachineStopped,
        description: `Ocorrência gerada automaticamente para o cenário de teste. Detalhes técnicos simulados para a máquina ${machineName} referente ao problema de ${reason}.`,
        severity,
        status,
        createdAt,
      },
    });
  }

  console.log('Seeding finalizado com sucesso! Foram criadas 40 ordens de serviço.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
