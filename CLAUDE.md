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

## Design system

Fonte da verdade: `docs/design-system/sa-tokens.css` (importado em `globals.css`) e `docs/design-system/sa-components.css` (portado para `@layer components` em `globals.css`).

- Pílula é escolha. Retângulo de canto 4 px é ação. Linha de largura total é conteúdo que se abre.
- 60% escuro (`--bg` #1A1A1A), 30% claro (giz), âmbar no máximo 10%: botão principal, opção selecionada, etapa ativa, fundo do CTA final. Café e areia só em "Quem faz".
- Tema por seção com `data-theme`. Não existe alternância de tema nem `prefers-color-scheme`.
- Uma família só: Bricolage Grotesque (`next/font/google`, eixos `opsz` e `wdth`). Caixa normal sempre; nada de destacar palavra do título.
- `@theme` zera a paleta do Tailwind: só existem as cores, raios e sombras dos tokens. No shadcn, `accent` é o âmbar; hover usa `--surface-hover`.
- Anime só `opacity`, `transform`, `background-color`, `border-color` e `color`. Nunca `transition: all`. Hover dentro de `@media (hover: hover)`.
- Movimento (pedido do cliente depois da primeira versão): vídeos de fundo com transparência no hero, em Frentes e em Quem faz (`VideoFundo`), brilho âmbar em CSS no hero, faixa neutra das etapas que corre (discreta para não competir com o botão), funil animado no Método, formas que andam no CTA final e revelação ao rolar só em CSS (`.sa-revela`, `animation-timeline: view()`). Tudo desliga com `prefers-reduced-motion`.
- Vídeo de fundo só começa depois da primeira interação (rolar, tocar, teclar): antes disso ele vira o LCP no celular. Sem botão de pausa (pedido do cliente: roda em laço como fundo), WebM primeiro e MP4 de reserva.

## Regras de copy

- Frase curta, segunda pessoa ("você"), sobre vender. "A SA" ou "a gente" para a empresa.
- Proibido: soluções, potencializar, alavancar, transformar, jornada, ecossistema, 360, inovador, alto impacto, de ponta.
- Sem travessão, sem emoji, sem ponto de exclamação, sem "não é X, é Y", sem trio de adjetivos.
- Botão diz o que acontece. Nunca "Saiba mais", "Enviar" ou "Clique aqui".
- Erro diz o que falta e como corrigir, sem pedir desculpa.

## Proibição de inventar prova

A SA ainda não tem depoimentos, números, logos de clientes nem cases. Não
invente nenhum. As seções `Cases`, `Depoimentos`, `Numeros` e "O que a SA
publica" ficam ocultas enquanto as listas em `site.ts` estiverem vazias.
Número só com fonte; depoimento só com nome, empresa e autorização.

## Decisões de arquitetura que não são óbvias

- **CTAs por delegação.** Os botões que abrem o diagnóstico são HTML do servidor com `data-diagnostico`. Um único cliente, `DiagnosticoProvider`, escuta cliques, foco e ponteiro no documento e carrega o diálogo com `next/dynamic` na primeira intenção ou no ócio do navegador. Sem JavaScript, os botões somem e links para o WhatsApp entram no lugar (`<noscript>`).
- **Conteúdo fora do bundle.** Componentes de cliente recebem textos por props; só o diálogo (carregado sob demanda) importa `site.ts`. Ao criar componente de cliente, não importe `@/content/site`.
- **Acordeão legível sem JS.** O `AccordionContent` do shadcn foi reescrito para manter o conteúdo fechado no HTML (escondido por CSS); o do Radix desmonta o conteúdo.
- **LCP.** O `h1` é um bloco de texto só (linhas separadas por `<br>`) e entra só com `transform`. Esmaecer o texto ou animar cada linha em bloco tira o título da disputa de LCP no Chrome.
- **Fontes de reserva calibradas.** `globals.css` declara faces locais (Arial/Liberation Sans e Roboto) com `size-adjust` medido para cada largura condensada, para a troca de fonte não mudar a quebra de linha (CLS 0).
- **Lead.** `POST /api/lead` valida com o mesmo esquema zod do formulário, responde na hora e encaminha ao CRM com `after()`, tempo limite de 5 s. Falha do webhook nunca bloqueia; nunca logar dado pessoal em produção.
