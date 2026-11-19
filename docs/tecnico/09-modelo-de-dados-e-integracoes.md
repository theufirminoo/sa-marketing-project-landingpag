# 09. Modelo de dados e integrações

Conferido no banco de produção em 18/11/2026 (tabelas, colunas, chaves,
índices e gatilhos). Complementa o [05 Banco de dados](05-banco-de-dados.md).

## 1. Modelo conceitual (MER)

**Entidades**

| Entidade | O que representa | Identificador natural |
|---|---|---|
| Contato | Uma pessoa ou empresa que falou com a SA | WhatsApp (55 + DDD + número) |
| Diagnóstico | As 3 respostas do diagnóstico do site | O contato (1 por contato) |
| Briefing | O questionário antes da reunião, com o FIT | O contato (1 por contato); `codigo` para o clique final |
| Aviso | Um envio novo que precisa ser comunicado à SA | Sequencial |
| Clique | Total de toques num botão da bio, por dia | Dia + origem + destino |
| Manutenção | Sinal de vida do banco (cron) | Única |

**Relacionamentos**

- Contato **tem** 0 ou 1 Diagnóstico (1:0..1). Refazer atualiza o mesmo.
- Contato **tem** 0 ou 1 Briefing (1:0..1). Refazer atualiza o mesmo.
- Contato **gera** 0 ou N Avisos (1:0..N), um a cada envio novo.
- Clique e Manutenção são independentes: não identificam pessoas.

```mermaid
flowchart LR
  C((Contato)) -- "1 : 0..1" --- D((Diagnóstico))
  C -- "1 : 0..1" --- B((Briefing))
  C -- "1 : 0..N" --- A((Aviso))
  K((Clique)):::solto
  M((Manutenção)):::solto
  classDef solto stroke-dasharray: 4 4
```

**Regras de negócio no modelo**

- O WhatsApp é a identidade do lead: o mesmo número no diagnóstico e no briefing é o mesmo contato.
- O status do funil fica no **contato**, não no briefing: é um só por pessoa.
- O FIT fica no **briefing**, com a versão da regra (`fit_versao`), para recalcular no futuro.
- Excluir um contato apaga diagnóstico, briefing e avisos dele (`on delete cascade`), o que atende ao pedido de exclusão da LGPD.

## 2. Diagrama entidade-relacionamento (DER)

```mermaid
erDiagram
  contatos ||--o| diagnosticos : "contato_id"
  contatos ||--o| briefings : "contato_id"
  contatos ||--o{ avisos : "contato_id"

  contatos {
    bigint id PK "identity"
    text whatsapp UK "^55[1-9][0-9][0-9]{8,9}$"
    text nome "2 a 80"
    text empresa "até 120"
    text instagram "até 81 (@ + 80)"
    text status "8 valores; padrão novo"
    timestamptz status_em "gatilho"
    timestamptz whatsapp_aberto_em
    uuid responsavel_id "futuro: Supabase Auth"
    text observacoes
    bool segue_instagram "a equipe marca"
    jsonb primeira_origem "utm, pagina, referrer"
    timestamptz criado_em
    timestamptz atualizado_em "gatilho"
  }
  diagnosticos {
    bigint id PK
    bigint contato_id FK,UK "cascade"
    text trava
    text fase
    text faturamento "5 faixas"
    text frente_de_interesse
    text_array frentes_recomendadas
    jsonb utm
    text pagina
    text referrer
    int vezes ">= 1"
    timestamptz criado_em
    timestamptz atualizado_em
  }
  briefings {
    bigint id PK
    bigint contato_id FK,UK "cascade"
    uuid codigo UK "gen_random_uuid"
    text segmento
    text segmento_outro
    text tempo_mercado
    text produto_principal "até 120"
    text faturamento
    text origem_clientes
    text origem_outro
    text estrategia
    text marketing "só se estrategia = sim"
    text_array desafios "1 a 11"
    text desafio_outro
    text_array frentes_indicadas
    text decisao
    text prazo
    text investimento
    text objetivo "até 500"
    text fit "alto, medio, baixo"
    smallint fit_pontos
    smallint fit_versao
    timestamptz consentimento_em
    jsonb utm
    text pagina
    text referrer
    int vezes
    timestamptz criado_em
    timestamptz atualizado_em
  }
  avisos {
    bigint id PK
    text tipo "diagnostico, briefing"
    bigint contato_id FK "cascade"
    bool repetido
    timestamptz criado_em
    timestamptz processado_em "e-mail enviado"
  }
  cliques {
    date dia PK
    text origem PK
    text destino PK "diagnostico, whatsapp, site"
    int total
  }
  manutencao {
    smallint id PK "sempre 1"
    timestamptz ultimo_sinal
    int sinais
  }
```

## 3. Modelo relacional

Notação: **sublinhado = chave primária**, `→` = chave estrangeira,
`UK` = única. Todas no esquema `comercial`.

```
contatos     (_id_, whatsapp UK, nome, empresa, instagram, status, status_em,
              whatsapp_aberto_em, responsavel_id, observacoes, segue_instagram,
              primeira_origem,
              criado_em, atualizado_em)

diagnosticos (_id_, contato_id UK → contatos.id ON DELETE CASCADE, trava, fase,
              faturamento, frente_de_interesse, frentes_recomendadas[], utm,
              pagina, referrer, vezes, criado_em, atualizado_em)

briefings    (_id_, contato_id UK → contatos.id ON DELETE CASCADE, codigo UK,
              segmento, segmento_outro, tempo_mercado, produto_principal,
              faturamento, origem_clientes, origem_outro, estrategia, marketing,
              desafios[], desafio_outro, frentes_indicadas[], decisao,
              prazo, investimento, objetivo, fit, fit_pontos, fit_versao,
              consentimento_em, utm, pagina, referrer, vezes, criado_em,
              atualizado_em)

avisos       (_id_, tipo, contato_id → contatos.id ON DELETE CASCADE, repetido,
              criado_em, processado_em)

cliques      (_dia, origem, destino_, total)

manutencao   (_id_, ultimo_sinal, sinais)
```

**Normalização:** 3FN no essencial. Respostas de escolha ficam como texto
com lista fechada (CHECK) em vez de tabelas de domínio: as listas mudam
junto com o site (versionadas no código e na migração) e o histórico antigo
continua válido. `desafios` e `frentes_indicadas` são arrays porque são
listas curtas e sempre lidas inteiras; `utm` e `primeira_origem` são jsonb
porque o formato pode crescer.

**Índices**

| Tabela | Índice | Para quê |
|---|---|---|
| contatos | `contatos_whatsapp_key` (único) | Identidade do lead e upsert |
| contatos | `contatos_status_idx (status, criado_em desc)` | Funil por status |
| contatos | `contatos_esfriando_idx (status_em)` parcial | Leads esfriando, só os pendentes |
| diagnosticos / briefings | `*_contato_id_key` (único) | 1 por contato e upsert |
| briefings | `briefings_codigo_idx` (único) | Clique final pelo código |
| briefings | `briefings_fit_idx (fit, criado_em desc)` | Lista por FIT |
| avisos | `avisos_pendentes_idx (criado_em)` parcial | Fila do que falta enviar |
| avisos | `avisos_contato_idx` | Avisos de um contato |
| cliques | chave (dia, origem, destino) | Soma do dia (upsert) |

**Gatilhos**

| Gatilho | Quando | Faz |
|---|---|---|
| `*_atualizacao` | antes de update (contatos, diagnosticos, briefings) | `atualizado_em = now()` |
| `contatos_status` | antes de update em contatos | `status_em = now()` se o status mudou |
| `*_aviso_novo` | depois de insert (diagnosticos, briefings) | Cria um aviso |
| `*_aviso_refeito` | depois de update, só se `vezes` mudou | Cria um aviso com `repetido = true` |

**Visões:** `leads` (junta contato, diagnóstico e briefing; mais quentes
primeiro), `leads_esfriando` (filtro de `leads`), `cliques_30_dias`. Todas com
`security_invoker`, então respeitam as permissões de quem consulta.

## 4. Arquitetura de dados

### Onde cada dado vive

| Dado | Navegador | Vercel | Supabase | Resend | Google Workspace | WhatsApp |
|---|---|---|---|---|---|---|
| Respostas em andamento | `sessionStorage` (`sa:diagnostico`, `sa:briefing`), apagado ao fechar a aba | | | | | |
| Origem da visita (UTM, página, referrer) | `sessionStorage` (`sa:origem`) | | junto com o lead | | | |
| Lead (contato + respostas) | | só em trânsito, nunca em log | **fonte da verdade** | conteúdo do e-mail (registro do envio) | e-mail recebido | mensagem que a pessoa manda |
| FIT | nunca | calculado | `briefings` | no e-mail interno | e-mail interno | nunca |
| Status do funil | | | `contatos.status` | | | |
| Cliques da bio | | | `cliques` (só totais) | | | |
| Visitas | | Web Analytics (anônimo) | | | | |
| Métricas próprias (com aceite) | código aleatório do visitante | | banco de métricas (desligado hoje) | | | |

### Ciclo do dado

```mermaid
flowchart LR
  A[Coleta<br/>formulário no navegador] --> B[Validação<br/>zod no navegador]
  B --> C[Validação de novo<br/>zod no servidor]
  C --> D[Enriquecimento<br/>FIT, frentes, WhatsApp 55+DDD]
  D --> E[(Persistência<br/>Supabase, transação)]
  E --> F[Gatilhos<br/>avisos, datas]
  F --> G[Comunicação<br/>e-mail para a SA]
  E --> H[Consulta<br/>visões leads e esfriando]
  H --> I[Ação comercial<br/>status pela equipe]
```

**Fonte da verdade:** o Supabase. O e-mail é um aviso; se falhar, o lead
continua no banco (e o aviso fica pendente em `avisos`).

**Retenção:** sem exclusão automática hoje. Exclusão a pedido, por WhatsApp
(ver 06). Definir prazo de retenção na política antes de escalar.

## 5. Como as ferramentas conversam

### Mapa de integrações

| De → para | Protocolo | Autenticação | O que passa | Se falhar |
|---|---|---|---|---|
| Navegador → Vercel (`/api/*`, `/ir`) | HTTPS (JSON; `sendBeacon` no clique) | Nenhuma; limite por IP, campo isca, validação | Respostas e contato | Briefing: tela pede o WhatsApp com as respostas; diagnóstico: segue para o WhatsApp |
| Vercel → Supabase | Postgres (TLS) pelo pooler Supavisor, porta 6543, modo transação | Usuário `sa_site` + senha (`DATABASE_URL`) | SQL parametrizado | Rota responde `salvo:false`; log só com o código do erro |
| Vercel → Resend | HTTPS `POST api.resend.com/emails` | Bearer `RESEND_API_KEY` (só envio, só o domínio `envio`) | Assunto, HTML, texto | Briefing segue gravado; aviso fica pendente |
| Resend → Google Workspace | SMTP pela infraestrutura do Resend (Amazon SES, `sa-east-1`) | SPF e DKIM do `envio.saagencia.com.br`; DMARC do domínio | O e-mail | Devolução vai para `send.envio` (MX de retorno) |
| Vercel Cron → Vercel (`/api/manter-banco`) | HTTPS GET | Bearer `CRON_SECRET` | Nada (sinal) | Supabase pode pausar após 7 dias; restaurar no painel |
| GitHub → Vercel | Webhook de push (integração Git) | App da Vercel no GitHub | Código da `main` | Deploy manual |
| Registro.br (DNS) → todos | DNS | DNSSEC desligado | Endereços, MX, SPF, DKIM, DMARC | Ver `docs/DNS.md` |
| Navegador → WhatsApp | Link `api.whatsapp.com/send` | Nenhuma | Mensagem pronta | Pessoa digita a mensagem |
| Agente (Claude) → Vercel, Supabase, Resend | Conectores MCP (OAuth) | Login de cada conta | Configuração, migrações, chaves, testes | Fazer pelo painel |

### Briefing, passo a passo

```mermaid
sequenceDiagram
  autonumber
  actor P as Pessoa
  participant N as Navegador
  participant V as Vercel /api/briefing
  participant S as Supabase
  participant R as Resend
  participant G as Gmail contato@
  participant W as WhatsApp
  P->>N: aceite + respostas + contato
  N->>N: valida (zod) e guarda em sessionStorage
  N->>V: POST JSON
  V->>V: valida de novo, calcula FIT
  V->>S: transação: upsert contato, upsert briefing, status
  S-->>S: gatilho cria aviso
  S-->>V: codigo
  V-->>N: {salvo:true, codigo}
  N-->>P: tela final (análise, frentes, WhatsApp, Instagram)
  V->>R: POST /emails (depois de responder)
  R->>G: entrega (SPF/DKIM do envio)
  V->>S: avisos.processado_em = now()
  P->>N: "Chamar um consultor"
  N->>V: sendBeacon /api/briefing/whatsapp {codigo}
  V->>S: status = abriu-whatsapp
  N->>W: abre a conversa com a mensagem pronta
```

### Diagnóstico, passo a passo

```mermaid
sequenceDiagram
  autonumber
  actor P as Pessoa
  participant N as Navegador
  participant V as Vercel /api/lead
  participant S as Supabase
  participant C as CRM (futuro)
  participant W as WhatsApp
  P->>N: 3 respostas + contato
  N->>V: POST JSON
  V-->>N: {ok:true} (na hora)
  par depois de responder
    V->>S: upsert contato + diagnóstico
    V->>C: webhook (se CRM_WEBHOOK_URL)
  end
  N-->>P: resultado com frentes
  P->>W: "Enviar no WhatsApp"
```

### Bio, passo a passo

```mermaid
sequenceDiagram
  actor P as Pessoa no Instagram
  participant B as bio.saagencia.com.br
  participant V as Vercel /ir/destino
  participant S as Supabase
  P->>B: abre a bio (HTML do servidor)
  P->>V: toca num botão (/ir/diagnostico?de=bio)
  V-->>P: 302 para o site com ?diagnostico&utm_*
  V->>S: soma 1 em cliques (depois de responder; robôs não contam)
```

### Publicação e configuração

```mermaid
flowchart LR
  DEV[Commit na main] --> GH[GitHub]
  GH -->|webhook| VC[Vercel build]
  VC -->|lê variáveis| ENV[(Variáveis de ambiente)]
  VC --> PROD[Produção gru1]
  MIG[Migração em supabase/migrations] -->|SQL Editor ou conector| SB[(Supabase)]
  DNS[Registro.br] -.resolve.-> PROD
```
