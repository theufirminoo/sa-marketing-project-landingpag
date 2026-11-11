import { z } from "zod";

import {
  DECISOES,
  FATURAMENTOS,
  INVESTIMENTOS,
  MARKETINGS,
  ORIGENS_CLIENTE,
  PRAZOS,
  SEGMENTOS,
} from "@/content/opcoes";
import { briefing, briefingOpcoes } from "@/content/site";
import { contatoSchema, origemSchema } from "./lead";

/** Respostas de um toque, na ordem em que aparecem. */
export const respostasBriefingSchema = z.object({
  segmento: z.enum(SEGMENTOS),
  faturamento: z.enum(FATURAMENTOS),
  origem: z.enum(ORIGENS_CLIENTE),
  marketing: z.enum(MARKETINGS),
  decisao: z.enum(DECISOES),
  prazo: z.enum(PRAZOS),
  investimento: z.enum(INVESTIMENTOS),
});
export type RespostasBriefing = z.infer<typeof respostasBriefingSchema>;

export const objetivoSchema = z.string().trim().max(500, briefing.objetivo.erro);

/** Corpo do POST /api/briefing. O mesmo esquema valida no navegador e no servidor. */
export const briefingSchema = contatoSchema
  .extend(origemSchema.shape)
  .extend(respostasBriefingSchema.shape)
  .extend({ objetivo: objetivoSchema.default("") });
export type Briefing = z.infer<typeof briefingSchema>;
export type BriefingEntrada = z.input<typeof briefingSchema>;

export const PERGUNTAS_BRIEFING = Object.keys(respostasBriefingSchema.shape) as (keyof RespostasBriefing)[];

/** Mensagem do WhatsApp para quando o briefing não foi gravado. */
export function montarMensagemBriefing(dados: {
  nome: string;
  empresa?: string;
  respostas: RespostasBriefing;
  objetivo?: string;
}): string {
  const m = briefing.mensagem;
  const linhas = PERGUNTAS_BRIEFING.map((chave) => {
    const opcoes = briefingOpcoes[chave] as readonly { id: string; rotulo: string }[];
    const rotulo = opcoes.find((o) => o.id === dados.respostas[chave])?.rotulo ?? dados.respostas[chave];
    return `• ${m.rotulos[chave]}: ${rotulo}`;
  });
  const objetivo = dados.objetivo?.trim();
  if (objetivo) linhas.push(`• ${m.objetivo}: ${objetivo}`);
  return [m.abertura(dados.nome.trim(), dados.empresa?.trim() || undefined), ...linhas].join("\n");
}
