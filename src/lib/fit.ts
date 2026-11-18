import type { RespostasBriefing } from "./briefing";

/**
 * FIT do briefing: quanto o contato combina com a SA agora. Só o servidor
 * calcula e só o banco guarda; o cliente nunca vê. Base: BANT (verba,
 * autoridade, necessidade e prazo) mais o porte pelo faturamento, adaptado
 * do questionário de qualificação da SA.
 *
 * Ao mudar pesos ou cortes, suba FIT_VERSAO: o banco guarda a versão de cada
 * linha e o sistema pode recalcular as antigas.
 */
export const FIT_VERSAO = 3;

const FATURAMENTO: Record<RespostasBriefing["faturamento"], number> = {
  "ate-10": 0, "10-20": 1, "20-50": 1, "50-200": 2, "acima-200": 3,
};
/** Necessidade: sem estratégia ou fazendo sozinho é a dor mais clara. */
const ESTRATEGIA: Record<"nao" | "nao-mas-pretendo", number> = { nao: 2, "nao-mas-pretendo": 3 };
const MARKETING: Record<NonNullable<RespostasBriefing["marketing"]>, number> = {
  ninguem: 2, "eu-mesmo": 3, "agencia-ou-freela": 2, "equipe-interna": 1,
};
const DECISAO: Record<RespostasBriefing["decisao"], number> = { eu: 3, "com-socio": 2, "outra-pessoa": 0 };
const PRAZO: Record<RespostasBriefing["prazo"], number> = { agora: 3, "tres-meses": 2, pesquisando: 0 };
const INVESTIMENTO: Record<RespostasBriefing["investimento"], number> = {
  "ate-1000": 0, "1000-2500": 1, "2500-5000": 2, "5000-10000": 3, "acima-10000": 3, "nao-sei": 1,
};

export const FIT_MAXIMO = 15;

export type Fit = { fit: "alto" | "medio" | "baixo"; pontos: number; versao: number };

/** Porte, necessidade, autoridade, prazo e verba: até 3 pontos cada. */
export function calcularFit(r: RespostasBriefing): Fit {
  const necessidade = r.estrategia === "sim" ? MARKETING[r.marketing ?? "ninguem"] : ESTRATEGIA[r.estrategia];
  const pontos = FATURAMENTO[r.faturamento] + necessidade + DECISAO[r.decisao] + PRAZO[r.prazo] + INVESTIMENTO[r.investimento];

  let fit: Fit["fit"] = pontos >= 11 ? "alto" : pontos >= 6 ? "medio" : "baixo";
  // Sem verba e sem porte, não há o que pontuar compense.
  const pequeno = r.faturamento === "ate-10" || r.faturamento === "10-20";
  if (r.investimento === "ate-1000" && pequeno) fit = "baixo";
  // Sem decisão ou sem prazo, no máximo médio: a conversa ainda não fecha.
  if (fit === "alto" && (r.decisao === "outra-pessoa" || r.prazo === "pesquisando")) fit = "medio";

  return { fit, pontos, versao: FIT_VERSAO };
}
