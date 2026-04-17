/**
 * Script de seed do banco de dados.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados antigos (serviceOrders antes de machines por causa de FK)
  await prisma.serviceOrder.deleteMany()
  await prisma.machine.deleteMany()
  console.log('🗑️  Dados antigos removidos.')

  // MÁQUINAS
  const machineData = [
    { code: 'MAQ-001', name: 'Corrente de Rebarba 21', department: 'Produção' },
    { code: 'MAQ-002', name: 'Maromba 12', department: 'Produção' },
    { code: 'MAQ-003', name: 'Enchedeira Volvo L60', department: 'Logística' },
    { code: 'MAQ-004', name: 'Gerador G1', department: 'Utilidades' },
    { code: 'MAQ-005', name: 'Enchedeira Case 721', department: 'Logística' },
    { code: 'MAQ-006', name: 'Esteira 5', department: 'Produção' },
    { code: 'MAQ-007', name: 'Caminhão Volvo VM-330/2', department: 'Logística' },
  ]

  const machines = []
  for (const m of machineData) {
    const machine = await prisma.machine.create({ data: m })
    machines.push(machine)
    console.log(`  ✔ Máquina criada: ${machine.name} [${machine.code}]`)
  }

  // ORDENS DE SERVIÇO
  const reasons = [
    'Temperatura elevada do motor',
    'Vazamento de óleo hidráulico',
    'Troca de filtros periódica',
    'Ruído excessivo na correia',
    'Painel de controle com falha',
    'Manutenção de rotina',
    'Correia solta ou desgastada',
    'Sensor de pressão inoperante',
  ]

  const ordersToCreate = [];

  for (let i = 0; i < 60; i++) {
    const randomMachine = machines[Math.floor(Math.random() * machines.length)];
    const daysAgo = Math.floor(Math.random() * 120);

    // Status e tempo
    const statusRand = Math.random();
    let status = 'Concluído';
    if (daysAgo < 5) {
      if (statusRand > 0.5) status = 'Em Aberto';
      else if (statusRand > 0.2) status = 'Em Andamento';
    } else if (daysAgo < 15) {
      if (statusRand > 0.8) status = 'Em Andamento';
    }

    // Tipo de serviço e severidade
    const typeRand = Math.random();
    let type = 'Corretiva';
    let severity = 'Média';

    if (typeRand > 0.6) {
      type = 'Preventiva';
      severity = 'Baixa';
    } else if (typeRand > 0.4) {
      type = 'Planejada';
      severity = 'Média';
    } else {
      severity = Math.random() > 0.5 ? 'Alta' : 'Média';
    }

    ordersToCreate.push({
      machine: randomMachine,
      type,
      severity,
      status,
      isMachineStopped: type === 'Corretiva' && severity === 'Alta',
      daysAgo
    });
  }

  let count = 0
  for (const o of ordersToCreate) {
    const reason = reasons[Math.floor(Math.random() * reasons.length)]
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - o.daysAgo)
    // Variar as horas também
    createdAt.setHours(Math.floor(Math.random() * 8) + 8) // 8h às 16h
    createdAt.setMinutes(Math.floor(Math.random() * 60))

    const serviceEndDate = o.status === 'Concluído'
      ? new Date(createdAt.getTime() + (Math.floor(Math.random() * 4) + 1) * 60 * 60 * 1000) // de 1 a 4 horas depois
      : null

    await prisma.serviceOrder.create({
      data: {
        machine: { connect: { id: o.machine.id } },
        reason,
        type: o.type,
        isMachineStopped: o.isMachineStopped,
        description: `${reason} — verificação e correção necessária. Prioridade ${o.severity.toLowerCase()}.`,
        servicePerformed: o.status === 'Concluído' ? 'Serviço executado e equipamento liberado para operação após testes mecânicos e elétricos.' : null,
        severity: o.severity,
        status: o.status,
        createdAt,
        serviceEndDate,
      }
    })
    count++
  }

  console.log(`\n✅ Seed finalizado! ${machines.length} máquinas e ${count} ordens de serviço criadas.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })