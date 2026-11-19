# 03. Especificação funcional

Todo texto de interface fica em `src/content/site.ts`; os identificadores
das opções, em `src/content/opcoes.ts`. Regras de copy no `CLAUDE.md`.

## 1. Site (`saagencia.com.br`)

Seções, na ordem: Hero (carrossel; o 1º slide é a pergunta do diagnóstico),
Método (5 etapas com funil), Frentes (SA Consultoria, SA Digital, SA Studio,
SA Tech, em substituição ao rolar), Como começa, Quem faz, O que a SA publica
(oculta sem Reels), Prova social (exemplos marcados "Exemplo" enquanto não
houver prova real), Dúvidas, CTA final, rodapé. WhatsApp flutuante, barra
fixa no celular e aviso de cookies (só na página principal e na política).

Detalhes de comportamento visual (vídeos, LCP, frentes, carrossel) em
`docs/DECISOES.md`.

## 2. Diagnóstico (diálogo no site)

Abre por qualquer botão com `data-diagnostico` ou pelo link `?diagnostico`
(usado pela bio).

| Tela | Pergunta | Opções |
|---|---|---|
| 1 | O que mais trava suas vendas hoje? | Tenho seguidores, mas não vendo · Não consigo vender todos os dias · Dependo só de indicação · Meus processos são manuais · Não sei por onde começar |
| 2 | Em que fase está o negócio? | Começando agora · Já vendo e quero constância · Quero escalar |
| 3 | Quanto o negócio fatura por mês? | Até R$ 10 mil · R$ 10 a 20 mil · R$ 20 a 50 mil · R$ 50 a 200 mil · Acima de R$ 200 mil |
| 4 | Para onde a SA manda a resposta? | Nome, WhatsApp (obrigatórios), empresa e Instagram (opcionais) |
| 5 | Resultado | Frentes indicadas + botão "Enviar no WhatsApp" |

**Regra de recomendação** (`recomendarFrentes`): cada trava aponta para
frentes (seguidores e "todo dia" → Consultoria + Digital; indicação →
Digital + Studio; processos manuais → Tech; não sabe → Consultoria). Se o
diálogo foi aberto por "Começar por esta frente", essa frente vem primeiro.

**Gravação:** um contato por WhatsApp. Refazer atualiza o diagnóstico e soma
em `vezes`. Status do contato: `novo`.

## 3. Briefing (`briefing.saagencia.com.br`)

Para quem já conversou com a SA (o consultor manda o link). Fora da busca
(noindex). Leva cerca de 3 minutos.

### Abertura

Texto + caixa de aceite obrigatória: "Aceito que a SA use minhas respostas e
meu contato para preparar a conversa comigo, como descreve a política de
privacidade." Sem marcar, o briefing não começa ("Marque a caixa acima para
começar."). O servidor também recusa sem o aceite.

### Perguntas (4 capítulos)

| Capítulo | # | Pergunta | Tipo | Opções / regra |
|---|---|---|---|---|
| Sua empresa | 1 | Qual é o ramo do negócio? | Única + "Outro" | Serviços, Comércio e varejo, Saúde e estética, Alimentação, Educação, Indústria, Outro ramo |
| | 2 | Há quanto tempo a empresa está no mercado? | Única | Menos de 1 ano, 1 a 3, 3 a 5, Mais de 5 anos |
| | 3 | Qual produto ou serviço mais vende hoje? | Texto obrigatório | 2 a 120 caracteres |
| | 4 | Quanto o negócio fatura por mês? | Única | Mesmas faixas do diagnóstico |
| Como você vende | 5 | Como vocês alcançam a maior parte dos clientes hoje? | Única + "Outro" | Indicação, Instagram e redes sociais, Google, Tráfego pago, Prospecção ativa, Vendedores, Loja física, Outro canal |
| | 6 | Hoje, a empresa tem alguma estratégia de marketing? | Única | Sim, Não, Não mas pretendo ter |
| | 6b | Quem cuida dessa estratégia hoje? | Única, **só se "Sim"** | Eu mesmo quando dá tempo, Agência ou freelancer, Equipe interna |
| O que trava | 7 | Quais são os principais problemas da empresa hoje? | Várias + "Outro" | 11 opções (abaixo), pelo menos 1 |
| Próximos passos | 8 | Quem decide sobre contratar a SA? | Única | Eu decido, Decido com sócio, Outra pessoa decide |
| | 9 | Quando você quer começar? | Única | Ainda este mês, Nos próximos 3 meses, Ainda estou pesquisando |
| | 10 | Para resolver esses problemas e construir um comercial forte, quanto você investiria por mês? | Única | Até R$ 1.000, 1.000 a 2.500, 2.500 a 5.000, 5.000 a 10.000, Acima de 10.000, Ainda não sei. Ajuda: mídia paga fica à parte |
| | 11 | Como você deseja estar nos próximos 6 meses a 1 ano? | Texto opcional | até 500 caracteres |
| Contato | | Quem está respondendo? | Formulário | Nome completo (nome e sobrenome), WhatsApp, empresa e Instagram opcionais |

**Comportamento:** escolha única avança sozinha em 200 ms; "Outro" abre um
campo e espera "Continuar"; várias escolhas avançam no "Continuar". O
contador ("n de N") muda quando a 6b entra ou sai. As respostas ficam no
navegador (sessionStorage) para retomar se a página recarregar.

**Formatação no contato:** nome e empresa com iniciais maiúsculas ("maria da
silva" → "Maria da Silva"; siglas digitadas em maiúscula ficam); Instagram
com "@" automático; WhatsApp com máscara.

### Problemas e frentes indicadas

| Problema | Frente |
|---|---|
| Poucas vendas; Problemas no processo comercial; Falta de estratégia; Outro | SA Consultoria |
| Poucos clientes; Dificuldade para gerar contatos interessados; O Instagram não traz resultado; Pouca presença digital; Tráfego pago sem resultado | SA Digital |
| Dificuldade de posicionamento da marca | SA Studio |
| Site ou página de vendas que não converte | SA Tech |

A frente mais citada vem primeiro; no empate, a ordem acima
(`indicarFrentes`).

### FIT (só para a SA)

Versão 3 (`src/lib/fit.ts`). Até 3 pontos em cada critério, máximo 15:

| Critério | Pontos |
|---|---|
| Porte (faturamento) | Até 10 mil: 0 · 10 a 50 mil: 1 · 50 a 200 mil: 2 · acima: 3 |
| Necessidade | Sem estratégia: 2 · Não, mas pretendo: 3 · Com estratégia: eu mesmo 3, agência 2, equipe 1 |
| Autoridade | Eu decido: 3 · com sócio: 2 · outra pessoa: 0 |
| Prazo | Este mês: 3 · 3 meses: 2 · pesquisando: 0 |
| Verba | Até 1.000: 0 · 1.000 a 2.500: 1 · 2.500 a 5.000: 2 · acima: 3 · não sei: 1 |

Corte: 11 ou mais = alto, 6 a 10 = médio, até 5 = baixo. Ajustes: verba até
R$ 1.000 com faturamento até R$ 20 mil é sempre baixo; quem não decide ou só
pesquisa fica no máximo médio. Ao mudar pesos, subir `FIT_VERSAO`.

### Tela final

- **Gravado:** "{nome}, você ganhou uma análise estratégica da sua empresa." e
  "Um consultor da SA vai preparar essa análise com as suas respostas e
  apresentá-la na primeira conversa com você.", as frentes indicadas e o aviso
  "Pronto. Pode voltar para a conversa no WhatsApp." **Sem botões:** a pessoa
  recebeu o link do consultor no WhatsApp e volta para a mesma conversa; o
  e-mail para a SA já saiu ao concluir. O Instagram fica para a conversa (o
  consultor pede para seguir e entrega a análise).
- **Não gravado:** "falta só enviar suas respostas" e o botão **Enviar as
  respostas no WhatsApp**, com todas as respostas escritas na mensagem.

### E-mail para a SA

Para `contato@saagencia.com.br`, de `SA Marketing <avisos@envio.saagencia.com.br>`.
Sai logo depois de gravar.
Assunto: "Novo briefing: {empresa ou nome} · FIT {alto|médio|baixo}". Corpo:
empresa, nome, WhatsApp, Instagram, FIT com pontos, frentes, data, todas as
respostas na ordem e origem (UTM). Sem botões nem links.

### Status do lead

| Status | Quem muda | Quando |
|---|---|---|
| `novo` | site | Só fez o diagnóstico |
| `pendente-conversa` | site | Concluiu o briefing |
| `abriu-whatsapp` | equipe | (o site não marca mais: a tela final não tem botão) |
| `em-atendimento` | equipe | Consultor já está conversando |
| `reuniao-marcada` | equipe | Agenda inicial marcada |
| `proposta`, `cliente`, `perdido` | equipe | Andamento comercial |

`comercial.leads_esfriando` lista quem está há 2 h ou mais em
`pendente-conversa` ou `abriu-whatsapp`.

## 4. Bio do Instagram (`bio.saagencia.com.br`)

Logo, "SA Marketing & Business", "Descubra onde o seu marketing para de
vender." e três botões, nesta ordem:

1. **Descobrir o que trava suas vendas** (âmbar): abre o site já no diagnóstico.
2. **Chamar um consultor no WhatsApp**: mensagem "Vim pelo Instagram da SA…".
3. **Conhecer a SA**: o site.

Cada clique é contado por dia (sem dado pessoal). O briefing não entra na bio.

## 5. Privacidade e cookies

- Vercel Web Analytics: sempre, anônimo, sem cookie.
- Métricas próprias: só depois de "Aceitar" no aviso de cookies (página
  principal e política). "Preferências de cookies" no rodapé reabre o aviso.
- Política (`/privacidade`) lista o que cada formulário coleta, o banco em São
  Paulo, o e-mail para a equipe, a contagem de cliques da bio e como pedir
  exclusão. Ao coletar dado novo, atualizar `privacidade` em `site.ts`.
