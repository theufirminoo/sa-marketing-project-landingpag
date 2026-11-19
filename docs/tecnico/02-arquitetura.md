# 02. Arquitetura

## Visão de componentes

```mermaid
flowchart TB
  subgraph Navegador
    P1[Site / diagnóstico]
    P2[Briefing]
    P3[Bio]
  end
  subgraph Vercel["Vercel (funções em gru1, São Paulo)"]
    PX[src/proxy.ts<br/>subdomínio → página]
    API1[/api/lead/]
    API2[/api/briefing/]
    API4[/ir/:destino/]
    API5[/api/manter-banco/]
    API6[/api/eventos/]
    CRON[Cron Vercel<br/>dias 1,7,13,19,25,31]
  end
  subgraph Supabase["Supabase SA Marketing (sa-east-1)"]
    DB[(Postgres<br/>esquema comercial)]
  end
  RS[Resend<br/>envio.saagencia.com.br]
  WS[Google Workspace<br/>contato@saagencia.com.br]
  WA[WhatsApp da SA]

  P1 --> API1 --> DB
  P2 --> API2 --> DB
  API2 -->|depois de responder| RS --> WS
  P3 --> API4 --> DB
  API4 -->|302| P1
  API4 -->|302| WA
  P1 --> WA
  P2 --> WA
  CRON --> API5 --> DB
  P1 -->|só após "Aceitar"| API6
```

## Peças

| Camada | Tecnologia | Observações |
|---|---|---|
| Front-end e servidor | Next.js 16.4 (App Router), React 19, TypeScript | `proxy.ts` substitui o antigo `middleware`; regras da versão em `node_modules/next/dist/docs/` |
| Estilo | Tailwind v4 com os tokens do design system (`docs/design-system/`) | Só existem as cores, raios e sombras dos tokens |
| Validação | zod 4 | O mesmo esquema valida no navegador e no servidor |
| Banco | Postgres 17 no Supabase, driver `postgres` (porsager) | Conexão pelo pooler em modo transação (porta 6543), `prepare: false` |
| E-mail | Resend (API HTTP, sem SDK) | Domínio `envio.saagencia.com.br` verificado (SPF, DKIM) |
| Hospedagem | Vercel, região de funções `gru1` | Publica a cada push na `main` |
| Agendamento | Vercel Cron (`vercel.json`) | Mantém o Supabase grátis acordado |
| Medição | Vercel Web Analytics (anônimo) e coletor próprio (só com aceite) | O briefing e a bio não medem |

## Subdomínios

Um único projeto Vercel serve tudo. `src/proxy.ts` olha o `Host` e reescreve a
raiz:

| Host | Reescrito para |
|---|---|
| `saagencia.com.br`, `www` | `/` (site) |
| `briefing.saagencia.com.br` | `/briefing` |
| `bio.saagencia.com.br` | `/bio` |

O resto (`/api`, `/ir`, `/privacidade`, arquivos) passa direto em qualquer host.
Para um subdomínio novo: adicionar em `SUBDOMINIOS` (proxy), criar a página,
adicionar o domínio no projeto da Vercel e o CNAME no Registro.br (ver 06).

## Fluxos de dados

### Diagnóstico (site)

1. A pessoa responde 3 perguntas e o contato no diálogo (código carregado sob demanda).
2. `POST /api/lead` valida (zod), responde na hora e, com `after()`, grava no
   banco (`contatos` + `diagnosticos`) e encaminha ao CRM se `CRM_WEBHOOK_URL` existir.
3. A tela de resultado mostra as frentes indicadas e abre o WhatsApp com a mensagem pronta.

### Briefing

1. Aceite LGPD na abertura, 12 ou 13 perguntas em 4 capítulos, contato.
2. `POST /api/briefing` valida, calcula o FIT (servidor), **grava antes de
   responder** (transação com tempo limite de 4 s no banco e 6 s na rota) e
   devolve um `codigo` (uuid).
3. Depois de responder, `after()` monta e envia o e-mail para a SA (Resend) e,
   se aceito, marca `comercial.avisos.processado_em`.
4. A tela final mostra a análise como presente, as frentes e "Pronto. Pode
   voltar para a conversa no WhatsApp.", sem botões.
5. Sem banco (falha ou sem `DATABASE_URL`): a tela pede o envio pelo WhatsApp
   com as respostas escritas na mensagem.

### Bio

Botão → `GET /ir/<destino>?de=bio` → soma o clique em `comercial.cliques`
(depois de responder; robôs de prévia não contam) → redireciona (302).
Diagnóstico e site levam `utm_source=instagram&utm_medium=bio`, que chegam ao
banco junto com o lead.

## Segurança e privacidade

- **Banco:** esquema `comercial` fora da API pública do Supabase; RLS ligado em
  todas as tabelas; as chaves públicas (`anon`, `authenticated`) não têm acesso.
  O site entra como `sa_site`, que só lê, grava e atualiza o esquema `comercial`
  (sem `DELETE`).
- **Segredos:** só nas variáveis da Vercel, marcadas como sensíveis. Nunca no
  Git nem em chat. A chave do Resend só envia e só pelo domínio `envio`.
- **Rotas:** limite de chamadas por IP (em memória, por instância), campo isca
  contra robôs, validação zod, `CRON_SECRET` na rota do cron.
- **Logs:** nunca dado pessoal; só o tipo do erro e o código do Postgres.
- **FIT:** calculado e guardado só no servidor; nunca vai ao navegador.
- **LGPD:** aceite registrado (`consentimento_em`), política em `/privacidade`,
  dados em São Paulo, exclusão a pedido (ver 06).
- **Cabeçalhos:** `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `X-Frame-Options`, CSP básica (`next.config.ts`).

## Regiões

Banco (Supabase) e envio de e-mail (Resend) em `sa-east-1`; funções da Vercel
em `gru1`. Tudo em São Paulo: menor latência e dados no Brasil.
