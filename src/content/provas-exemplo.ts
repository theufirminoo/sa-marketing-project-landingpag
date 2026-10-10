import type { Case, Depoimento, Numero } from "./site";

/**
 * EXEMPLOS FICTÍCIOS, só para posicionar o bloco de prova social no layout.
 * Nenhum destes nomes, empresas ou números é real. Antes de publicar,
 * troque pelos reais em `provaSocial` (site.ts) ou desligue `provasExemplo`
 * em provisorios.ts para deixar a seção em standby.
 */
export const numerosExemplo: readonly Numero[] = [
  { valor: "+38%", descricao: "de vendas pelo direct em 90 dias", fonte: "Média de clientes da SA Social" },
  { valor: "120", descricao: "Reels entregues por mês", fonte: "SA Studio" },
  { valor: "4,9", descricao: "nota média no Google", fonte: "Avaliações dos clientes" },
];

export const depoimentosExemplo: readonly Depoimento[] = [
  {
    nome: "Carla Menezes",
    empresa: "Studio Bella Estética",
    texto: "Eu postava todo dia e a agenda não enchia. A SA mostrou que o problema era o atendimento no direct. Arrumamos isso primeiro.",
    autorizadoEm: "exemplo",
  },
  {
    nome: "Rafael Torres",
    empresa: "Torres Materiais de Construção",
    texto: "O WhatsApp agora responde, qualifica e manda o orçamento. Minha equipe só entra quando o cliente já quer comprar.",
    autorizadoEm: "exemplo",
  },
  {
    nome: "Juliana Prado",
    empresa: "Prado Doces Finos",
    texto: "Os Reels passaram a ter um motivo. Cada vídeo leva para uma oferta, e eu sei quanto cada um vendeu.",
    autorizadoEm: "exemplo",
  },
];

export const casesExemplo: readonly Case[] = [
  {
    cliente: "Clínica Vida Plena",
    segmento: "Saúde",
    antes: "Dependia de indicação e tinha semanas com a agenda vazia.",
    depois: "Anúncio local e roteiro de atendimento: agenda cheia com três semanas de antecedência.",
    fonte: "SA Consultoria e SA Social",
  },
  {
    cliente: "Loja Casa Norte",
    segmento: "Varejo",
    antes: "Pedidos anotados à mão e cliente esquecido depois da primeira compra.",
    depois: "Loja virtual, CRM e lembrete automático no WhatsApp: recompra virou rotina.",
    fonte: "SA Tech",
  },
];
