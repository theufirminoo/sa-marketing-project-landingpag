/**
 * Identificadores das opções do diagnóstico. Não são texto de interface:
 * os rótulos ficam em site.ts. Este módulo é pequeno de propósito, porque
 * componentes de cliente importam dele.
 */

export const TRAVAS = [
  "seguidores-nao-vendem",
  "nao-vende-todo-dia",
  "depende-de-indicacao",
  "processos-manuais",
  "nao-sabe-por-onde-comecar",
] as const;
export type Trava = (typeof TRAVAS)[number];

export const FASES = ["comecando", "constancia", "escalar"] as const;
export type Fase = (typeof FASES)[number];

/** Mesmas faixas no diagnóstico e no briefing, sem "prefiro não informar". */
export const FATURAMENTOS = ["ate-10", "10-20", "20-50", "50-200", "acima-200"] as const;
export type Faturamento = (typeof FATURAMENTOS)[number];

export const FRENTES = ["consultoria", "social", "studio", "tech"] as const;
export type FrenteId = (typeof FRENTES)[number];

export const ORIGENS = [
  "hero",
  "cabecalho",
  "frente",
  "como-comeca",
  "cta-final",
  "barra-fixa",
  // Aberto por link (?diagnostico na URL), como o botão da bio do Instagram.
  "link",
] as const;
export type OrigemDiagnostico = (typeof ORIGENS)[number];

/* Página da bio (bio.saagencia.com.br): destinos e origens dos cliques. */

export const DESTINOS_LINK = ["diagnostico", "whatsapp", "site"] as const;
export type DestinoLink = (typeof DESTINOS_LINK)[number];

/** De onde veio o clique (`?de=` na rota /ir). Novos canais entram aqui. */
export const ORIGENS_LINK = ["bio"] as const;
export type OrigemLink = (typeof ORIGENS_LINK)[number];

/* Briefing antes da reunião (briefing.saagencia.com.br). */

export const SEGMENTOS = [
  "servicos",
  "comercio",
  "saude-estetica",
  "alimentacao",
  "educacao",
  "industria",
  "outro",
] as const;
export type Segmento = (typeof SEGMENTOS)[number];

export const ORIGENS_CLIENTE = [
  "indicacao",
  "redes-sociais",
  "google",
  "trafego-pago",
  "prospeccao",
  "vendedores",
  "loja-fisica",
  "outro",
] as const;
export type OrigemCliente = (typeof ORIGENS_CLIENTE)[number];

/** Problemas marcados no briefing; cada um aponta para uma frente (site.ts). */
export const DESAFIOS = [
  "poucas-vendas",
  "poucos-clientes",
  "gerar-leads",
  "instagram-sem-resultado",
  "presenca-digital",
  "posicionamento",
  "trafego-sem-resultado",
  "site-inadequado",
  "processo-comercial",
  "falta-estrategia",
  "outro",
] as const;
export type Desafio = (typeof DESAFIOS)[number];

export const TEMPOS_MERCADO = ["menos-1", "1-3", "3-5", "mais-5"] as const;
export type TempoMercado = (typeof TEMPOS_MERCADO)[number];

export const ESTRATEGIAS = ["sim", "nao", "nao-mas-pretendo"] as const;
export type Estrategia = (typeof ESTRATEGIAS)[number];

export const MARKETINGS = ["ninguem", "eu-mesmo", "agencia-ou-freela", "equipe-interna"] as const;
export type Marketing = (typeof MARKETINGS)[number];

export const DECISOES = ["eu", "com-socio", "outra-pessoa"] as const;
export type Decisao = (typeof DECISOES)[number];

export const PRAZOS = ["agora", "tres-meses", "pesquisando"] as const;
export type Prazo = (typeof PRAZOS)[number];

export const INVESTIMENTOS = ["ate-1000", "1000-2500", "2500-5000", "5000-10000", "acima-10000", "nao-sei"] as const;
export type Investimento = (typeof INVESTIMENTOS)[number];
