# Arquitetura de tecnologia da SA (saagencia.com.br)

Proposta de 29/10/2026. Objetivo: colocar o site no ar agora e deixar pronta a
base para os sistemas da empresa (começando por um sistema pequeno, com várias
pessoas usando ao mesmo tempo em tempo real), sem migrações dolorosas depois.

Preços conferidos em outubro de 2026 em fontes secundárias. Confirme na página
de cada serviço antes de assinar.

## Veredito (decisão de 29/10/2026)

**Cloudflare + Vercel Pro + Supabase + Resend + PostHog.** Começa em ~US$ 20/mês.

Agora, para o site:

1. Domínio `saagencia.com.br` fica no Registro.br, com o DNS na Cloudflare (grátis).
2. Site na Vercel Pro (US$ 20/mês; o Hobby não permite uso comercial).
3. Leads do diagnóstico gravados no Supabase, projeto em São Paulo (plano grátis no início).
4. Aviso de lead novo por e-mail pelo Resend (grátis até 3.000/mês).
5. `contato@saagencia.com.br` encaminhado para um Gmail pela Cloudflare Email Routing (grátis).
6. Visitas: **Vercel Web Analytics** já ligado (anônimo, sem cookie, fora do aviso de cookies). PostHog entra depois, atrás do "Aceitar", para funis e gravação de sessão.

Gatilhos:

- **Primeiro lead real:** assinar o Supabase Pro (US$ 25/mês). Dado de cliente precisa de backup, e o grátis pausa sem uso.
- **Começo do sistema:** `app.saagencia.com.br`, mesmo repositório (monorepo), mesmo Supabase, mesma Vercel. Sem migração.

Fora por enquanto:

- Contabo: servidor próprio sem necessidade.
- Hospedar na Cloudflare: economia pequena, exige adaptar o site.
- Umami: o PostHog cobre.
- Google Workspace: só quando a equipe precisar de caixas próprias.

Próximo passo: a SA cria as contas, no nome da empresa. Depois o desenvolvimento faz o seguinte:

- liga o formulário ao Supabase e ao Resend;
- integra o PostHog;
- troca o domínio no código;
- atualiza a política de privacidade;
- passa o roteiro do DNS e do deploy.

As chaves vão direto nas variáveis de ambiente da Vercel, nunca em chat ou no código.

## Princípios

1. **Tudo em padrões abertos.** Banco é Postgres, apps são Next.js, e-mail é
   SMTP/API. Qualquer peça pode trocar de fornecedor sem reescrever o resto.
2. **DNS na Cloudflare.** Com o DNS lá, trocar de hospedagem é mudar um
   registro, não migrar o domínio.
3. **Um banco, vários apps.** Site e sistemas usam o mesmo Supabase (projetos
   separados para teste e produção), com o esquema versionado no Git.
4. **Gerenciado antes de servidor próprio.** Nada de VPS para manter enquanto
   o volume não pedir.

## Peças

| Camada | Serviço | Para quê | Grátis | Pago |
|---|---|---|---|---|
| Domínio | Registro.br | Dono do `saagencia.com.br` | ~R$ 40/ano | — |
| DNS, SSL, proteção | **Cloudflare** | DNS, DDoS, regras de firewall, redirecionamentos, e-mail de entrada | Sim, para o nosso caso | Pro US$ 20/mês (não precisa agora) |
| Hospedagem dos apps | **Vercel Pro** (hoje o projeto está no Hobby, que não permite uso comercial: assinar o Pro) | Site e sistemas Next.js | Hobby proíbe uso comercial | US$ 20 por desenvolvedor/mês (leitores grátis) |
| Banco, login, tempo real, arquivos | **Supabase** (região São Paulo) | Leads, clientes, usuários do sistema, realtime, uploads | 2 projetos, 500 MB, 50 mil usuários/mês; **pausa após 7 dias sem uso, sem backup** | Pro US$ 25/mês: 8 GB, 100 mil usuários, backup diário, sem pausa |
| E-mail automático | **Resend** | Aviso de lead novo para a SA, confirmação para o cliente, e-mails do sistema | 3.000/mês, 100/dia | Pro US$ 20/mês, 50 mil e-mails |
| Caixa de e-mail | Cloudflare Email Routing (grátis) ou Google Workspace | Receber em `contato@saagencia.com.br` | Encaminhamento grátis para um Gmail | Workspace ~R$ 30–40 por pessoa/mês |
| Métricas de visita | **PostHog** (nuvem da UE) | Visitas, origem, funis, gravação de sessão; serve também para o sistema | 1 milhão de eventos/mês, 5 mil gravações | Pago por uso acima disso |
| Código | GitHub | Repositório único (monorepo) | Sim | — |

### Por que não as outras opções

- **Cloudflare como hospedagem (Workers + OpenNext):** custa US$ 5/mês, mas o
  adaptador ainda não cobre tudo do Next.js 16 (middleware Node) e o driver do
  Postgres precisa de ajuste. Economiza US$ 15/mês e cria trabalho de migração.
  Fica como opção se o custo da Vercel crescer.
- **Umami:** bom e simples (100 mil eventos grátis, Pro US$ 20/mês), mas só
  conta visitas. Para "a maior quantidade de dados possível" e para o sistema
  futuro, o PostHog entrega funis, gravação de sessão e flags no plano grátis.
- **Contabo (VPS):** barato, mas a SA vira responsável por atualizar, proteger
  e fazer backup do servidor. Só compensa com volume alto ou necessidade
  específica (por exemplo, rodar n8n ou uma API de WhatsApp).
- **Amazon SES:** mais barato por e-mail em volume alto, mas configuração mais
  trabalhosa. Resend basta até dezenas de milhares de e-mails por mês.

## Domínios

| Endereço | O que é |
|---|---|
| `saagencia.com.br` | Site (esta landing page) |
| `www.saagencia.com.br` | Redireciona para o principal |
| `app.saagencia.com.br` | Sistema interno (futuro) |
| `contato@saagencia.com.br` | E-mail de entrada |
| `envio.saagencia.com.br` | Subdomínio de envio do Resend (SPF/DKIM) |

## Repositório (quando o sistema começar)

```
apps/site        esta landing page
apps/sistema     sistema multi pessoas (Supabase Auth + Realtime)
packages/ui      design system (tokens, fontes, componentes)
packages/db      tipos gerados e migrações do Supabase
```

Hoje o site fica como está. A reorganização em monorepo acontece no primeiro
commit do sistema; é mover pastas, sem reescrever.

## Dados

- **Leads do diagnóstico:** tabela `leads` no Supabase + e-mail pelo Resend
  para a SA. Hoje o lead só chega se a pessoa enviar o WhatsApp (ver BACKLOG).
- **Visitas e metadados:** PostHog, só depois do "Aceitar" (mesmo aviso de
  cookies de hoje). O coletor próprio (`src/lib/metricas`) vira reserva ou é
  removido para não medir em dobro.
- **Login:** o site não tem login. O sistema usará Supabase Auth; os acessos
  ficam registrados no próprio Supabase.
- **LGPD:** banco em São Paulo, PostHog na UE, política de privacidade listando
  Vercel, Supabase, Resend e PostHog como operadores.

## Custo mensal estimado

| Fase | Peças pagas | Total |
|---|---|---|
| 1. Só o site | Vercel Pro (1 pessoa) | **~US$ 20/mês** + domínio |
| 2. Sistema em produção | + Supabase Pro | **~US$ 45/mês** (+ US$ 20 por desenvolvedor a mais) |
| 3. Volume maior | + Resend Pro, uso extra | ~US$ 65–100/mês |

Na fase 1 o Supabase pode ficar no grátis, mas ele pausa sem uso e não faz
backup: para dados de clientes, assinar o Pro assim que houver lead real
entrando.
