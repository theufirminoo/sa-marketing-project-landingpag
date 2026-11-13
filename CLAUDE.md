# SA Marketing: landing page

Página única em português do Brasil que leva o visitante a um diagnóstico de
3 perguntas e abre o WhatsApp com as respostas preenchidas. O briefing
completo está em `docs/PROMPT.md`; as regras do Next.js desta versão estão em
`AGENTS.md` e em `node_modules/next/dist/docs/`.

## Postura (pedido do cliente)

Seja propositivo sempre: ao fazer o que foi pedido, aponte o que não faz sentido (com o motivo), sugira o que faria sentido acrescentar e recomende uma opção em vez de só listar. Fale de forma direta: o que fazer, onde, como e quando.

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

## Git

- Commits e PRs sem marcas de IA: nada de `Co-Authored-By`, link de sessão ou "Generated with" no fim da mensagem (pedido do cliente).
- Branch de produção: `main` (a Vercel publica a partir dela).

## Design system (resumo; detalhe em `docs/DECISOES.md`)

- Tokens em `docs/design-system/sa-tokens.css`; componentes em `@layer components` no `globals.css`. Só existem as cores, raios e sombras dos tokens.
- Pílula é escolha, retângulo de 4 px é ação. 60% escuro, 30% claro, âmbar no máximo 10%. Laranja forte só em degradê, ícone e número grande.
- Montserrat nos títulos, Poppins no resto. Anime só `opacity`, `transform` e cores; hover dentro de `@media (hover: hover)`; tudo respeita `prefers-reduced-motion` (exceções em `docs/DECISOES.md`).

## Regras de copy

- Frase curta, segunda pessoa ("você"), sobre vender. "A SA" ou "a gente" para a empresa.
- Proibido: soluções, potencializar, alavancar, transformar, jornada, ecossistema, 360, inovador, alto impacto, de ponta.
- Sem travessão, sem emoji, sem ponto de exclamação, sem "não é X, é Y", sem trio de adjetivos. Exceção: as mensagens pré-preenchidas do WhatsApp (são da pessoa para a SA) usam emoji e tom de conversa, por pedido do cliente.
- Botão diz o que acontece. Nunca "Saiba mais", "Enviar" ou "Clique aqui".
- Erro diz o que falta e como corrigir, sem pedir desculpa.

## Regras que não podem falhar

- Componente de cliente não importa `@/content/site` (textos por props). Exceções: o diálogo do diagnóstico e o briefing, que só existem nas suas rotas.
- Nunca logar dado pessoal em produção. Nunca mostrar o FIT ao cliente.
- Prova social: exemplos fictícios só com a etiqueta "Exemplo"; nunca misturar com dado real.
- Ao coletar dado novo, atualizar a política em `site.ts` (`privacidade`).
- Banco: mudanças só por migração nova em `supabase/migrations/` (as já aplicadas não se editam); o site entra como `sa_site`.

## Onde está cada decisão (`docs/DECISOES.md`)

| Mexeu em | Leia a seção |
|---|---|
| Hero, CTAs, diagnóstico, LCP, fontes | Decisões: Hero, CTAs por delegação, LCP, Fontes |
| Frentes, carrossel, WhatsApp flutuante, vídeos | Decisões: Frentes, Carrossel, WhatsApp flutuante; Design system: Movimento e Vídeo |
| Cookies e métricas | Decisões: Métricas próprias |
| Banco, leads, status do lead, Cron | Decisões: Banco comercial, Banco sempre acordado, Lead |
| Briefing (`briefing.saagencia.com.br`) | Decisões: Briefing |
| Bio do Instagram (`bio.saagencia.com.br`) | Decisões: Bio do Instagram |
| Prova social | Prova social |

## Economia de tokens

- Uma sessão por tarefa; ao terminar uma entrega, comece outra conversa.
- Captura de tela, teste no navegador e subagente só quando a mudança for visual ou de risco; prefira `pnpm lint`, `pnpm typecheck` e `pnpm test`.
- Leia trechos de arquivo (offset/limit, grep), não arquivos inteiros.
