const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando o seed do banco de dados...')

  // Limpar os incidentes existentes (opcional, pode descomentar se quiser limpar tudo)
  // await prisma.incident.deleteMany()

  const machines = [
    'Corrente de rebarba (21)',
    'Maromba 12',
    'Enchedeira Volvo L60',
    'Gerador G1',
    'Enchedeira Case 721',
    'Esteira 5',
    'Caminhão Volvo VM-330/2'
  ]

  const reasons = [
    'Temperatura elevada do motor',
    'Vazamento de óleo',
    'Troca de filtros periódica',
    'Ruído excessivo na correia',
    'Painel de controle com falha',
    'Manutenção de rotina',
    'Correia solta',
    'Sensor de pressão inoperante'
  ]

  const incidentsToCreate = [
    { machineName: machines[0], typeOfOccurrence: 'Corretiva', severity: 'Média', status: 'Concluído', isMachineStopped: true },
    { machineName: machines[2], typeOfOccurrence: 'Preventiva', severity: 'Baixa', status: 'Concluído', isMachineStopped: false },
    { machineName: machines[1], typeOfOccurrence: 'Corretiva', severity: 'Alta', status: 'Em Aberto', isMachineStopped: true },
    { machineName: machines[3], typeOfOccurrence: 'Planejada', severity: 'Média', status: 'Em Andamento', isMachineStopped: false },
    { machineName: machines[4], typeOfOccurrence: 'Preventiva', severity: 'Média', status: 'Concluído', isMachineStopped: false },
    { machineName: machines[5], typeOfOccurrence: 'Corretiva', severity: 'Alta', status: 'Em Aberto', isMachineStopped: true },
    { machineName: machines[6], typeOfOccurrence: 'Planejada', severity: 'Baixa', status: 'Em Andamento', isMachineStopped: false },
    { machineName: machines[0], typeOfOccurrence: 'Corretiva', severity: 'Média', status: 'Em Aberto', isMachineStopped: false },
    { machineName: machines[1], typeOfOccurrence: 'Preventiva', severity: 'Média', status: 'Concluído', isMachineStopped: false },
    { machineName: machines[2], typeOfOccurrence: 'Corretiva', severity: 'Alta', status: 'Em Andamento', isMachineStopped: true },
  ]

  let count = 0
  for (const inc of incidentsToCreate) {
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)]
    // Criar datas um pouco espaçadas nos últimos 7 dias
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 7))

    await prisma.incident.create({
      data: {
        machineName: inc.machineName,
        reason: randomReason,
        typeOfOccurrence: inc.typeOfOccurrence,
        isMachineStopped: inc.isMachineStopped,
        description: `Descrição detalhada gerada automaticamente para a ocorrência: ${randomReason}. Serviço de prioridade ${inc.severity}.`,
        severity: inc.severity,
        status: inc.status,
        createdAt: pastDate,
      }
    })
    count++
  }

  console.log(`✅ Seed finalizado com sucesso! ${count} ordens criadas.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
