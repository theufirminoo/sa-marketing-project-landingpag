# Pendências para publicar

Lista do que falta para o site ir ao ar com dado real. `pnpm check:pendencias`
lê este arquivo e `src/content/provisorios.ts` e mostra os mesmos itens.
Marque `[x]` quando um item for resolvido. Antes do lançamento, rode
`pnpm check:pendencias --estrito`: ele termina com erro enquanto sobrar
valor provisório ou pendência que trava o lançamento.

## Travam o lançamento

- [x] 1. WhatsApp real: (38) 99893-4902 (`5538998934902`), padrão em `src/content/provisorios.ts`; `NEXT_PUBLIC_WHATSAPP_NUMBER` ainda pode sobrescrever.
- [ ] 2. CNPJ e razão social reais. Hoje: `SA Marketing, CNPJ 00.000.000/0001-00` (fictício). Trocar em `src/content/provisorios.ts`.
- [ ] 3. Logo em SVG. Hoje cabeçalho e rodapé usam a logo extraída do portfólio (PDF do Canva) em imagem: `public/logo-sa.webp` e `public/logo-sa-completo.webp`. Com o SVG, salvar em `public/logo-sa.svg` e apontar `logoSvg` em `src/content/provisorios.ts`. Os ícones (favicon e Apple) também devem trocar.
- [x] 4. Fotos dos sócios e dos parceiros: reais, recortadas sobre o mesmo fundo neutro (`public/socios/`).
- [ ] 5. Vídeo vertical real para o hero e vídeos reais para os fundos (hero e Frentes: bastidor, gravação, cliente; mp4 e webm sem áudio, até 2,5 MB cada, caminhos em `fundos` no `src/content/site.ts`). Hoje são animações abstratas geradas com `ffmpeg` (ver "Origem dos vídeos provisórios" abaixo). Trocar `videoHero` em `src/content/provisorios.ts`. Ao trocar, conferir de novo o LCP no computador: um pôster com conteúdo real pode passar a ser o maior elemento da tela.
- [ ] 6. Texto final da política de privacidade. Hoje: texto provisório curto em `/privacidade`. Trocar em `src/content/site.ts` (`privacidade`) e pôr `politicaProvisoria = false`.
- [ ] 7. Confirmação do domínio. A apresentação comercial mostra `agenciasa.com.br`; o site ainda usa `https://samarketing.co.br` em `NEXT_PUBLIC_SITE_URL`.
- [x] 8. Cargos pela apresentação comercial: Samuel CEO (gestor comercial), Malaquias CMO (gestor de tráfego). Matheus: CTO por pedido dele; a apresentação diz COO.

## Melhoram a página, mas não travam

- [ ] 9. URL e token do webhook do CRM, e os campos que ele espera. Sem isso o lead chega só pelo WhatsApp. Variáveis `CRM_WEBHOOK_URL` e `CRM_WEBHOOK_TOKEN`; formato do corpo em `src/lib/lead.ts`.
- [ ] 10. Três Reels, com pôster, legenda e link. Sem isso a seção "O que a SA publica" fica oculta. Preencher `publica.reels` em `src/content/site.ts`.
- [ ] 11. ID do GTM e do Pixel da Meta. O GTM entra por `NEXT_PUBLIC_GTM_ID`; o Pixel deve ser configurado dentro do GTM.
- [ ] 12. Revisão do Samuel nos subsserviços propostos e nas faixas de faturamento da tela 3.
- [ ] 13. Região de atendimento presencial, para o FAQ. (Fidelidade resolvida: projeto mínimo de 3 meses, como no portfólio, já está em "Em quanto tempo vejo resultado?".)
- [x] 14. Nomes completos: Samuel Cezar, Matheus Firmino, Malaquias, Nayara Kelly e Lunna Rodrigues.
- [ ] 15. Primeiros cases, depoimentos e números reais em `provaSocial` (`src/content/site.ts`). Hoje o bloco mostra exemplos fictícios; para deixar em standby, `provasExemplo = false` em `src/content/provisorios.ts`.
- [ ] 16. Banco das métricas próprias: criar um Postgres (Neon, Supabase ou Vercel Postgres), rodar `db/metricas.sql`, pôr `EVENTOS_DATABASE_URL` e `EVENTOS_SAL` na Vercel e agendar a limpeza de 13 meses. Sem isso, os eventos chegam e são descartados.

## Origem dos vídeos provisórios

Os bancos de vídeo livres (Pexels, Pixabay e Coverr) estavam bloqueados pela
rede do ambiente de desenvolvimento. Seguindo o plano B do prompt, o clipe
foi gerado com `ffmpeg`: 6 segundos, 720 × 1280, sem áudio, 31 KB, com faixas
nas cores `--surface` (#242424) e `--bg` (#1A1A1A) deslizando devagar. Não há
imagem de terceiros, então não há licença a registrar. Arquivos:
`public/video/hero-provisorio.mp4` e `public/video/hero-provisorio.jpg`
(pôster tirado do primeiro quadro).

Comando usado:

```bash
ffmpeg -f lavfi -i "color=c=0x1A1A1A:s=720x1280:d=6:r=30" \
  -f lavfi -i "color=c=0x242424:s=300x1280:d=6:r=30" \
  -f lavfi -i "color=c=0x242424:s=720x220:d=6:r=30" \
  -filter_complex "[0][1]overlay=x='mod(t*170+170\,1020)-300':y=0[a];[a][2]overlay=x=0:y='mod(t*250+600\,1500)-220'[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -movflags +faststart public/video/hero-provisorio.mp4
ffmpeg -i public/video/hero-provisorio.mp4 -frames:v 1 -q:v 6 public/video/hero-provisorio.jpg
```

Vídeos de fundo (`public/video/fundo/`) e o novo vídeo vertical do hero
também foram gerados com `ffmpeg`, a partir dos filtros `gradients` e `life`,
nas cores da marca, sem nenhuma imagem de terceiros. Cada um tem versão WebM
(VP9) e MP4 (H.264).

## Mídia provisória de banco de imagens

Vídeos e fotos do Mixkit (https://mixkit.co), licença Mixkit Free License:
uso comercial liberado, sem atribuição obrigatória. Trocar por material da
SA quando houver.

| Arquivo | Origem |
| --- | --- |
| `public/video/fundo/estudio.*` (slide SA Studio) | Mixkit 23267, "Woman doing video editing with headphones" |
| `public/video/fundo/criador-provisorio.*` (fundo do slide 1) | Mixkit 23485, "A young man recording himself with a camera" |
| `public/imagens/hero/*.webp` (slides do carrossel) | quadros dos Mixkit 22998, 9069, 41638 e 4908 |
| `public/video/fundo/reuniao.*` (Frentes) | Mixkit 46680, "Brainstorming over the meeting table" |
| `public/imagens/frentes/consultoria.webp` | quadro do Mixkit 9069, "Digital marketing team leader explains strategy on whiteboard" |
| `public/imagens/frentes/social.webp` | quadro do Mixkit 4908, "Person working while scrolling on social networks" |
| `public/imagens/frentes/studio.webp` | quadro do Mixkit 22016, "Cameraman filming in the city" |
| `public/imagens/frentes/tech.webp` | quadro do Mixkit 4835, "Office workers hands typing on their devices" |
