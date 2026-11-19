# 04. Especificação técnica

## Estrutura do código

```
src/
  proxy.ts                   subdomínio → página (briefing, bio)
  app/
    page.tsx                 site (seções)
    briefing/page.tsx        briefing (servidor) → BriefingFormulario (cliente)
    bio/page.tsx             bio, só servidor
    privacidade/page.tsx     política
    ir/[destino]/route.ts    clique da bio: conta e redireciona
    api/lead/route.ts        diagnóstico
    api/briefing/route.ts    briefing (grava, FIT, e-mail)
    api/briefing/whatsapp/route.ts   clique no WhatsApp do fim do briefing
    api/manter-banco/route.ts        cron: mantém o Supabase acordado
    api/eventos/route.ts     métricas próprias (só com aceite)
    globals.css              tokens + componentes (@layer components)
  components/
    site/                    seções do site, Logo, Footer (+ AvisoCookies)
    diagnostico/             diálogo do diagnóstico (carregado sob demanda)
    briefing/                BriefingFormulario, telas, TelaContatoBriefing
    ui/                      shadcn adaptado ao design system
  content/
    site.ts                  TODO texto de interface
    opcoes.ts                identificadores das opções (vai ao cliente)
    provisorios.ts           valores provisórios (WhatsApp, CNPJ, logo…)
  lib/
    briefing.ts              ETAPAS, esquemas zod, frentes, mensagens
    fit.ts                   pontuação FIT (só servidor)
    lead.ts                  esquemas do contato e do diagnóstico
    whatsapp.ts              máscara, normalização, links
    formatar.ts              nome, empresa, Instagram, nome completo
    ir.ts                    destinos e UTMs da bio
    limite.ts                limite de chamadas por IP
    utm.ts                   captura da origem (UTM, página, referrer)
    recomendacao.ts          frentes do diagnóstico
    banco/conexao.ts         conexão Postgres (DATABASE_URL)
    banco/comercial.ts       gravações no esquema comercial
    email/aviso-briefing.ts  e-mail para a SA (Resend)
    metricas/                coletor, esquema e gravação das métricas
supabase/migrations/         migrações do banco, em ordem
vercel.json                  região gru1 e cron
```

## Rotas de API (contratos)

### `POST /api/lead` (diagnóstico)

- Corpo: `{ nome, whatsapp, empresa, instagram, site (isca), trava, fase, faturamento, frenteDeInteresse?, utm?, pagina?, referrer? }`, validado por `leadSchema`.
- Respostas: `200 {ok:true}`; `400 {ok:false, erro:"json"|"validacao", campos}`; `429` (5 por minuto por IP).
- Depois de responder: `gravarDiagnostico` e webhook do CRM (`CRM_WEBHOOK_URL`, 5 s).

### `POST /api/briefing`

- Corpo (`briefingSchema`): contato (`nome` completo, `whatsapp`, `empresa`, `instagram`, `site` isca), `consentimento: true`, `segmento`, `tempo`, `produto`, `faturamento`, `origem`, `estrategia`, `marketing` (só com estratégia "sim"), `desafio[]`, `decisao`, `prazo`, `investimento`, `objetivo`, `outros{segmento, origem, desafio}`, `utm`, `pagina`, `referrer`.
- Respostas: `200 {ok:true, salvo:true, codigo}` gravado; `200 {ok:true, salvo:false}` sem banco ou falha (a tela pede o WhatsApp); `400` validação; `429` (5/min).
- Grava antes de responder (transação, `statement_timeout` 4 s; corrida de 6 s na rota). Depois (`after`, `maxDuration` 180 s): espera a pessoa sair da tela do presente (até 2 min, consultando a cada 5 s), manda o e-mail (Resend, 8 s) com o toque no Instagram e marca `avisos.processado_em`.

### `POST /api/briefing/instagram`

- Corpo: `{ codigo: uuid, acao: "clicou" | "continuou" }`, por `sendBeacon`.
- `clicou` grava `instagram_clicou_em`; `continuou` grava `instagram_tela_em` (o e-mail espera por ele). `204`, `404`, `400`, `429` (10/min).

### `POST /api/briefing/whatsapp`

- Corpo: `{ codigo: uuid }`. Enviado por `sendBeacon` no clique final.
- `204` registrado; `404` código desconhecido; `400`; `429` (10/min). Atualiza `whatsapp_aberto_em` e move o status para `abriu-whatsapp` (só de `novo`/`pendente-conversa`).

### `GET /ir/:destino?de=bio`

- `destino`: `diagnostico` | `whatsapp` | `site`; outro → `404`. `de` conhecido (`bio`) ou `direto`.
- `302` para o destino (`Cache-Control: no-store`). Depois: soma em `comercial.cliques` (exceto robôs de prévia).

### `GET /api/manter-banco` (cron)

- Exige `Authorization: Bearer CRON_SECRET` (`401` sem). Grava uma linha em `comercial.manutencao`. Agenda: `17 12 */6 * *` (dias 1, 7, 13, 19, 25, 31; maior intervalo 6 dias).

### `POST /api/eventos`

Métricas próprias, só depois de "Aceitar". Detalhes em `docs/DECISOES.md` (Métricas próprias).

## Validação e normalização

- Mesmo esquema zod no cliente e no servidor (`src/lib/lead.ts`, `src/lib/briefing.ts`).
- WhatsApp: guardado como `55` + DDD + número (`whatsappInternacional`); identificador único do contato.
- Instagram: `@usuario` em minúsculas (`normalizarInstagram`).
- Nome completo: duas palavras com 2 letras ou mais (`temNomeCompleto`).
- "Outro": texto de 2 a 80 caracteres, obrigatório quando marcado; vai para `*_outro`.
- Briefing: "quem cuida" é exigido com estratégia "sim" e descartado sem ela.

## Briefing: como o código está montado

- `ETAPAS` (lib/briefing.ts) define a ordem, o tipo (`unica`, `multipla`, `texto`) e o capítulo de cada pergunta. `etapasAtivas` aplica a condição da "quem cuida".
- O formulário (`BriefingFormulario.tsx`) guarda a tela atual **pelo nome da etapa**, não pelo número, e a função `coerente` impede pular respostas obrigatórias. O estado fica no `sessionStorage` (`sa:briefing`) e é revalidado ao ler.
- Telas: `TelaPergunta` (única), `TelaMultipla` (várias), `TelaTexto` (escrever), `TelaContatoBriefing` (formulário com react-hook-form).
- Para **acrescentar uma pergunta de escolha**: id em `opcoes.ts`; opções em `briefingOpcoes` e texto em `briefing.perguntas` (site.ts); campo em `respostasBriefingSchema` e entrada em `ETAPAS` (briefing.ts); rótulo em `briefing.mensagem.rotulos`; coluna nova por migração e gravação em `banco/comercial.ts`; testes em `briefing.test.ts`; política se for dado novo.

## E-mail

`src/lib/email/aviso-briefing.ts`: `montarEmailBriefing` (assunto, HTML com
tudo escapado, texto puro) e `enviarEmail` (POST `https://api.resend.com/emails`).
Variáveis: `RESEND_API_KEY`, `AVISO_EMAIL_PARA`, `AVISO_EMAIL_DE`. Sem chave,
não envia e o briefing segue gravado. Nenhum dado pessoal em log.

## Testes e qualidade

```bash
pnpm lint        # eslint, zero aviso
pnpm typecheck   # next typegen + tsc
pnpm test        # vitest (65 testes): diagnóstico, briefing, FIT, e-mail, bio, WhatsApp, métricas
pnpm build       # produção local
```

Os testes ficam ao lado do código (`src/lib/*.test.ts`). Integração com banco
é testada contra um Postgres local aplicando `supabase/migrations/*` em ordem.

## Convenções

- Texto só em `site.ts`; regras de copy no `CLAUDE.md`.
- Componente de cliente não importa `site.ts` (exceções: diálogo do diagnóstico e briefing).
- Commits sem marcas de IA; `main` é produção.
- Mudança de banco só por migração nova (as aplicadas não se editam).
