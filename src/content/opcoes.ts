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
