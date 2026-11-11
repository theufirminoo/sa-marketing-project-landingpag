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

export const FATURAMENTOS = ["ate-20", "20-50", "50-200", "acima-200", "nao-informado"] as const;
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
] as const;
export type OrigemDiagnostico = (typeof ORIGENS)[number];

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

/** Faixas do briefing: mais finas embaixo e sem "prefiro não informar". */
export const FATURAMENTOS_BRIEFING = ["ate-10", "10-20", "20-50", "50-200", "acima-200"] as const;
export type FaturamentoBriefing = (typeof FATURAMENTOS_BRIEFING)[number];

export const ORIGENS_CLIENTE = ["indicacao", "redes-sociais", "google", "anuncios", "loja-fisica", "outro"] as const;
export type OrigemCliente = (typeof ORIGENS_CLIENTE)[number];

export const DESAFIOS = ["atrair-clientes", "converter", "constancia", "recompra", "processos", "outro"] as const;
export type Desafio = (typeof DESAFIOS)[number];

export const MARKETINGS = ["ninguem", "eu-mesmo", "agencia-ou-freela", "equipe-interna"] as const;
export type Marketing = (typeof MARKETINGS)[number];

export const DECISOES = ["eu", "com-socio", "outra-pessoa"] as const;
export type Decisao = (typeof DECISOES)[number];

export const PRAZOS = ["agora", "tres-meses", "pesquisando"] as const;
export type Prazo = (typeof PRAZOS)[number];

export const INVESTIMENTOS = ["ate-1500", "1500-3000", "3000-6000", "acima-6000"] as const;
export type Investimento = (typeof INVESTIMENTOS)[number];
