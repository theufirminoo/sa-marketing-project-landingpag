# Relatório de entrega: landing page da SA Marketing

## 1. O que foi entregue

A página nova da SA Marketing está pronta para teste. Quem chega pelo
Instagram vê a pergunta "O que mais trava suas vendas hoje?" logo na primeira
tela, toca numa resposta e faz o diagnóstico de 3 perguntas. No fim, a página
indica por qual frente começar e abre o WhatsApp da SA com as respostas já
escritas. O site também explica o método das cinco etapas, as quatro frentes,
quem são os sócios e responde às dúvidas mais comuns. Nada foi inventado:
não há depoimento, número ou cliente na página, e tudo o que ainda é
provisório (WhatsApp, CNPJ, logo, fotos, vídeo e política) aparece numa faixa
"Versão de testes" no topo, que some sozinha quando o último item for trocado.

## 2. Como rodar

```bash
pnpm install
cp .env.example .env.local
pnpm dev                 # desenvolvimento, http://localhost:3000
pnpm build && pnpm start # produção local
pnpm lint && pnpm typecheck && pnpm test
pnpm check:pendencias    # --estrito antes do lançamento
```

Variáveis: `NEXT_PUBLIC_WHATSAPP_NUMBER` (provisório `5500000000000`),
`NEXT_PUBLIC_SITE_URL` (`https://samarketing.co.br`), `CRM_WEBHOOK_URL`,
`CRM_WEBHOOK_TOKEN` e `NEXT_PUBLIC_GTM_ID` (vazios). Detalhes no `README.md`.

## 3. Resultados medidos

Medido contra `pnpm build && pnpm start`, Chromium 141 (Playwright) e
Lighthouse 13.

| Medida | Resultado | Meta |
| --- | --- | --- |
| Lighthouse celular (simulado, padrão) | Desempenho 92, Acessibilidade 100, Boas práticas 100, SEO 66 | 90 / 95 / 95 / 95 |
| Lighthouse celular (limitação aplicada de verdade) | Desempenho 96, LCP 1,6 s, CLS 0, TBT 190 ms | |
| Lighthouse computador | Desempenho 100, Acessibilidade 100, Boas práticas 100, SEO 66 | |
| Gravação 4G lento + CPU 4x, de 360 a 1440 px | LCP 0,70 a 0,75 s, CLS 0,000 | LCP ≤ 2,5 s, CLS ≤ 0,1 |
| Maior tarefa longa (mesma gravação) | 166 a 246 ms conforme a rodada | ≤ 200 ms |
| JavaScript da primeira carga de `/` | 163,8 kB gzip (141,3 kB Brotli) | < 170 kB |

- **SEO 66** vem de uma única auditoria: a página está com `noindex` de propósito enquanto houver dado provisório (pedido do prompt). Todas as outras auditorias de SEO passam.
- **LCP simulado do Lighthouse no celular (3,2 s)** é uma estimativa do modelo de simulação, que soma a fonte e os scripts baixados antes do primeiro quadro. Com a limitação aplicada de verdade, o LCP é 1,6 s no Lighthouse e 0,7 s na gravação.
- **Tarefa longa:** a única tarefa acima de 200 ms em algumas rodadas é a avaliação do React DOM (código do framework, ~72 kB gzip). O código da página não gera tarefa longa.
- **Peso do JavaScript:** o Next 16 + React 19 sozinhos já ocupam 135,5 kB gzip (medido numa página vazia). O código da página soma ~28 kB. Os polyfills `noModule` (39 kB) não entram na conta porque navegador moderno não os baixa.

## 4. O que foi verificado no navegador

Verificado (capturas em `docs/revisao/`):

- Capturas de cada seção em 360, 390, 768, 1280 e 1440 px.
- Sem rolagem horizontal de 320 a 1440 px.
- Zero erros e avisos no console, nenhum 404, uma requisição de fonte, nenhum terceiro antes do consentimento.
- Árvore de acessibilidade: um `h1`, títulos sem salto de nível, marcos `header`, `main`, `footer` e dois `nav` com nome, todo controle com nome, toda imagem com descrição, `lang="pt-BR"`.
- Tab pela página inteira: 45 paradas, anel de foco visível em todas, ordem igual à visual.
- Diagnóstico com mouse a partir do hero, com toque a partir de "Começar por esta frente" na SA Tech, e só com teclado a partir do cabeçalho: setas mudam a resposta sem avançar, Enter avança, Esc fecha e devolve o foco ao botão de origem, o foco fica preso no diálogo, "Voltar" preserva as respostas e reabrir retoma de onde parou.
- WhatsApp inválido: mensagem de erro com ícone, `aria-invalid`, `aria-describedby` e foco no campo.
- URL `wa.me` e corpo do `POST /api/lead` conferidos (incluindo UTM e fbclid).
- Webhook do CRM apontando para endereço inválido: a resposta da rota chega em menos de 50 ms, o resultado aparece e o servidor registra a falha sem dado pessoal.
- Estados de repouso, hover, foco e pressionado do botão principal, secundário, opção, opção sobre âmbar, linha de frente, dúvida e links, conferidos pelo estilo computado contra a tabela do design system.
- Movimento reduzido: hero pronto, vídeo parado no pôster, marcação de etapa desligada, diálogo sem transição.
- Sem JavaScript: todo o texto está no HTML servido, as respostas das dúvidas e os subsserviços aparecem, e os botões viram links para o WhatsApp.
- Barra fixa do celular: sobe quando o hero sai, desce no CTA final, e o aviso de cookies fica acima dela.
- GTM: com um ID de teste, nada carrega antes da escolha; depois de "Aceitar", só o `googletagmanager.com`; depois de "Recusar", nada.
- `/ds` em desenvolvimento e as etiquetas "Provisório" (só em desenvolvimento).

Não foi possível verificar:

- Aparelhos reais (iPhone, Android) e leitores de tela reais (VoiceOver, TalkBack). A acessibilidade foi conferida pela árvore de acessibilidade e pelo teclado.
- A abertura real da conversa no WhatsApp: o número provisório não pertence a ninguém.
- Um CRM real, porque o webhook ainda não existe.
- O hover de foto de sócio e de Reel: o código existe, mas ainda não há fotos nem Reels.
- O MCP `chrome-devtools`, o Context7, o 21st.dev e as skills `frontend-design`, `web-design-guidelines` e `react-best-practices` não estavam disponíveis neste ambiente. Usei Playwright com o Chromium do ambiente e o Lighthouse 13 pela linha de comando, a documentação do Next que vem dentro do pacote, e as regras das duas skills da Vercel baixadas do GitHub e aplicadas à mão.

## 5. Decisões tomadas fora do que o prompt definia

- Next 16.4 com Cache Components e Turbopack (padrão do `create-next-app` atual).
- shadcn com base Radix; os componentes vieram do repositório do shadcn no GitHub, porque o registro `ui.shadcn.com` estava bloqueado na rede.
- O conteúdo do acordeão continua no HTML quando fechado (o do Radix some), para o texto ser legível sem JavaScript.
- Os botões que abrem o diagnóstico são HTML do servidor e um único componente de cliente trata os cliques. Assim a página quase toda fica no servidor.
- A entrada do hero é CSS, não `motion`: não espera o JavaScript e não atrasa o LCP.
- O título sobe 16 px inteiro, sem esmaecer e sem atraso por linha. Testei no Chromium 141: esmaecer o texto ou animar cada linha separadamente tira o título da disputa de LCP.
- Pôster provisório em 180 × 320 px (656 bytes), para não virar o LCP no computador. As cores são lisas, então a perda de resolução não aparece.
- Fontes de reserva locais (Arial/Liberation Sans e Roboto) com `size-adjust` medido para cada largura condensada: a troca de fonte não muda a quebra de linha (CLS 0) e não há requisição extra.
- O aviso de cookies aparece na primeira rolagem: nada é medido antes da escolha, e assim ele não cobre a pergunta do hero no celular.
- Reabrir o diagnóstico por qualquer botão retoma de onde parou; "Fazer diagnóstico" só começa na tela 1 quando não há progresso salvo.
- "Começar por esta frente" depois de concluir o diagnóstico recomeça da tela 1, com a frente registrada.
- "Continuar" usa `aria-disabled` em vez de `disabled`, para continuar alcançável pelo teclado.
- `fbclid` e `gclid` vão dentro do objeto `utm` do corpo do CRM.
- O Instagram é normalizado para `@usuario` em minúsculas.
- O lead é encaminhado ao CRM com `after()`: a resposta ao navegador é imediata e o tempo limite de 5 s corre depois.
- O limite de 5 envios por minuto por IP fica em memória; na Vercel vale por instância.
- Links internos da página usam `<a>` simples em vez de `next/link`, para tirar ~3 kB do JavaScript inicial (são só duas páginas).
- O botão do cabeçalho quebra em duas linhas abaixo de 360 px, para não estourar a largura em 320 px.
- As âncoras do menu ficam sem sublinhado em repouso e ganham sublinhado no hover; os demais links seguem a regra de sublinhado sempre.
- Dependências fora da lista: `radix-ui`, `clsx`, `tailwind-merge` e `class-variance-authority` (exigidas pelos primitivos do shadcn) e `tsx` (roda o script `check:pendencias`).

Textos novos, escritos com as regras de copy: aviso de cookies ("A SA só mede as visitas desta página se você aceitar.", "Aceitar", "Recusar"); "Fechar o diagnóstico", "Continuar", "Voltar", "Enviando suas respostas…", "Resultado do diagnóstico" (anúncio para leitor de tela), "Progresso do diagnóstico"; exemplos nos campos "(11) 91234-5678" e "@suaempresa"; descrição do vídeo provisório e "Pausar o vídeo"/"Tocar o vídeo"; "Frentes que cuidam desta etapa" e "O que a SA … faz" (rótulos de lista para leitor de tela); descrições das silhuetas; "© {ano} SA Marketing"; "(abre em nova aba)"; a mensagem dos links sem JavaScript ("Oi, vim pelo site da SA e quero conversar. Trava: …"); e o texto provisório da política de privacidade.

## 6. O que veio do 21st.dev

Nada. O MCP do 21st.dev não estava instalado nesta sessão e não havia chave.
Todos os componentes foram desenhados a partir do design system e do prompt.

## 7. Pendências para publicar

Travam o lançamento:

1. Número real de WhatsApp.
2. CNPJ e razão social reais.
3. Logo em SVG (e ícones definitivos).
4. Fotos dos três sócios, em 4:5.
5. Vídeo vertical real para o hero. Ao trocar, medir de novo o LCP no computador: um pôster com conteúdo pode passar a ser o maior elemento da tela.
6. Texto final da política de privacidade.
7. Confirmação do domínio: samarketing.co.br ou samarketing.com.br.
8. Significado de CCO: Chief Commercial Officer ou Chief Creative Officer.

Melhoram a página, mas não travam:

9. URL, token e campos do webhook do CRM.
10. Três Reels com pôster, legenda e link.
11. ID do GTM e do Pixel da Meta.
12. Revisão do Samuel nos subsserviços e nas faixas de faturamento.
13. Respostas sobre fidelidade de contrato e região de atendimento presencial.
14. Sobrenomes dos sócios, se quiserem mostrar.
15. Primeiros cases, depoimentos e números reais.

A lista completa, com onde trocar cada item, está em `PENDENCIAS.md`.
