# SA Marketing: landing page

Página única em português do Brasil que leva o visitante a um diagnóstico de
3 perguntas e abre o WhatsApp com as respostas preenchidas. O briefing
completo está em `docs/PROMPT.md`; as regras do Next.js desta versão estão em
`AGENTS.md` e em `node_modules/next/dist/docs/`.

## Comandos

```bash
pnpm dev                       # desenvolvimento (etiquetas "Provisório" e rota /ds aparecem)
pnpm build && pnpm start       # produção local; revisão sempre contra este modo
pnpm lint                      # eslint, zero aviso
pnpm typecheck                 # next typegen + tsc
pnpm test                      # vitest: recomendação, esquema do lead, WhatsApp
pnpm check:pendencias          # lista provisórios e pendências
pnpm check:pendencias --estrito  # falha se sobrar provisório ou pendência que trava
```

## Onde mexer

- Todo texto: `src/content/site.ts`. Nenhuma string de interface em componente.
- Valores provisórios (WhatsApp, CNPJ, logo, fotos, vídeo, política): `src/content/provisorios.ts`. Quando todos forem trocados, o noindex sai.
- Identificadores das opções do diagnóstico: `src/content/opcoes.ts` (pequeno de propósito, vai ao cliente).
- Pendências: `PENDENCIAS.md` (o script lê os `- [ ]`).
- Melhorias futuras: `BACKLOG.md`. **Ao revisar o site inteiro, leia esse arquivo primeiro e execute o que estiver nele.**

## Design system

Fonte da verdade: `docs/design-system/sa-tokens.css` (importado em `globals.css`) e `docs/design-system/sa-components.css` (portado para `@layer components` em `globals.css`).

- Pílula é escolha. Retângulo de canto 4 px é ação. Linha de largura total é conteúdo que se abre (Dúvidas).
- 60% escuro (`--bg` #1A1A1A), 30% claro (giz), âmbar no máximo 10%: botão principal, opção selecionada, etapa ativa, fundo do CTA final. "Quem faz" fica sobre `--surface`, parado e sem vídeo, para destacar as pessoas. Laranja forte (`--accent-forte` #D9531A, variação escura da base #FF751F) só em degradê, ícone e número grande, nunca em texto pequeno.
- Tema por seção com `data-theme`. Não existe alternância de tema nem `prefers-color-scheme`.
- Duas famílias (`next/font/google`): Montserrat (primária, do guia de identidade da SA) nos títulos `display` e `titulo-1/2/3`; Poppins (secundária, 400/500/600, `--font-texto`) em textos, botões e rótulos, por coerência com a apresentação comercial. Caixa normal sempre; nada de destacar palavra do título.
- `@theme` zera a paleta do Tailwind: só existem as cores, raios e sombras dos tokens. No shadcn, `accent` é o âmbar; hover usa `--surface-hover`.
- Anime só `opacity`, `transform`, `background-color`, `border-color` e `color`. Nunca `transition: all`. Hover dentro de `@media (hover: hover)`.
- Movimento (pedido do cliente depois da primeira versão): vídeos de fundo com transparência no hero e em Frentes (`VideoFundo`), brilho âmbar em CSS no hero, faixa neutra das etapas que corre (discreta para não competir com o botão), funil animado no Método, formas que andam no CTA final, números da prova social que sobem contando (`Contador`) e revelação ao rolar só em CSS (`.sa-revela`, `animation-timeline: view()`). Tudo desliga com `prefers-reduced-motion`, menos os vídeos de fundo e o `Contador` (decisão do cliente; o contador só troca o texto). O contador anima toda vez que entra na tela.
- Vídeo de fundo: o do primeiro slide tem `autoplay` nativo (`automatico`); os demais começam 400 ms depois do `load` (ou na primeira interação). Nunca esconder o vídeo com opacidade 0 esperando o `playing`: o Safari do iPhone não dá autoplay em vídeo invisível. Pedido do cliente: antes esperava a interação para não disputar o LCP no celular; se o LCP piorar, é aqui. Sem botão de pausa e tocando mesmo com movimento reduzido (decisão do cliente: é só fundo, roda em laço), MP4 (H.264) primeiro, porque é o que o iPhone toca, e WebM de reserva. Se o play for recusado (economia de dados no Opera/Chrome, bateria no iPhone), o vídeo ganha `data-bloqueado` (zoom lento no quadro parado) e tenta de novo a cada toque; rolar a página não libera, só toque ou clique.

## Regras de copy

- Frase curta, segunda pessoa ("você"), sobre vender. "A SA" ou "a gente" para a empresa.
- Proibido: soluções, potencializar, alavancar, transformar, jornada, ecossistema, 360, inovador, alto impacto, de ponta.
- Sem travessão, sem emoji, sem ponto de exclamação, sem "não é X, é Y", sem trio de adjetivos.
- Botão diz o que acontece. Nunca "Saiba mais", "Enviar" ou "Clique aqui".
- Erro diz o que falta e como corrigir, sem pedir desculpa.

## Prova social: exemplos só para posicionar

A SA ainda não tem depoimentos, números, logos de clientes nem cases reais.
Por pedido do cliente, o bloco `ProvaSocial` mostra exemplos fictícios de
`src/content/provas-exemplo.ts` (marcados com a etiqueta "Exemplo") enquanto
`provasExemplo` estiver `true` em `provisorios.ts`. Prova real entra em
`provaSocial` (site.ts) e substitui os exemplos sozinha. Com `provasExemplo`
em `false` e as listas vazias, a seção some (standby). Nunca misture exemplo
com dado real nem tire a etiqueta dos exemplos. Número real só com fonte;
depoimento real só com nome, empresa e autorização. "O que a SA publica"
continua oculta enquanto a lista de Reels estiver vazia.

## Decisões de arquitetura que não são óbvias

- **Hero.** A primeira pergunta aparece num cartão que é um botão só (`.sa-hero-cta`); ele abre o diagnóstico na tela 1, com as opções.
- **CTAs por delegação.** Os botões que abrem o diagnóstico são HTML do servidor com `data-diagnostico`. Um único cliente, `DiagnosticoProvider`, escuta cliques, foco e ponteiro no documento e carrega o diálogo com `next/dynamic` na primeira intenção ou no ócio do navegador. Sem JavaScript, os botões somem e links para o WhatsApp entram no lugar (`<noscript>`).
- **Conteúdo fora do bundle.** Componentes de cliente recebem textos por props; só o diálogo (carregado sob demanda) importa `site.ts`. Ao criar componente de cliente, não importe `@/content/site`.
- **Acordeão legível sem JS.** O `AccordionContent` do shadcn foi reescrito para manter o conteúdo fechado no HTML (escondido por CSS); o do Radix desmonta o conteúdo.
- **LCP.** O `h1` é um bloco de texto só (linhas separadas por `<br>`) e entra só com `transform`. Esmaecer o texto ou animar cada linha em bloco tira o título da disputa de LCP no Chrome.
- **Fontes de reserva.** `next/font` gera a reserva com `size-adjust` para Montserrat e Poppins (CLS 0). As faces "SA Reserva" em `globals.css` eram da Bricolage e ficaram sem uso.
- **Cores puras.** #000000 e #FFFFFF só na logo; fundos e textos usam #1A1A1A e #F5F5F3 (decisão do cliente).
- **Métricas próprias.** Só depois do "Aceitar": `AvisoCookies` importa `src/lib/metricas/coletor.ts` sob demanda (fora do bundle inicial). Lotes vão por `sendBeacon` para `POST /api/eventos`, que valida com zod (`esquema.ts`), acrescenta país/cidade dos cabeçalhos da Vercel e o aparelho pelo User-Agent, troca o IP por um código diário com sal e grava em Postgres (`EVENTOS_DATABASE_URL`, esquema e visões em `db/metricas.sql`). Ligar o banco está no `BACKLOG.md`. Nunca coletar o que a pessoa digita nem dado do lead. "Preferências de cookies" no rodapé reabre o aviso; recusar apaga os códigos do navegador. Ao coletar dado novo, atualize a política em `site.ts`.
- **Frentes em rolagem guiada.** Painéis sempre abertos (sem acordeão); `FrenteAtiva` marca com `data-ativa` o painel que cruza a faixa a 30% da tela e o índice (lateral fixo no computador, faixa de pílulas fixa no celular) acompanha. Nada muda de altura ao rolar. O clique no índice rola com desconto do cabeçalho.
- **Carrossel.** Setas, pontos, teclado (← →) e arrastar com o dedo (`touch-action: pan-y`: o gesto vertical continua rolando a página).
- **Lead.** `POST /api/lead` valida com o mesmo esquema zod do formulário, responde na hora e encaminha ao CRM com `after()`, tempo limite de 5 s. Falha do webhook nunca bloqueia; nunca logar dado pessoal em produção.
