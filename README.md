# Monitoro

Sistema de gestão de ordens de serviço para manutenção industrial, desenvolvido como projeto fullstack com Next.js, GraphQL e MongoDB.

## Sobre o projeto

O Monitoro surgiu da necessidade de digitalizar o processo de abertura e acompanhamento de chamados de manutenção em ambientes industriais. O sistema adota uma arquitetura de dados relacional robusta, segregando a gestão de Máquinas (Equipamentos) das Ordens de Serviço (OS). Em vez de planilhas e controles manuais, a equipe técnica e de gestão consegue registrar ocorrências estruturadas, acompanhar o andamento em tempo real, gerenciar o encerramento técnico e extrair relatórios altamente precisos diretamente pela plataforma.

## Funcionalidades

**Dashboard Analítico:** KPI cards com contagem de ordens abertas, críticas e o volume total operante. Os cards funcionam como atalhos de filtro dinâmico na tabela.

**Métricas e Gráficos:** Integração com Recharts para visualização do volume de chamados nos últimos trimestres (área contínua) e um ranking automatizado dos gargalos na planta, exibindo o Top 5 equipamentos com mais ocorrências agrupados por severidade.

**Tabela de OS e Live Sync:** Interface principal atualizada automaticamente via polling do Apollo Client (a cada 10s). Permite busca por texto e filtragem técnica (Preventiva, Corretiva, Planejada; Status e Severidade). A tabela suporta ordenação nativa e permite isolar todos os dados da tela clicando no nome de uma máquina.

**Gestão Completa (CRUD de OS):** Abertura de ordens vinculadas diretamente às entidades de Máquina cadastradas, com validação de dados via Zod e React Hook Form. Fluxos dedicados para edição e atualização rápida de status ("Em Aberto", "Em Andamento", "Concluído").

**Encerramento Técnico:** Modal especializado para a conclusão de manutenções, com registro obrigatório de data e hora do serviço finalizado, campo para parecer técnico e anexo de links externos para laudos.

**Relatórios e Exportação:** Exportação CSV do grid de dados ativa, ajustada com encoding UTF-8 (BOM) para compatibilidade nativa com Excel. Opção de visualização individual de OS e impressão estruturada (A4) com áreas para assinaturas e apontamento de materiais em campo.

## Stack

- **Next.js 14** com App Router para o framework e roteamento
- **TypeScript** em todo o projeto
- **GraphQL** com Apollo Server (backend) e Apollo Client (frontend)
- **Prisma ORM** conectado ao **MongoDB Atlas**
- **Tailwind CSS** + **shadcn/ui** para a interface
- **Recharts** para os gráficos
- **Zod** + **React Hook Form** para validação

## Estrutura

```
app/
  page.tsx               # Página principal
  layout.tsx             # Layout raiz com providers
  api/graphql/
    route.ts             # Handler da API GraphQL
    schema/
      typeDefs.ts        # Schema GraphQL (contrato da API)
      resolvers.ts       # Lógica de acesso ao banco

components/
  IncidentTable.tsx      # Tabela principal com filtros, KPIs e live sync
  IncidentForm.tsx       # Formulário de criação e edição
  IncidentAnalytics.tsx  # Gráficos de volume e ranking
  incident/              # Sub-componentes reutilizáveis (Badges, KpiCards)
  providers/             # Apollo Provider
  ui/                    # Componentes base do shadcn/ui

lib/
  apollo-client.ts       # Configuração do Apollo Client
  prisma.ts              # Singleton do Prisma Client
  graphql-queries.ts     # Queries e mutations centralizadas

types/
  incident.ts            # Tipos TypeScript compartilhados e legados
  service-order.ts       # Interfaces corporativas baseadas em DTOs (Machine, ServiceOrder)

prisma/
  schema.prisma          # Definição do modelo de dados relacional e coleções no MongoDB
```

## Rodando localmente

**Pré-requisitos:** Node.js 18+ e pnpm instalados.

```bash
pnpm install
```

Crie um arquivo `.env` na raiz com a connection string do MongoDB:

```env
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/monitoro"
```

```bash
# Gerar o cliente Prisma
pnpm prisma generate

# Popular o banco com dados de exemplo (opcional)
node scripts/seed.js

# Iniciar
pnpm dev
```

Acesse `http://localhost:3000`.

## Como os dados fluem

O frontend utiliza Apollo Client para gerenciar o estado global assíncrono e disparar mutations para o endpoint `/api/graphql`. O Apollo Server recebe a requisição, valida a estrutura baseada nos `typeDefs` e aciona a camada de negócios (`resolvers`). O código nos resolvers aplica regras padronizadas (baseadas em padrões de injeção e serviços) e interage com o MongoDB via Prisma Client. Após a resolução, as queries no front são revalidadas (`refetchQueries`), sincronizando toda a tela transparentemente.

## Próximos passos

Algumas funcionalidades que planejo implementar:

- **Autenticação:** Login com NextAuth.js para controle de acesso por perfil (solicitante, técnico, gestor).
- **Solicitante:** Registrar quem abriu o chamado, vinculado ao usuário autenticado.
- **Responsável pelo serviço:** Atribuir um técnico específico para executar cada OS.
- **Histórico:** Log de alterações de status com data e usuário responsável.
- **Controle de peças:** Registro de materiais utilizados em cada ordem.
- **Relatório em PDF:** Geração server-side com dados completos da OS.

---

Desenvolvido por Nicolás · [LinkedIn](https://www.linkedin.com/in/nicolasharnisch/) · [GitHub](https://github.com/NicolasHarnisch)
