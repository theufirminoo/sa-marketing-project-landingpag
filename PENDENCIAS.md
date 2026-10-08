# Pendências para publicar

Lista do que falta para o site ir ao ar com dado real. `pnpm check:pendencias`
lê este arquivo e `src/content/provisorios.ts` e mostra os mesmos itens.
Marque `[x]` quando um item for resolvido. Antes do lançamento, rode
`pnpm check:pendencias --estrito`: ele termina com erro enquanto sobrar
valor provisório ou pendência que trava o lançamento.

## Travam o lançamento

- [ ] 1. Número real de WhatsApp. Hoje: `5500000000000` (provisório, não pertence a ninguém). Trocar em `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- [ ] 2. CNPJ e razão social reais. Hoje: `SA Marketing, CNPJ 00.000.000/0001-00` (fictício). Trocar em `src/content/provisorios.ts`.
- [ ] 3. Logo em SVG. Hoje o cabeçalho e o rodapé mostram "SA Marketing" em texto. Salvar em `public/logo-sa.svg` e apontar `logoSvg` em `src/content/provisorios.ts`. Os ícones (favicon e Apple) mostram "SA" provisório e também devem trocar.
- [ ] 4. Fotos dos três sócios, em 4:5. Hoje: silhueta em SVG. Salvar em `public/socios/` e preencher `fotosSocios` em `src/content/provisorios.ts`.
- [ ] 5. Vídeo vertical real para o hero e vídeos reais para os fundos (hero, Frentes, Quem faz: bastidor, gravação, cliente; mp4 e webm sem áudio, até 2,5 MB cada, caminhos em `fundos` no `src/content/site.ts`). Hoje são animações abstratas geradas com `ffmpeg` (ver "Origem dos vídeos provisórios" abaixo). Trocar `videoHero` em `src/content/provisorios.ts`. Ao trocar, conferir de novo o LCP no computador: um pôster com conteúdo real pode passar a ser o maior elemento da tela.
- [ ] 6. Texto final da política de privacidade. Hoje: texto provisório curto em `/privacidade`. Trocar em `src/content/site.ts` (`privacidade`) e pôr `politicaProvisoria = false`.
- [ ] 7. Confirmação do domínio: samarketing.co.br ou samarketing.com.br. Hoje: `https://samarketing.co.br` em `NEXT_PUBLIC_SITE_URL`.
- [ ] 8. Significado de CCO: Chief Commercial Officer ou Chief Creative Officer. Hoje: Chief Commercial Officer, Diretor comercial.

## Melhoram a página, mas não travam

- [ ] 9. URL e token do webhook do CRM, e os campos que ele espera. Sem isso o lead chega só pelo WhatsApp. Variáveis `CRM_WEBHOOK_URL` e `CRM_WEBHOOK_TOKEN`; formato do corpo em `src/lib/lead.ts`.
- [ ] 10. Três Reels, com pôster, legenda e link. Sem isso a seção "O que a SA publica" fica oculta. Preencher `publica.reels` em `src/content/site.ts`.
- [ ] 11. ID do GTM e do Pixel da Meta. O GTM entra por `NEXT_PUBLIC_GTM_ID`; o Pixel deve ser configurado dentro do GTM.
- [ ] 12. Revisão do Samuel nos subsserviços propostos e nas faixas de faturamento da tela 3.
- [ ] 13. Respostas para duas perguntas do FAQ: fidelidade de contrato e região de atendimento presencial.
- [ ] 14. Sobrenomes dos sócios, se a SA quiser mostrá-los.
- [ ] 15. Primeiros cases, depoimentos e números reais, para ligar as seções ocultas (`cases`, `depoimentos` e `numeros` em `src/content/site.ts`).

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
