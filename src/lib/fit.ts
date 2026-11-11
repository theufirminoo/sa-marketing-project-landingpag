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
export const FIT_VERSAO = 2;

type Pesos = { [K in keyof RespostasBriefing]?: Partial<Record<RespostasBriefing[K], number>> };

const PESOS: Pesos = {
  // Porte: quem fatura mais sustenta o serviço por mais tempo.
  faturamento: { "ate-10": 0, "10-20": 1, "20-50": 1, "50-200": 2, "acima-200": 3 },
  // Necessidade: dono fazendo o marketing sozinho é a dor mais clara.
  marketing: { ninguem: 2, "eu-mesmo": 3, "agencia-ou-freela": 2, "equipe-interna": 1 },
  // Autoridade.
  decisao: { eu: 3, "com-socio": 2, "outra-pessoa": 0 },
  // Prazo.
  prazo: { agora: 3, "tres-meses": 2, pesquisando: 0 },
  // Verba.
  investimento: { "ate-1500": 0, "1500-3000": 1, "3000-6000": 2, "acima-6000": 3 },
};

export const FIT_MAXIMO = 15;

export type Fit = { fit: "alto" | "medio" | "baixo"; pontos: number; versao: number };

export function calcularFit(respostas: RespostasBriefing): Fit {
  let pontos = 0;
  for (const chave of Object.keys(PESOS) as (keyof RespostasBriefing)[]) {
    const tabela = PESOS[chave] as Record<string, number> | undefined;
    pontos += tabela?.[respostas[chave]] ?? 0;
  }

  let fit: Fit["fit"] = pontos >= 11 ? "alto" : pontos >= 6 ? "medio" : "baixo";

  // Sem verba e sem porte, não há o que pontuar compense.
  const pequeno = respostas.faturamento === "ate-10" || respostas.faturamento === "10-20";
  if (respostas.investimento === "ate-1500" && pequeno) fit = "baixo";
  // Sem decisão ou sem prazo, no máximo médio: a conversa ainda não fecha.
  if (fit === "alto" && (respostas.decisao === "outra-pessoa" || respostas.prazo === "pesquisando")) fit = "medio";

  return { fit, pontos, versao: FIT_VERSAO };
}
