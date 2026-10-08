# SA Marketing: landing page

Página única da SA Marketing (samarketing.co.br). O visitante responde 3
perguntas, recebe a frente recomendada e abre uma conversa no WhatsApp com as
respostas já preenchidas. O lead também vai para o CRM, quando houver webhook.

Desenvolvimento: [M9 Studio Tech](https://www.m9studiotech.com.br).

## Como rodar

Requisitos: Node 22 e pnpm 10.

```bash
pnpm install
cp .env.example .env.local   # ajuste as variáveis se precisar
pnpm dev                     # http://localhost:3000
```

Produção local (é o modo usado na revisão):

```bash
pnpm build
pnpm start                   # http://localhost:3000
```

Verificações:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm check:pendencias        # use --estrito antes do lançamento
```

## Variáveis de ambiente

| Variável | Valor inicial | Para que serve |
| --- | --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5500000000000` (provisório) | Número do WhatsApp, só dígitos. Com o provisório a URL `wa.me` é gerada, mas a conversa não abre. |
| `NEXT_PUBLIC_SITE_URL` | `https://samarketing.co.br` | Canônico, Open Graph e sitemap. |
| `CRM_WEBHOOK_URL` | vazio | Recebe o lead (POST JSON). Vazio: em desenvolvimento o corpo aparece no console do servidor. |
| `CRM_WEBHOOK_TOKEN` | vazio | Enviado como `Authorization: Bearer`. |
| `NEXT_PUBLIC_GTM_ID` | vazio | Google Tag Manager. Só carrega depois do "Aceitar" no aviso de cookies. |

## Estrutura

```
src/
  app/            layout, página, /privacidade, /api/lead, OG, ícones, sitemap, robots, /ds (só em dev)
  components/
    ui/           primitivos do shadcn reestilizados com os tokens
    site/         seções da página
    diagnostico/  diálogo do diagnóstico, telas e estado
  content/        site.ts (todo o texto), provisorios.ts, opcoes.ts
  lib/            lead (zod), whatsapp, recomendacao, utm, analytics
docs/
  design-system/  sa-tokens.css e sa-components.css (fonte da verdade)
  revisao/        capturas da revisão no navegador
  PROMPT.md       briefing original
scripts/          check-pendencias.ts
```

## Corpo enviado ao CRM

```json
{
  "origem": "landing-sa",
  "enviadoEm": "2026-10-07T14:03:00.000Z",
  "nome": "Ana", "whatsapp": "5511912345678", "empresa": "Padaria Pão Bom", "instagram": "@padariapaobom",
  "trava": "seguidores-nao-vendem", "fase": "constancia", "faturamento": "20-50",
  "frenteDeInteresse": "tech",
  "frentesRecomendadas": ["tech", "consultoria", "social"],
  "utm": { "source": "instagram", "medium": "pago", "campaign": "outubro", "fbclid": "…", "gclid": "…" },
  "pagina": "https://samarketing.co.br/", "referrer": "https://l.instagram.com/"
}
```

`frenteDeInteresse` é `null` quando o diagnóstico não veio de "Começar por
esta frente". `fbclid` e `gclid` entram dentro de `utm` quando existem.

## Deploy

Vercel, sem configuração extra. Configure as variáveis de ambiente no painel.
Antes de publicar, resolva `PENDENCIAS.md` e rode `pnpm check:pendencias --estrito`.

## Valores fora dos tokens

Todos os px e hex em `src/` foram conferidos. Os que não são token:

- Cores literais em `src/app/_og/marca.ts` e `themeColor` em `layout.tsx`: o gerador de imagem e a meta tag não leem variável CSS. São os valores de `--marca-preto`, `--marca-giz` e `--marca-ambar`.
- Bordas de 1 px, anel de foco de 2 px afastado 3 px, sublinhado de 1 e 2 px afastado 4 px, padding de 20 px da pílula, fonte de 16 px nos botões, círculo de 32 px do número da etapa, coluna de 48 px da etapa, sinal de mais e menos de 20 e 16 px, linha mínima de 72 px da dúvida, trilha de 4 px do progresso, colunas `minmax(180px…)` e `minmax(140px…)`: vêm de `sa-components.css`.
- `--radius-sm/md/pill` no `@theme`: espelham os tokens para gerar as classes `rounded-*` do Tailwind.
- 17 px no `body` e nos campos: estilo `corpo` e o tamanho que impede o zoom do iOS.
- 560 px do diálogo e do aviso de cookies: largura definida no prompt.
- 160 px do ladrilho do grão; `-10000px` do campo isca; 1 px de ajuste óptico do ícone de erro; `-2px` de afastamento do anel na linha de frente (para não sair da linha invertida).
- Fontes de reserva (`size-adjust` e `*-override` em `globals.css`): medidas contra a Bricolage, não são escolha visual.
- 40 ms entre as opções na entrada do hero (`--atraso-opcao`): definido no prompt.
