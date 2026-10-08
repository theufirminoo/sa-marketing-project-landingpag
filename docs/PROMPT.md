# Prompt: landing page da SA Marketing

Cole este arquivo inteiro como primeira mensagem de uma sessão nova do agente de código, na raiz de um repositório vazio. Antes, coloque `sa-tokens.css` e `sa-components.css` em `docs/design-system/`.

---

<papel>
Você é o responsável técnico e de design por uma landing page de produção. Você decide, constrói, testa no navegador e só entrega o que verificou. Você trabalha como um estúdio pequeno e exigente trabalharia: escolhas deliberadas, nada de padrão genérico, nada inventado sobre o cliente.

Quem vai ler o seu trabalho: Matheus, desenvolvedor e sócio de tecnologia, e Samuel, dono da SA Marketing, que não é técnico. Escreva o código para o primeiro e o relatório final para o segundo.
</papel>

<contexto>
## A empresa

A SA Marketing (Instagram @samarketing.business) é uma agência nova que atende pequenas e médias empresas. Não diga "pequenas e médias" na página: isso orienta o tom, não é texto. A SA vende quatro frentes:

| Frente | Papel | Promessa |
| --- | --- | --- |
| SA Consultoria | Porta de entrada | Descobre onde a venda trava e monta o plano. |
| SA Social | Execução | Conteúdo e anúncios que levam o seguidor até a compra. |
| SA Studio | Execução | Vídeo e foto que fazem a marca parecer do tamanho que ela quer ter. |
| SA Tech | Execução | Site, sistema e automação para vender e atender sem trabalho manual. |

## O posicionamento

Quatro frentes soltas passam a imagem de agência que faz de tudo. A página resolve isso com uma ordem: primeiro um diagnóstico, que mostra em qual etapa do funil a venda trava; depois entram só as frentes que resolvem esse ponto.

O funil é da própria SA e aparece nos posts dela: **atrai, educa, qualifica, converte, fideliza**.

## O público

Donos de negócio que chegam pelo Instagram, quase sempre no celular, muitas vezes por anúncio. Não são técnicos. Reconhecem o próprio problema em frases como "tenho seguidores, mas não vendo" e "não consigo vender todos os dias", que a SA já usa nos Reels.

## A referência

A inspiração de estrutura é a home do G4 (g4business.com): um quiz de entrada ("3 perguntas rápidas"), quatro pilares, autoridade por quem executa, FAQ. **Copie a lógica, não o formato.** O G4 é um portal com mega menu, vários banners e oito CTAs; aqui é uma página única com um CTA. De duas operações pequenas vêm as táticas: a Designjoy assume o tamanho como vantagem e tem só dois CTAs; a FletchPMM abre com um checklist de sintomas e descreve exatamente o que o cliente recebe.

## Quem é a SA

Três sócios: Samuel, Chief Executive Officer (CEO); Malaquias, Chief Commercial Officer (CCO); Matheus, Chief Technology Officer (CTO). O site será publicado em samarketing.co.br. O desenvolvimento é da M9 Studio Tech (www.m9studiotech.com.br), que recebe crédito no rodapé.

## O que a SA ainda não tem

Não há depoimentos, números de resultado, logos de clientes nem cases. **Você não inventa nenhum deles.** A prova desta página é o método, o nome de quem faz e o conteúdo real do perfil.

Alguns dados são provisórios por decisão do cliente: número de WhatsApp, CNPJ, fotos dos sócios e vídeo do hero. Use os valores de `<provisorios>` e mantenha todos fáceis de trocar.
</contexto>

<objetivo>
Construir uma landing page de página única, em português do Brasil, que leve o visitante a concluir um diagnóstico inicial de 3 perguntas, oferecido como cortesia, e abrir uma conversa no WhatsApp com as respostas já preenchidas, gravando o lead no CRM.

Sucesso se mede assim:

1. Um visitante no celular entende o que a SA faz e responde a primeira pergunta sem rolar a tela.
2. O fluxo do diagnóstico funciona de ponta a ponta com teclado, com leitor de tela e com toque.
3. A página carrega rápido em 4G e passa nas metas de qualidade da seção `<criterios_de_aceite>`.
4. Nada na página parece modelo pronto nem texto gerado.
5. Nenhuma afirmação sobre a SA foi inventada; tudo o que falta está em `PENDENCIAS.md`.
</objetivo>

<stack>
- Next.js na versão estável atual, App Router, React Server Components por padrão, TypeScript em modo `strict`.
- Tailwind CSS v4, com os tokens declarados em CSS (`@theme inline`).
- shadcn/ui para primitivos acessíveis: `button`, `dialog`, `accordion`, `radio-group`, `input`, `label`, `form`, `progress`. Todos reestilizados com os tokens deste prompt. O visual padrão do shadcn não pode aparecer.
- `motion` (import de `motion/react`) só para a entrada do hero e a troca de tela do diagnóstico. O resto é CSS.
- `react-hook-form` com `zod` na tela de contato.
- `lucide-react` para os poucos ícones.
- Vitest para os testes unitários.
- `pnpm`. Deploy na Vercel.

Antes de usar a API de qualquer uma dessas bibliotecas, consulte a documentação atual pelo Context7. Não escreva de memória: Next, Tailwind v4 e shadcn mudaram bastante entre versões.

Não adicione dependência fora desta lista sem justificar em uma linha no relatório. Não use biblioteca de carrossel, de partículas, de scroll suave nem de animação por rolagem.
</stack>

<ferramentas>
## Preparação

Verifique o que já está disponível com `/mcp` e com a lista de skills. Instale o que faltar. Se uma ferramenta não puder ser instalada, siga sem ela, use a alternativa indicada e registre no relatório.

`.mcp.json` na raiz do projeto:

```json
{
  "mcpServers": {
    "shadcn": { "command": "npx", "args": ["shadcn@latest", "mcp"] },
    "chrome-devtools": { "command": "npx", "args": ["-y", "chrome-devtools-mcp@latest"] },
    "context7": { "command": "npx", "args": ["-y", "@upstash/context7-mcp"] }
  }
}
```

Comandos avulsos:

```bash
# shadcn-ui-mcp-server (comunidade): código-fonte, demos e blocos do shadcn/ui v4
claude mcp add shadcn-ui -- npx -y @jpisnice/shadcn-ui-mcp-server --github-api-key SEU_TOKEN_GITHUB

# 21st.dev (Magic): chave em 21st.dev/mcp
npx @21st-dev/cli@latest init --client claude

# Skills da Vercel: web-design-guidelines e react-best-practices
npx skills add vercel-labs/agent-skills
```

A skill `frontend-design` é da Anthropic; instale pelo `/plugin` do Claude Code se ela não aparecer na lista de skills.

Os nomes das tools de cada servidor mudam entre versões. Liste as tools disponíveis antes de usar e siga os nomes que aparecerem. O token do GitHub e a chave da 21st são fornecidos pelo Matheus: se faltarem, pergunte uma vez e siga sem eles.

## Quando usar cada uma

| Ferramenta | Use para | Regra |
| --- | --- | --- |
| Skill `frontend-design` | Ler antes de escrever qualquer interface. Fazer o plano de design e a revisão contra os padrões genéricos. | A direção visual deste prompt vence onde ela for específica. A skill decide o que o prompt deixa em aberto. |
| MCP `shadcn` (oficial) | Buscar e instalar componentes do registro no projeto. | Depois de instalar, reescreva as classes para os tokens. |
| MCP `shadcn-ui` (Jpisnice) | Ler o código-fonte e os demos de um componente antes de adaptá-lo. | Só leitura. A instalação é pelo MCP oficial ou pela CLI. |
| MCP 21st.dev | Buscar inspiração e pontos de partida para o hero, o fluxo em etapas, o cabeçalho e a moldura de vídeo. Tools atuais: `get_inspiration`, `search`, `generate`. | O que vier é matéria-prima. Reescreva para os tokens, para o texto deste prompt e para as regras de acessibilidade. Descarte tudo o que trouxer gradiente, vidro fosco, brilho, grade tipo bento, letreiro de logos, emoji ou dependência nova. Registre no relatório o que aproveitou de cada resultado. |
| MCP `context7` | Documentação atual de Next, Tailwind v4, shadcn, Motion, react-hook-form e zod. | Sempre antes da primeira chamada de uma API. |
| Skill `web-design-guidelines` | Auditar `src/**/*.tsx` e `src/**/*.css` ao fim de cada fase. | Corrija todos os achados ou justifique um a um. |
| Skill `react-best-practices` | Revisar componentes de cliente, carregamento e tamanho do bundle na fase final. | Mesma regra. |
| MCP `chrome-devtools` | Ver a página no navegador, testar o fluxo, medir desempenho e rodar o Lighthouse. | Roteiro obrigatório em `<revisao_no_navegador>`. |

Nunca declare uma seção pronta sem ter olhado uma captura dela em 360 px e em 1280 px.
</ferramentas>

<design_system>
A fonte da verdade são os arquivos `docs/design-system/sa-tokens.css` e `docs/design-system/sa-components.css`. Se você tiver a ferramenta Artifact, leia também `project/README.md` do design system em https://claude.ai/artifact/PByQt4D3TzjvwrciBNEt23. Os valores abaixo repetem o essencial e bastam se os arquivos não estiverem no lugar.

## Proporção 60-30-10

| Parte | Como | Onde |
| --- | --- | --- |
| 60% | Tema escuro, `--bg` #1A1A1A (o preto medido na logo) | Hero, Frentes, O que a SA publica, rodapé |
| 30% | Tema claro, `--bg` #F5F5F3 (giz) | Método, Como começa, Dúvidas |
| 10% | `--accent` #F9C155 (âmbar medido nos posts da SA) | Botão principal, opção selecionada, etapa ativa, fundo do CTA final |
| Apoio | `--cafe` #2A211A com `--areia` #C4AD9A | Só a seção Quem faz |

O tema troca por seção, com `data-theme="dark"` ou `data-theme="light"` no `<section>`. Não existe alternância de tema para o visitante e a página não segue `prefers-color-scheme`.

## Tokens de cor

```css
:root, [data-theme="dark"] {
  --bg: #1A1A1A;            --bg-sunken: #0E0E0E;
  --surface: #242424;       --surface-hover: #2E2E2E;
  --border: #3D3D3D;        --border-control: #757575;
  --text: #F5F5F3;          --text-muted: #B8B8B8;
  --accent: #F9C155;        --accent-hover: #FCD98F;   --accent-pressed: #E8A62E;
  --on-accent: #1A1A1A;     --accent-text: #F9C155;    --accent-tint: #3A2A08;
  --focus: #F9C155;         --success: #4CC38A;        --danger: #FF7A6B;
  --cafe: #2A211A;          --areia: #C4AD9A;
  --marca-preto: #1A1A1A;   --marca-giz: #F5F5F3;      --marca-ambar: #F9C155;
  --shadow-dialog: 0 24px 64px rgba(0, 0, 0, 0.6);
}
[data-theme="light"] {
  --bg: #F5F5F3;            --bg-sunken: #ECECEA;
  --surface: #FFFFFF;       --surface-hover: #ECECEA;
  --border: #DEDEDC;        --border-control: #8A8A88;
  --text: #1A1A1A;          --text-muted: #5E5E5E;
  --accent-text: #855800;   --accent-tint: #FCEFD0;
  --focus: #1A1A1A;         --success: #1F7A4D;        --danger: #B42318;
  --shadow-dialog: 0 24px 64px rgba(26, 26, 26, 0.18);
}
```

Regras de uso:

- Texto sobre `--bg` e `--surface` é `--text`; apoio é `--text-muted`.
- Sobre `--accent` o texto é `--on-accent`. No fundo âmbar do CTA final, botão e contornos usam `--marca-preto`.
- `--accent` nunca é cor de texto no tema claro (1,5:1). Para texto em destaque use `--accent-text`.
- `--border` é só linha divisória. Contorno de controle usa `--border-control`, que mantém 3:1.
- Estado nunca é comunicado só por cor: seleção ganha um visto, erro ganha texto.
- Sem gradiente. Sem cor por frente. Sem preto ou branco puros como fundo de seção.

Contraste medido (WCAG 2): `--text` sobre `--bg` 15,9:1 nos dois temas; `--text-muted` sobre `--bg` 8,8:1 no escuro e 5,9:1 no claro; `--on-accent` sobre `--accent` 10,6:1; `--accent-text` sobre `--bg` 5,7:1 no claro; `--areia` sobre `--cafe` 7,4:1. Se você criar qualquer par novo, calcule antes de usar.

## Ponte para o shadcn

Mapeie as variáveis que os componentes do shadcn esperam, para que herdem os tokens:

```css
:root, [data-theme] {
  --background: var(--bg);           --foreground: var(--text);
  --card: var(--surface);            --card-foreground: var(--text);
  --popover: var(--surface);         --popover-foreground: var(--text);
  --primary: var(--accent);          --primary-foreground: var(--on-accent);
  --secondary: var(--surface-hover); --secondary-foreground: var(--text);
  --muted: var(--surface-hover);     --muted-foreground: var(--text-muted);
  --accent-foreground: var(--text);
  --destructive: var(--danger);
  --input: var(--border-control);    --ring: var(--focus);
  --radius: 4px;
}
```

Atenção: o shadcn usa `--accent` para fundo de hover; aqui `--accent` é o âmbar. Onde um componente do shadcn usar `bg-accent` como hover, troque para `bg-[var(--surface-hover)]`. Confira isso em cada componente instalado. Declare os tokens no Tailwind v4 com `@theme inline` (`--color-bg: var(--bg)` e assim por diante), conforme a documentação atual.

## Tipografia

Uma família só: **Bricolage Grotesque**, variável em peso (200 a 800), largura (75 a 100) e tamanho óptico (12 a 96). Carregue com `next/font/google`, com os eixos `opsz` e `wdth`, `display: "swap"`, subset `latin`, exposta como `--font-sans`. Confirme os eixos na documentação antes de configurar.

| Estilo | Tamanho | Altura | Peso | Largura | Espaçamento | Uso |
| --- | --- | --- | --- | --- | --- | --- |
| `display` | clamp(44px, 7.2vw, 104px) | 0.95 | 700 | 78% | -0.02em | Só o título do hero |
| `titulo-1` | clamp(32px, 4.4vw, 56px) | 1.05 | 650 | 84% | -0.015em | Título de seção |
| `titulo-2` | clamp(24px, 2.6vw, 34px) | 1.15 | 600 | 90% | -0.01em | Nome de frente e de etapa, pergunta do diagnóstico |
| `titulo-3` | 20px | 1.3 | 600 | 100% | 0 | Pergunta do FAQ, nome de pessoa, título de passo |
| `lead` | 20px | 1.5 | 400 | 100% | 0 | Subtítulo do hero, abertura de seção |
| `corpo` | 17px | 1.6 | 400 | 100% | 0 | Texto corrido |
| `pequeno` | 14px | 1.5 | 400 | 100% | 0 | Microtexto, ajuda de campo, rodapé |
| `rotulo` | 13px | 1.4 | 500 | 100% | 0.01em | Rótulo de campo, contador, etiqueta |

- A largura é `font-stretch`. `font-optical-sizing: auto` fica ligado.
- Tudo em caixa normal. Caixa alta não existe nesta página, nem em rótulo.
- Não destaque uma palavra do título com outra cor, peso ou itálico.
- `text-wrap: balance` nos títulos; `tabular-nums` em números de etapa e contadores.
- Linhas de texto corrido com no máximo 72 caracteres; `lead` com no máximo 60.
- Alinhamento à esquerda em tudo. Só o CTA final é centralizado.

## Espaço, grade e forma

- Base de 4 px. Passos permitidos: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Largura máxima do conteúdo 1200 px; margem lateral de 16 px no celular e 24 px a partir de 768 px.
- Padding vertical de seção: 64 px no celular, 96 px a partir de 1024 px. Hero e CTA final: 128 px a partir de 1024 px.
- Grade de 12 colunas com calha de 24 px. Bloco de texto e FAQ com no máximo 680 px.
- Pontos de quebra: 360 (base), 768, 1024, 1280.
- Raio de 4 px em botões, campos, cartões e mídia; 8 px no diálogo e na moldura do vídeo; 999 px só em opções de resposta e etiquetas de frente.
- **Pílula é escolha. Retângulo de canto 4 px é ação. Linha de largura total é conteúdo que se abre.** Não quebre essa regra.
- Seções se separam por troca de fundo; itens se separam por linha `--border` de 1 px.
- Uma sombra, `--shadow-dialog`, só no diálogo e na barra fixa do celular. Cartões não têm sombra.
- Fundos escuros recebem um grão fino e estático: um SVG `feTurbulence` em data URI, com 4% a 6% de opacidade e `pointer-events: none`. Fundos claros ficam lisos.
- Altura mínima de todo alvo de toque: 48 px.
- Camadas: cabeçalho 40, barra fixa do celular 40, diálogo 50.

## Movimento

| Token | Valor | Uso |
| --- | --- | --- |
| `--dur-rapida` | 120ms | Hover e pressionar |
| `--dur-base` | 200ms | Abrir linha e dúvida; troca de tela do diagnóstico |
| `--dur-lenta` | 320ms | Abrir o diálogo; inversão da linha de frente |
| `--dur-hero` | 600ms | Entrada do título do hero |
| `--ease-saida` | cubic-bezier(0.2, 0, 0, 1) | Toda transição |

- **Um único momento coreografado**: na carga do hero, as linhas do título sobem 16 px e aparecem em 600 ms, com 60 ms entre linhas; em seguida as cinco opções aparecem com 40 ms entre elas. O vídeo já está no lugar.
- Nenhuma seção entra animada ao rolar. Não use revelação por rolagem.
- Na seção Método, a etapa no centro da tela recebe `aria-current="step"` via `IntersectionObserver`. É a rolagem do visitante que move o estado.
- Anime só `opacity`, `transform`, `background-color`, `border-color` e `color`. Nunca `transition: all`.
- Hover dentro de `@media (hover: hover)`. Todo hover tem equivalente de foco.
- Com `prefers-reduced-motion: reduce`: o hero aparece pronto, o vídeo fica no pôster, a marcação de etapa por rolagem é desligada e as transições viram troca instantânea.

## Estados de cada controle

| Controle | Repouso | Hover | Pressionado | Foco | Desabilitado ou erro |
| --- | --- | --- | --- | --- | --- |
| Botão principal | fundo `--accent`, texto `--on-accent` | `--accent-hover` | `--accent-pressed`, 1 px para baixo | anel `--focus` 2 px, afastado 3 px | fundo `--surface-hover`, texto `--text-muted` |
| Botão secundário | contorno `--border-control`, texto `--text` | fundo `--surface-hover`, contorno `--text` | fundo `--surface` | anel | igual ao principal |
| Botão sobre âmbar | fundo `--marca-preto`, texto `--marca-giz` | fundo `--cafe` | `--marca-preto` | anel `--marca-preto` | não se aplica |
| Opção | contorno `--border-control`, fundo transparente | fundo `--surface-hover`, contorno `--text` | preenche com `--accent`, texto `--on-accent`, ganha o visto | anel | contorno `--border`, texto `--text-muted` |
| Opção sobre âmbar | contorno e texto `--marca-preto` | fundo `--marca-preto`, texto `--marca-giz` | igual ao hover | anel `--marca-preto` | não se aplica |
| Campo | fundo `--surface`, contorno `--border-control` | contorno `--text` | não se aplica | contorno `--text` e anel | contorno `--danger`, mensagem em `--danger` |
| Linha de frente | linha `--border` acima | a linha inteira inverte: fundo `--text`, texto `--bg` | abre | anel | não se aplica |
| Dúvida | linha `--border` acima | pergunta em `--accent-text` | abre | anel | não se aplica |
| Link | sublinhado 1 px, afastado 4 px | `--accent-text`, sublinhado 2 px | não se aplica | anel | não se aplica |
| Foto de pessoa | 4:5 | amplia para 1,03 | não se aplica | não se aplica | não se aplica |
| Vídeo de Reel | 9:16 com pôster | amplia para 1,03 e mostra o ícone de tocar | abre o Reel | anel | não se aplica |

A inversão da linha de frente é o único hover de área grande. Não acrescente outro.

## Iconografia e imagem

- Lucide, traço 1,5 px, 20 px, na cor do texto ao lado. Ícone só quando substitui uma palavra ou marca um estado: fechar, visto, erro, tocar, pausar.
- Sem ícone decorativo por frente. Sem seta no fim de botão ou link. Os sinais de mais e menos são desenhados em CSS.
- Na versão final, só fotos e vídeos reais da SA. Sem ilustração e sem imagem gerada. As duas exceções provisórias são o vídeo do hero e a silhueta dos sócios, descritas em `<pagina>`.
- Retratos 4:5, vídeos 9:16. Toda imagem com `width`, `height` e `alt` que descreve o que mostra.

## Logo

O único arquivo recebido é um PNG de 150 × 150 px, preto sobre fundo branco. Não redesenhe o monograma, não o vetorize e não o inverta por filtro. O SVG será enviado depois. Até lá, o cabeçalho e o rodapé mostram o nome "SA Marketing" em texto, peso 600. Deixe o componente `Logo` pronto para receber `public/logo-sa.svg` e registre a pendência.
</design_system>

<voz_e_copy>
A página fala como os Reels da SA: frase curta, direta, na segunda pessoa, sobre vender.

- Fale de venda, cliente e dinheiro. Palavras proibidas: soluções, potencializar, alavancar, transformar, jornada, ecossistema, 360, inovador, alto impacto, de ponta.
- "Você" para o visitante; "a SA" ou "a gente" para a empresa.
- Caixa normal. Título que é frase leva ponto final.
- Um título diz uma coisa só.
- O botão diz o que acontece. Nunca "Saiba mais", "Enviar" ou "Clique aqui".
- Sem travessão, sem emoji, sem ponto de exclamação.
- Não use a construção "não é X, é Y" nem listas de três adjetivos.
- Número só entra se for real e tiver fonte. Depoimento só com nome, empresa e autorização.
- Mensagem de erro diz o que falta e como corrigir, sem pedir desculpa.

Use os textos da seção `<pagina>` como estão. Se precisar escrever um texto que não está lá, siga estas regras e liste o texto novo no relatório.
</voz_e_copy>

<pagina>
Todo texto fica em `src/content/site.ts`, tipado. Nenhuma string de interface dentro de componente.

## Cabeçalho

- Fixo, 64 px. Transparente sobre o hero; depois de 8 px de rolagem ganha fundo `--bg` e linha `--border` embaixo, em 200 ms.
- Esquerda: logo. Centro, só a partir de 1024 px: âncoras "Método", "Frentes", "Quem faz", "Dúvidas". Direita: botão principal "Fazer diagnóstico", que abre o diagnóstico na tela 1.
- No celular: só logo e botão. Sem menu hambúrguer.
- Primeiro elemento focável da página: link "Pular para o conteúdo".
- Seções com `scroll-margin-top: 64px`.

## 1. Hero (tema escuro)

- Título (`display`, `h1`): **Descubra onde o seu marketing para de vender.**
- Subtítulo (`lead`): Responda 3 perguntas e converse com a SA pelo WhatsApp. Você sai sabendo qual etapa está falhando e o que fazer primeiro.
- Pergunta (`titulo-3`): **O que mais trava suas vendas hoje?**
- Cinco opções, nesta ordem:
  1. Tenho seguidores, mas não vendo
  2. Não consigo vender todos os dias
  3. Dependo só de indicação
  4. Meus processos são manuais
  5. Não sei por onde começar
- Microtexto (`pequeno`, `--text-muted`): 3 perguntas, 1 minuto. O diagnóstico inicial é cortesia.

Comportamento: no hero, cada opção é um `<button>` com aparência de pílula. Clicar abre o diagnóstico já na tela 2, com a resposta registrada. Não use `radio` aqui: mudar a seleção com as setas do teclado abriria o diálogo sem a pessoa pedir.

Layout a partir de 1024 px: texto nas colunas 1 a 7; vídeo nas colunas 9 a 12. No celular: título, subtítulo, pergunta e opções empilhadas, em largura total; as três primeiras opções precisam aparecer sem rolar em 360 × 800; o vídeo vem depois.

Vídeo: moldura 9:16, raio 8 px, linha `--border`. `<video muted loop playsInline preload="none">` com pôster. Toca sozinho só se o visitante não pediu movimento reduzido nem economia de dados. Botão de pausar e tocar sempre visível, 48 px, no canto inferior direito. O vídeo real da SA ainda não foi enviado. Use um vídeo provisório: baixe um clipe vertical de licença livre (Pexels, Pixabay ou Coverr), de 6 a 15 segundos, com tema de trabalho, gravação com celular ou bastidor de negócio, sem rosto em primeiro plano e sem marca visível. Converta para 9:16, 720 px de largura, sem áudio, até 2,5 MB, e extraia o pôster do primeiro quadro. Salve em `public/video/hero-provisorio.mp4` e `public/video/hero-provisorio.jpg`. Se não conseguir baixar, gere com `ffmpeg` um clipe neutro de 6 segundos nas cores `--surface` e `--bg`. Registre origem e licença em `PENDENCIAS.md`. O caminho do vídeo e do pôster fica em `src/content/site.ts`.

O título do hero é o elemento de LCP. O vídeo e o pôster não podem atrasá-lo.

## 2. Método (tema claro, `id="metodo"`)

- Título (`titulo-1`): **Marketing é simples: cinco etapas, nesta ordem.**
- Abertura (`lead`): Quando a venda não acontece, uma destas etapas está falhando. O diagnóstico mostra qual.

Lista ordenada. O número de cada etapa vem do contador da lista, porque aqui a ordem é informação.

| Etapa | O que acontece | Quando falha | Frentes |
| --- | --- | --- | --- |
| Atrai | Gente nova descobre a sua marca. | Poucas visualizações e quase nenhum seguidor novo. | SA Social, SA Studio |
| Educa | A pessoa entende o que você vende e por que confiar. | Seguem o perfil, mas ninguém pergunta o preço. | SA Social, SA Studio |
| Qualifica | Você separa quem está pronto para comprar de quem só está olhando. | Muita conversa no direct e pouca proposta enviada. | SA Consultoria, SA Tech |
| Converte | A conversa vira venda. | Você manda o orçamento e a pessoa some. | SA Consultoria, SA Tech |
| Fideliza | O cliente volta e indica. | Todo mês começa do zero. | SA Tech, SA Social |

Cada item: nome em `titulo-2`; frase em `corpo`; "Quando falha: …" em `pequeno` e `--text-muted`; frentes como etiquetas em pílula, não clicáveis. A partir de 1024 px, o título da seção fica fixo à esquerda (`position: sticky`) enquanto a lista rola à direita.

## 3. Frentes (tema escuro, `id="frentes"`)

- Título (`titulo-1`): **Quatro frentes, um plano só.**
- Abertura (`lead`): Você não precisa contratar todas. O diagnóstico indica por onde começar.

Quatro linhas de largura total, com o `accordion` do shadcn em `type="multiple"`. SA Consultoria carrega aberta. Cada linha: nome em `titulo-2`, promessa em `corpo` e `--text-muted`, sinal de mais ou menos. Aberta: subsserviços em duas colunas, separados por linha `--border`, e o link "Começar por esta frente", que abre o diagnóstico com a frente registrada como interesse.

**Não transforme em quatro cartões.** Sem ícone e sem número: as frentes não são uma sequência.

| Frente | Subsserviços |
| --- | --- |
| SA Consultoria | Diagnóstico de negócio; Planejamento estratégico e metas; Estruturação comercial; Posicionamento e oferta; Treinamento de vendas e atendimento; Acompanhamento mensal de indicadores |
| SA Social | Tráfego pago na Meta e no Google; Gestão de perfis e calendário editorial; Roteiro e texto para Reels e carrosséis; Design de posts; Atendimento de directs e comentários; Perfil da Empresa no Google; Parcerias com influenciadores e UGC; Relatório mensal |
| SA Studio | Storymaker, com cobertura em tempo real; Videomaker, com pacote recorrente de Reels; Filmmaker, para vídeo institucional e comercial; Fotografia de produto, equipe e espaço; Captação com drone; Videocast e cortes; Depoimentos de clientes em vídeo |
| SA Tech | Sites e landing pages; Lojas virtuais; Sistemas sob medida: CRM, ERP e painéis; Automações de WhatsApp e Instagram; Atendimento com IA; Integrações e dashboards; Suporte e evolução mensal |

As promessas de cada frente estão na tabela de `<contexto>`.

## 4. Como começa (tema claro)

- Título (`titulo-1`): **Como é começar com a SA.**
- Três passos numerados, em três colunas a partir de 768 px:
  1. **Diagnóstico inicial.** Três perguntas aqui no site e uma conversa pelo WhatsApp, por cortesia da SA. Você sai sabendo qual etapa está falhando.
  2. **Plano.** A SA mostra o que fazer primeiro, com escopo, prazo e valor.
  3. **Execução.** As frentes que o plano pedir entram em campo, cada uma com um responsável.
- Abaixo: botão principal "Fazer diagnóstico" e o microtexto do hero.

## 5. Quem faz (fundo `--cafe`, `id="quem-faz"`)

- Título (`titulo-1`, `--marca-giz`): **Quem cuida do seu negócio.**
- Abertura (`lead`, `--areia`): A SA é um time pequeno. Você fala com quem faz o trabalho.
- Três sócios, nesta ordem, em três colunas a partir de 768 px e uma coluna abaixo disso:

| Nome | Cargo (`pequeno`, `--marca-giz`) | Em português (`pequeno`, `--areia`) |
| --- | --- | --- |
| Samuel | Chief Executive Officer (CEO) | Diretor executivo |
| Malaquias | Chief Commercial Officer (CCO) | Diretor comercial |
| Matheus | Chief Technology Officer (CTO) | Diretor de tecnologia |

- Nome em `titulo-3`. A sigla nunca aparece sozinha: sempre o cargo por extenso primeiro.
- Foto em 4:5. As fotos reais ainda não foram enviadas. No lugar, use uma **silhueta grande** de cabeça e ombros em SVG, na cor `--areia` com 55% de opacidade, sobre `--marca-preto`, ocupando cerca de 80% da largura do quadro e encostada na base. A mesma para os três. Não use foto de banco, avatar gerado nem ilustração de rosto.
- Cada pessoa em `src/content/site.ts` tem o campo `foto?: string`. Com o campo preenchido, o componente troca a silhueta por `next/image` sem outra mudança.
- O significado de CCO precisa de confirmação: pode ser Chief Commercial Officer ou Chief Creative Officer. Use o primeiro e registre a pendência.

## 6. O que a SA publica (tema escuro)

- Título (`titulo-1`): **O que a SA publica.**
- Abertura (`lead`): O mesmo raciocínio que a gente aplica para os clientes está no nosso perfil.
- Três Reels em moldura 9:16: pôster, legenda curta e link que abre o Reel no Instagram em nova aba, com `rel="noopener"`. **Sem embed e sem script do Instagram.**
- Link de texto: "Ver o perfil no Instagram", para https://www.instagram.com/samarketing.business/.

Se a lista de Reels estiver vazia, a seção não é renderizada. Deixe prontas, com listas vazias e portanto invisíveis, as seções `Cases`, `Depoimentos` e `Numeros`, para entrarem neste ponto quando houver dado real.

## 7. Dúvidas (tema claro, `id="duvidas"`)

- Título (`titulo-1`): **Dúvidas antes de começar.**
- `accordion` do shadcn, `type="single"`, recolhível, a primeira aberta. Largura máxima de 680 px. Pergunta em `h3` com `titulo-3`; resposta em `corpo` e `--text-muted`.

| Pergunta | Resposta |
| --- | --- |
| O que a SA Marketing faz? | A SA descobre em qual etapa a sua venda trava e resolve esse ponto. São quatro frentes: SA Consultoria, SA Social, SA Studio e SA Tech. |
| Preciso contratar todas as frentes? | Não. O diagnóstico mostra qual etapa está falhando e você começa só pela frente que resolve esse ponto. |
| Como funciona o diagnóstico inicial? | Você responde três perguntas aqui no site e continua a conversa com a SA pelo WhatsApp. O diagnóstico inicial é cortesia. |
| Quanto custa trabalhar com a SA? | Depende das frentes e do tamanho do trabalho. Você recebe a proposta com escopo, prazo e valor depois do diagnóstico inicial. |
| Em quanto tempo vejo resultado? | Depende da etapa que está travando. Anúncios costumam dar sinal nas primeiras semanas; conteúdo e posicionamento levam alguns meses. O plano traz o prazo esperado de cada frente. |
| Quem vai cuidar do meu negócio? | Os sócios da SA: Samuel, Malaquias e Matheus. O time é pequeno e você fala com quem faz o trabalho. |
| Para que tipo de negócio a SA trabalha? | Para negócios de qualquer segmento que querem vender com mais constância, de quem está começando a quem já tem equipe e quer organizar o processo. |
| Já tenho quem cuide das minhas redes ou do meu site. Faz sentido conversar? | Sim. O diagnóstico olha o caminho inteiro da venda. A SA entra só na etapa que está falhando e trabalha junto com o que já funciona. |
| A SA cria sites, sistemas e automações? | Sim, pela SA Tech: sites e landing pages, lojas virtuais, sistemas sob medida como CRM e ERP, automações de WhatsApp e Instagram e atendimento com IA. |
| A SA grava vídeos e faz fotos? | Sim, pela SA Studio: cobertura em tempo real, pacotes de Reels, vídeo institucional, fotografia, drone e videocast. |
| O que a SA faz com os dados que eu informo aqui? | Usa só para falar com você sobre o diagnóstico. Os detalhes estão na política de privacidade. |

Todas as onze perguntas vão ao ar. Duas perguntas comuns ficaram de fora porque a SA ainda não definiu a resposta: fidelidade de contrato e região de atendimento presencial. Elas estão em `<pendencias_conhecidas>`; não escreva respostas para elas.

Gere o JSON-LD `FAQPage` só com as perguntas renderizadas.

## 8. CTA final (fundo `--accent`)

- Centralizado. Título (`titulo-1`, `--marca-preto`): **O que mais trava suas vendas hoje?**
- As mesmas cinco opções do hero, na variante sobre âmbar.
- Abaixo: link "Prefere falar direto?", que abre o WhatsApp com a mensagem "Oi, vim pelo site da SA e quero conversar."

## 9. Rodapé (`--bg-sunken`, tema escuro)

Logo; as quatro âncoras; Instagram; WhatsApp; "SA Marketing, CNPJ 00.000.000/0001-00"; link "Política de privacidade" para `/privacidade`; ano corrente gerado em tempo de build. Texto em `pequeno` e `--text-muted`.

Última linha do rodapé: "Desenvolvido por M9 Studio Tech", com o nome como link para https://www.m9studiotech.com.br, em nova aba, com `rel="noopener"`.

O CNPJ é fictício e o texto da política ainda não existe: crie a rota `/privacidade` com uma política provisória curta e honesta (quais dados o formulário coleta, para que servem, como pedir a exclusão pelo WhatsApp ou pelo Instagram) e marque como provisória.

## Barra fixa no celular

Abaixo de 768 px, uma barra presa ao rodapé da tela com o botão "Fazer diagnóstico" em largura total, fundo `--bg`, linha `--border` em cima e `--shadow-dialog`. Ela sobe quando o hero sai da tela e desce quando o CTA final entra. Respeite `env(safe-area-inset-bottom)` e não cubra o conteúdo final da página.

Não existe balão flutuante de WhatsApp.
</pagina>

<diagnostico>
O diagnóstico é o coração da página. Construa e teste este fluxo antes de qualquer seção além do hero.

## Telas

| Tela | Pergunta | Opções | Tipo |
| --- | --- | --- | --- |
| 1 | O que mais trava suas vendas hoje? | As cinco do hero | Única |
| 2 | Em que fase está o negócio? | Começando agora; Já vendo e quero constância; Quero escalar | Única |
| 3 | Quanto o negócio fatura por mês? | Até R$ 20 mil; De R$ 20 mil a R$ 50 mil; De R$ 50 mil a R$ 200 mil; Acima de R$ 200 mil; Prefiro não informar | Única |
| 4 | Para onde a SA manda a resposta? | Nome; WhatsApp com DDD; Empresa (opcional); Instagram da empresa (opcional) | Campos |
| 5 | Resultado | Frente recomendada e botão "Abrir conversa no WhatsApp" | Final |

A barra de progresso conta quatro etapas; a tela 5 é o resultado. Contador em texto: "Etapa 2 de 4".

Regra da frente recomendada, pela resposta da tela 1:

| Resposta | Frentes |
| --- | --- |
| Tenho seguidores, mas não vendo | SA Consultoria e SA Social |
| Não consigo vender todos os dias | SA Consultoria e SA Social |
| Dependo só de indicação | SA Social e SA Studio |
| Meus processos são manuais | SA Tech |
| Não sei por onde começar | SA Consultoria |

Se o diagnóstico foi aberto por "Começar por esta frente", essa frente entra na recomendação em primeiro lugar.

Textos da tela 4: botão "Ver meu resultado"; consentimento em `pequeno`: "Ao continuar, você concorda que a SA use esses dados para falar com você. Veja a política de privacidade."

Textos da tela 5: "Pelo que você contou, o começo é pela {frentes}." e "A SA já recebeu suas respostas. Abra a conversa para combinar o diagnóstico." Botão principal: "Abrir conversa no WhatsApp". Link: "Refazer o diagnóstico".

## Comportamento

- A partir de 768 px: `dialog` do shadcn centralizado, 560 px de largura, fundo `--surface`, raio 8 px, `--shadow-dialog`, fundo da página escurecido. Abaixo de 768 px: tela inteira, com as ações presas ao rodapé e `100dvh`.
- Em tela de resposta única, clicar ou tocar numa opção avança depois de 200 ms. Mudar a seleção com as setas do teclado **não** avança: o botão "Continuar" está sempre presente e fica desabilitado até haver resposta.
- "Voltar" preserva as respostas. Na tela 1 ele não aparece.
- Ao trocar de tela, o foco vai para o título da nova tela (`tabindex="-1"`), e uma região `aria-live="polite"` anuncia "Etapa 3 de 4".
- Esc e o botão de fechar fecham o diálogo e devolvem o foco ao elemento que o abriu. O foco fica preso dentro do diálogo enquanto ele está aberto.
- As respostas ficam em `sessionStorage`, com `try/catch`. Reabrir retoma de onde parou.
- Troca de tela: desliza 16 px e esmaece em 200 ms. Com movimento reduzido, troca seca.

## Validação da tela 4

- Nome: obrigatório, mínimo de 2 caracteres. `autocomplete="given-name"`. Erro: "Informe seu nome para a SA saber com quem fala."
- WhatsApp: obrigatório. Máscara `(11) 91234-5678` enquanto digita; aceita colar com ou sem +55; valida DDD e 10 ou 11 dígitos. `type="tel"`, `inputmode="numeric"`, `autocomplete="tel-national"`. Erro: "Faltam dígitos. Informe o DDD e os 9 números, como (11) 91234-5678."
- Empresa e Instagram: opcionais, com "(opcional)" no rótulo. O Instagram aceita com ou sem @.
- Rótulo sempre visível acima do campo. Validação ao sair do campo e ao enviar, nunca a cada tecla. Erro ligado por `aria-describedby`, com `aria-invalid`. No envio com erro, o foco vai para o primeiro campo inválido.
- Fonte de 17 px nos campos, para o iOS não dar zoom.
- Campo isca (`honeypot`) invisível. Se vier preenchido, responda sucesso e não envie nada.

## Envio do lead

1. `POST /api/lead` (Route Handler). Valide de novo no servidor com o mesmo esquema `zod`.
2. Corpo enviado ao CRM, em `CRM_WEBHOOK_URL`:

```json
{
  "origem": "landing-sa",
  "enviadoEm": "2026-10-07T14:03:00.000Z",
  "nome": "…", "whatsapp": "5511912345678", "empresa": "…", "instagram": "…",
  "trava": "seguidores-nao-vendem", "fase": "constancia", "faturamento": "20-50",
  "frenteDeInteresse": "tech",
  "frentesRecomendadas": ["consultoria", "social"],
  "utm": { "source": "…", "medium": "…", "campaign": "…", "content": "…", "term": "…" },
  "pagina": "…", "referrer": "…"
}
```

3. Capture os parâmetros UTM e `fbclid`/`gclid` na primeira carga e guarde em `sessionStorage`.
4. Encaminhe com tempo limite de 5 s e o cabeçalho `Authorization: Bearer ${CRM_WEBHOOK_TOKEN}` quando o token existir.
5. **A falha do webhook nunca bloqueia o visitante.** Mostre o resultado do mesmo jeito; o WhatsApp leva todos os dados na mensagem. Registre o erro no servidor.
6. Sem `CRM_WEBHOOK_URL`, em desenvolvimento, registre o corpo no console do servidor e responda sucesso.
7. Limite simples por IP na rota: 5 envios por minuto.
8. Nunca escreva dado pessoal em log de produção nem em evento de analytics.

## WhatsApp

Monte `https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`:

```
Oi, aqui é {nome}{, da empresa}. Fiz o diagnóstico no site da SA.
Trava: {trava}
Fase: {fase}
Faturamento: {faturamento}
```

Abra em nova aba. O número real ainda não foi definido: use o provisório `5500000000000`, que não pertence a ninguém. Com ele a URL é gerada e pode ser conferida, mas a conversa não abre de verdade; para testar a abertura real, o Matheus troca a variável pelo próprio número.

## Variáveis de ambiente

| Variável | Valor inicial |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5500000000000` (provisório) |
| `NEXT_PUBLIC_SITE_URL` | `https://samarketing.co.br` |
| `CRM_WEBHOOK_URL` | vazio |
| `CRM_WEBHOOK_TOKEN` | vazio |
| `NEXT_PUBLIC_GTM_ID` | vazio |

Entregue um `.env.example` comentado com esses valores. Não crie `.env` com segredos.
</diagnostico>

<qualidade>
## Acessibilidade (WCAG 2.2 AA)

- `<html lang="pt-BR">`. Um `h1`. Títulos em ordem, sem pular nível. Marcos `header`, `main`, `footer` e `nav` com `aria-label`.
- Tudo funciona só com teclado. A ordem de foco segue a ordem visual. O anel de foco nunca é removido.
- Nada de `div` clicável: ação é `button`, navegação é `a`.
- Contraste conforme `<design_system>`. Estado nunca só por cor.
- `prefers-reduced-motion` respeitado em tudo o que se move.
- Vídeo com controle de pausa. Nenhum conteúdo pisca.
- A página funciona com zoom de 200% e com texto ampliado, sem rolagem horizontal em 320 px de largura.
- O conteúdo das seções é legível sem JavaScript. Só o diagnóstico depende dele; sem JS, o CTA vira link para o WhatsApp.

## Desempenho

- Componentes de servidor por padrão. `"use client"` só em: cabeçalho (estado de rolagem), diagnóstico, vídeo do hero, marcador do método e barra fixa.
- O diálogo do diagnóstico é carregado com `next/dynamic` na primeira intenção: foco ou ponteiro sobre qualquer CTA, ou ociosidade do navegador.
- Imagens com `next/image`, `sizes` correto, AVIF ou WebP. Nada acima da dobra com `loading="lazy"`.
- Vídeo com `preload="none"`, no máximo 2,5 MB, 720 px de largura, sem trilha de áudio.
- Uma família de fonte, uma requisição. Sem fonte de ícone.
- Nenhum script de terceiros antes do consentimento.

## SEO e compartilhamento

- `metadata` completa. Título: "SA Marketing: descubra onde o seu marketing para de vender". Descrição: "Consultoria, social media, audiovisual e tecnologia em um time só. Responda 3 perguntas e converse com a SA pelo WhatsApp."
- Imagem Open Graph gerada com `opengraph-image.tsx`: fundo #1A1A1A, o título do hero em giz e um bloco âmbar. Sem foto.
- JSON-LD `Organization` e `FAQPage`. `sitemap.ts`, `robots.ts` e URL canônica em https://samarketing.co.br. Enquanto houver dado provisório, `robots.ts` bloqueia a indexação.
- Favicon e ícones provisórios com as letras "SA" em giz sobre preto, até a logo vetorial chegar. Registre a pendência.

## Medição e LGPD

- Aviso de cookies discreto, no rodapé da tela, com "Aceitar" e "Recusar" de mesmo peso visual. A escolha fica em `localStorage`.
- O GTM só carrega depois do "Aceitar" e só se `NEXT_PUBLIC_GTM_ID` existir.
- Eventos no `dataLayer`, sem dado pessoal: `diagnostico_aberto` (origem: hero, cabeçalho, frente, como-comeca, cta-final, barra-fixa), `diagnostico_etapa` (número e resposta), `lead_enviado` (frentes recomendadas), `whatsapp_aberto` (origem), `frente_aberta` (frente).
- A tela de contato tem a linha de consentimento e o link para `/privacidade`.
</qualidade>

<o_que_evitar>
Estes são os sinais mais comuns de página gerada. Nenhum pode aparecer:

- Rótulo em caixa alta e espaçada acima de cada título.
- Uma palavra do título em outra cor, em itálico ou com gradiente.
- Grade de cartões idênticos com ícone, título e duas linhas.
- Sombra cinza suave em todo cartão; o mesmo raio em tudo.
- Gradiente decorativo, brilho, vidro fosco, formas borradas ao fundo.
- Animação de entrada em cada seção ao rolar.
- Letreiro de logos rolando, contadores que sobem sozinhos, estatísticas inventadas.
- Numeração 01, 02, 03 em itens que não são sequência.
- Seta no fim de botões e links. Emoji como ícone.
- Fundo creme com serifa e destaque terracota; fundo preto com verde ácido.
- Fonte monoespaçada em rótulos pequenos.
- Texto com "não é X, é Y", travessões e trios de adjetivos.

Gaste a ousadia em um lugar só: o hero que já é a primeira pergunta. O resto fica quieto e disciplinado.
</o_que_evitar>

<estrutura_de_arquivos>
```
src/
  app/
    layout.tsx            fonte, metadata, tema base, aviso de cookies
    page.tsx              composição das seções, só servidor
    globals.css           tokens, ponte do shadcn, estilos de texto, grão
    privacidade/page.tsx
    api/lead/route.ts
    opengraph-image.tsx   sitemap.ts   robots.ts
  components/
    ui/                   primitivos do shadcn, reestilizados
    site/                 Header, Logo, Hero, HeroVideo, Metodo, Frentes, ComoComeca,
                          QuemFaz, Publica, Duvidas, CtaFinal, Footer, BarraFixa, AvisoCookies
    diagnostico/          DiagnosticoProvider, DiagnosticoDialog, TelaOpcoes, TelaContato,
                          TelaResultado, OpcaoChip
  content/site.ts         todo o texto e os dados, tipados
  lib/                    lead.ts (esquema zod), whatsapp.ts, utm.ts, analytics.ts, recomendacao.ts
docs/design-system/       sa-tokens.css, sa-components.css
CLAUDE.md   PENDENCIAS.md   README.md   .env.example
```

`CLAUDE.md` resume, para sessões futuras: comandos, regras do design system (pílula é escolha, retângulo é ação; âmbar no máximo 10%; uma família de fonte), regras de copy e a proibição de inventar prova.

Cobertura mínima de testes (Vitest): `recomendacao.ts`, o esquema `zod` do lead, a normalização do WhatsApp e a montagem da URL `wa.me`.
</estrutura_de_arquivos>

<fases>
Trabalhe nesta ordem. Ao fim de cada fase, rode `pnpm lint`, `pnpm typecheck` e `pnpm build`, faça a revisão no navegador da fase e escreva três linhas de resumo antes de seguir. Não pare para pedir aprovação entre fases.

**Fase 0. Preparação.** Leia este prompt inteiro e os dois arquivos de `docs/design-system/`. Verifique MCPs e skills. Leia a skill `frontend-design`. Consulte no Context7 a documentação atual de Next, Tailwind v4 e shadcn. Escreva um plano curto: o que entendeu, o que vai construir e as dúvidas, com a premissa que adotou para cada uma.

**Fase 1. Fundação.** Crie o projeto. Configure fonte, tokens, ponte do shadcn, estilos de texto, grão e grade. Instale e reestilize os primitivos. Monte uma rota `/ds`, só em desenvolvimento, que mostre cada primitivo nos dois temas e em todos os estados. Compare com `sa-components.css`.

**Fase 2. Hero e diagnóstico.** Cabeçalho, hero, diagnóstico completo, rota do lead, WhatsApp, testes unitários. Percorra o fluxo inteiro no navegador com mouse, só com teclado e em 360 px.

**Fase 3. Seções.** Método, Frentes, Como começa, Quem faz, O que a SA publica, Dúvidas, CTA final, rodapé e barra fixa. Use o 21st.dev para buscar referências antes de cada seção e a regra de descarte de `<ferramentas>`.

**Fase 4. Em volta.** SEO, Open Graph, JSON-LD, aviso de cookies, eventos, `/privacidade`, ícones, faixa de testes e `check:pendencias`.

**Fase 5. Revisão.** Roteiro completo de `<revisao_no_navegador>`. Auditorias `web-design-guidelines` e `react-best-practices`. Corrija e repita até passar em `<criterios_de_aceite>`.

**Fase 6. Entrega.** `README.md`, `PENDENCIAS.md`, `CLAUDE.md` e o relatório de `<relatorio_final>`.
</fases>

<revisao_no_navegador>
Com o MCP `chrome-devtools`, contra `pnpm build && pnpm start`, não contra o servidor de desenvolvimento. Os nomes entre parênteses são as tools da versão atual; use as equivalentes se tiverem mudado.

1. **Capturas.** Abra a página (`new_page`, `navigate_page`). Em 360 × 800, 390 × 844, 768 × 1024, 1280 × 800 e 1440 × 900 (`resize_page`), capture cada seção (`take_screenshot`) e olhe uma a uma. Procure texto cortado, linha órfã, elemento encostado na borda, sobreposição com o cabeçalho ou a barra fixa e desalinhamento com a grade.
2. **Rolagem horizontal.** Em cada largura, e também em 320 px: `evaluate_script` com `document.documentElement.scrollWidth <= window.innerWidth`. Tem de ser verdadeiro.
3. **Console e rede.** `list_console_messages`: zero erros e zero avisos. `list_network_requests`: nenhum 404, nenhuma imagem maior que o tamanho exibido, uma requisição de fonte, nenhum terceiro antes do consentimento.
4. **Árvore de acessibilidade.** `take_snapshot`: um `h1`, títulos em ordem, marcos presentes, todo controle com nome, toda imagem com `alt`.
5. **Teclado.** Com `press_key`, percorra a página inteira com Tab. O foco é sempre visível e segue a ordem visual. Abra o diagnóstico com Enter, responda com setas e Espaço, avance com Enter e feche com Esc. Confirme que o foco volta ao botão de origem.
6. **Hover.** Com `hover`, capture o estado de hover de: botão principal, botão secundário, opção, linha de frente, dúvida, link e foto. Compare com a tabela de estados.
7. **Fluxo completo.** Com `click` e `fill_form`, percorra o diagnóstico duas vezes: uma a partir do hero e uma a partir de "Começar por esta frente" na SA Tech. Teste um WhatsApp inválido e confira a mensagem de erro e o foco. No fim, leia a URL `wa.me` gerada e confira número e texto. **Não envie mensagem real.** Com `list_network_requests` e `get_network_request`, confira o corpo do `POST /api/lead`.
8. **Falha do webhook.** Aponte `CRM_WEBHOOK_URL` para um endereço inválido e repita: o resultado tem de aparecer.
9. **Desempenho.** Com `emulate` (CPU 4x mais lenta, rede 4G lenta), grave a carga com `performance_start_trace` e `performance_stop_trace` e leia os achados com `performance_analyze_insight`. Confirme que o elemento de LCP é o título do hero.
10. **Lighthouse.** `lighthouse_audit` em celular e em computador. Corrija o que estiver abaixo da meta.
11. **Movimento reduzido.** Emule `prefers-reduced-motion: reduce`, se a tool permitir, e recarregue: hero pronto, vídeo parado, nada desliza.
12. **Sem JavaScript.** Confira no HTML servido que o texto de todas as seções está presente.

Depois de cada rodada de correções, repita os passos afetados. Guarde as capturas finais em `docs/revisao/`.
</revisao_no_navegador>

<criterios_de_aceite>
A página está pronta quando tudo abaixo é verdade e foi verificado, não suposto:

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` passam sem erro e sem aviso.
- [ ] Lighthouse em celular: desempenho 90 ou mais; acessibilidade, boas práticas e SEO 95 ou mais.
- [ ] Na gravação com 4G lento e CPU 4x: LCP até 2,5 s, CLS até 0,1, e nenhum bloqueio de interação acima de 200 ms.
- [ ] O JavaScript da primeira carga da rota `/` fica abaixo de 170 kB comprimido. Se passar, explique o que pesa.
- [ ] Zero erros e avisos no console. Zero rolagem horizontal de 320 px a 1440 px.
- [ ] O diagnóstico funciona com mouse, toque e só teclado, a partir de todos os pontos de entrada.
- [ ] A URL do WhatsApp e o corpo do lead batem com `<diagnostico>`.
- [ ] Todos os estados da tabela de estados existem e foram capturados.
- [ ] Nenhuma cor, tamanho, raio ou duração fora dos tokens. Busque por valores hexadecimais e em px soltos em `src/` e justifique cada um.
- [ ] Nenhum item de `<o_que_evitar>` aparece.
- [ ] Nenhum depoimento, número, logo de cliente ou foto inventados. Os únicos dados não reais são os de `<provisorios>`, e a faixa de testes aparece.
- [ ] Todo texto está em `src/content/site.ts` e bate com `<pagina>`.
- [ ] A auditoria `web-design-guidelines` não tem achado em aberto sem justificativa.
- [ ] `PENDENCIAS.md` lista tudo o que falta para publicar, e `pnpm check:pendencias` lista os mesmos itens.
</criterios_de_aceite>

<provisorios>
Valores provisórios, definidos pelo cliente para a fase de testes. Centralize todos em `src/content/provisorios.ts`, exportando também `temProvisorios: boolean`.

| Item | Valor provisório | Troca por |
| --- | --- | --- |
| WhatsApp | `5500000000000` | Número real da SA |
| CNPJ | `00.000.000/0001-00` | CNPJ real |
| Logo | Nome "SA Marketing" em texto | `public/logo-sa.svg` |
| Fotos dos sócios | Silhueta em SVG | Três fotos 4:5 |
| Vídeo do hero | Clipe de licença livre | Vídeo vertical da SA |
| Política de privacidade | Texto provisório curto | Texto revisado |

Enquanto `temProvisorios` for verdadeiro, a página mostra, em qualquer ambiente, uma faixa fina no topo: "Versão de testes: WhatsApp, CNPJ, fotos e vídeo são provisórios." Fundo `--accent-tint`, texto `--text`, `pequeno`, sem botão de fechar. A faixa some sozinha quando o último valor provisório for trocado. É ela que impede a página de ir ao ar com dado falso por esquecimento.

O script `pnpm check:pendencias` lista os provisórios e as pendências; com `--estrito` ele termina com erro se sobrar algum. Rode com `--estrito` antes do lançamento.
</provisorios>

<pendencias_conhecidas>
Registre em `PENDENCIAS.md`, nesta ordem. Não invente substitutos além dos provisórios acima.

Travam o lançamento:

1. Número real de WhatsApp.
2. CNPJ e razão social reais.
3. Logo em SVG.
4. Fotos dos três sócios, em 4:5.
5. Vídeo vertical real para o hero.
6. Texto final da política de privacidade.
7. Confirmação do domínio: samarketing.co.br ou samarketing.com.br.
8. Significado de CCO: Chief Commercial Officer ou Chief Creative Officer.

Melhoram a página, mas não travam:

9. URL e token do webhook do CRM, e os campos que ele espera. Sem isso o lead chega só pelo WhatsApp.
10. Três Reels, com pôster, legenda e link. Sem isso a seção 6 fica oculta.
11. ID do GTM e do Pixel da Meta.
12. Revisão do Samuel nos subsserviços propostos e nas faixas de faturamento da tela 3.
13. Respostas para duas perguntas do FAQ: fidelidade de contrato e região de atendimento presencial.
14. Sobrenomes dos sócios, se a SA quiser mostrá-los.
15. Primeiros cases, depoimentos e números reais, para ligar as seções ocultas.

Em desenvolvimento, todo item provisório ou pendente visível na página leva uma etiqueta discreta "Provisório".
</pendencias_conhecidas>

<quando_perguntar>
Siga sem perguntar em tudo o que este prompt define ou que tem um padrão razoável; registre a premissa. Pare e pergunte só se:

- uma instrução deste prompt contradisser outra de um jeito que muda o resultado;
- for preciso uma credencial que você não tem;
- uma ação puder apagar trabalho existente no repositório.

Se uma ferramenta falhar três vezes seguidas, pare de tentar, use a alternativa e registre.
</quando_perguntar>

<relatorio_final>
Termine com um relatório em português, curto, nesta ordem:

1. **O que foi entregue**, em três a cinco frases que o Samuel entenda.
2. **Como rodar**: os comandos e as variáveis de ambiente.
3. **Resultados medidos**: notas do Lighthouse, LCP, CLS e peso do JavaScript, com os números reais.
4. **O que foi verificado no navegador**, e o que não foi possível verificar.
5. **Decisões que você tomou** fora do que o prompt definia, uma linha cada.
6. **O que veio do 21st.dev** e o que foi descartado.
7. **Pendências** para publicar, na ordem em que travam o lançamento.

Diga claramente o que não funcionou ou ficou incompleto. Não descreva como pronto o que você não testou.
</relatorio_final>
