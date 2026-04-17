# Monitoro

Sistema de gestão de ordens de serviço para manutenção industrial, desenvolvido como projeto fullstack com Next.js, GraphQL e MongoDB.

## Sobre o projeto

O Monitoro surgiu da necessidade de digitalizar o processo de abertura e acompanhamento de chamados de manutenção. Em vez de planilhas e papéis, a equipe consegue registrar ocorrências, acompanhar o andamento em tempo real e extrair relatórios diretamente pela plataforma.

## Funcionalidades

**Dashboard:** KPI cards com contagem de abertas, críticas e total de ordens. Cada card é clicável e aplica filtro na tabela.

**Gráficos analíticos:** Volume de chamados nos últimos 3 meses (área) e ranking dos equipamentos com mais ocorrências (barras horizontais), ambos construídos com Recharts.

**Tabela de OS:** Busca por texto, filtro por tipo de manutenção (Preventiva, Corretiva, Planejada), status e severidade. Clique em qualquer máquina para filtrar somente as ordens daquele equipamento. As colunas de Data e Status são ordenáveis.

**Live sync:** Os dados atualizam automaticamente a cada 10 segundos via polling do Apollo Client, sem precisar recarregar a página.

**CRUD completo:** Abertura de OS com validação de formulário (Zod + React Hook Form), edição inline, atualização rápida de status diretamente na tabela e exclusão com confirmação.

**Impressão:** Gera um documento A4 com campos para assinatura, peças utilizadas e parecer técnico, adequado para uso em campo.

**Exportação CSV:** Relatório com os dados filtrados, compatível com Excel (encoding UTF-8 com BOM).

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
  incident.ts            # Tipos TypeScript compartilhados

prisma/
  schema.prisma          # Definição do modelo de dados
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

O frontend usa Apollo Client para enviar uma mutation GraphQL para `/api/graphql`. O Apollo Server valida a operação contra o schema, chama o resolver correspondente, que usa o Prisma para executar no MongoDB. Na resposta, o Apollo Client dispara um `refetchQueries` que atualiza a tabela automaticamente.

## Próximos passos

Algumas funcionalidades que planejo implementar:

- **Autenticação:** Login com NextAuth.js para controle de acesso por perfil (solicitante, técnico, gestor).
- **Solicitante:** Registrar quem abriu o chamado, vinculado ao usuário autenticado.
- **Responsável pelo serviço:** Atribuir um técnico específico para executar cada OS.
- **Histórico:** Log de alterações de status com data e usuário responsável.
- **Controle de peças:** Registro de materiais utilizados em cada ordem.
- **Relatório em PDF:** Geração server-side com dados completos da OS.

---

Desenvolvido por Nicolás · [LinkedIn](https://linkedin.com/in/seu-perfil) · [GitHub](https://github.com/seu-usuario)
