# 01. Visão geral

## O que é

Um conjunto de páginas e serviços que leva quem chega até a SA a virar uma
conversa no WhatsApp, guardando cada lead com contexto para a equipe:

| Peça | Endereço | Para quem | O que faz |
|---|---|---|---|
| Site (landing page) | `saagencia.com.br` (e `www`) | Quem ainda não conhece a SA | Apresenta método, frentes e equipe; o **diagnóstico** de 3 perguntas indica por onde começar e abre o WhatsApp |
| Briefing | `briefing.saagencia.com.br` | Quem já falou com a SA | Questionário antes da reunião; calcula o **FIT** (só interno), grava no banco, avisa a SA por e-mail e leva a pessoa a marcar a conversa no WhatsApp |
| Bio do Instagram | `bio.saagencia.com.br` | Quem vem do Instagram | Página de links com 3 botões (diagnóstico, WhatsApp, site), com contagem de cliques |
| Política de privacidade | `saagencia.com.br/privacidade` | Todos | Texto da LGPD |
| Base comercial | Supabase (projeto "SA Marketing") | Equipe da SA | Contatos, diagnósticos, briefings, status do lead, avisos, cliques |
| Aviso por e-mail | `contato@saagencia.com.br` | Equipe da SA | Um e-mail por briefing concluído |

## Jornada do lead

```mermaid
flowchart LR
  IG[Instagram] -->|bio| BIO[bio.saagencia.com.br]
  ADS[Anúncios / Google] --> SITE[saagencia.com.br]
  BIO -->|Descobrir o que trava| DIAG[Diagnóstico no site]
  SITE --> DIAG
  DIAG -->|grava| DB[(Supabase)]
  DIAG -->|abre| WA[WhatsApp da SA]
  BIO -->|Chamar consultor| WA
  WA -->|consultor manda o link| BRI[briefing.saagencia.com.br]
  BRI -->|grava + FIT| DB
  BRI -->|e-mail| MAIL[contato@saagencia.com.br]
  BRI -->|Chamar um consultor| WA
  WA --> REU[Reunião inicial]
```

## Contas e serviços

| Serviço | Conta / local | Plano | Uso |
|---|---|---|---|
| GitHub | `theufirminoo/sa-marketing-project-landingpag` | Grátis | Código; a branch `main` é produção |
| Vercel | Equipe "Matheus' projects" (`m9-studio`), projeto `sa-marketing-project-landingpag` | Hobby (grátis) | Hospedagem, funções, cron, domínios |
| Supabase | Organização "SA Marketing", projeto "SA Marketing" (`yzarinssfqttxiqmkveo`, São Paulo) | Free | Banco Postgres comercial |
| Resend | Conta com o domínio `envio.saagencia.com.br` (São Paulo) | Free (3.000 e-mails/mês, 100/dia) | E-mail de aviso do briefing |
| Registro.br | `saagencia.com.br` | Anual | Registro do domínio e DNS |
| Google Workspace | `saagencia.com.br` | Pago | Caixa `contato@saagencia.com.br` |

Pendências de conta (ver `BACKLOG.md`): o plano Hobby da Vercel não permite
uso comercial (assinar o Pro antes de escalar anúncios); o Supabase Free não
faz backup (assinar o Pro quando houver volume de leads reais). O projeto
"theufirminoo's Project" (EUA, pausado) na organização SA Marketing pode ser
apagado.

## Custos atuais

Zero além do domínio e do Google Workspace. Gatilhos de custo: Vercel Pro
(US$ 20/mês), Supabase Pro (US$ 25/mês), Resend acima de 3.000 e-mails/mês.
