import { z } from "zod";

import {
  DECISOES,
  DESAFIOS,
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
  desafio: z.enum(DESAFIOS),
  marketing: z.enum(MARKETINGS),
  decisao: z.enum(DECISOES),
  prazo: z.enum(PRAZOS),
  investimento: z.enum(INVESTIMENTOS),
});
export type RespostasBriefing = z.infer<typeof respostasBriefingSchema>;

export const PERGUNTAS_BRIEFING = Object.keys(respostasBriefingSchema.shape) as (keyof RespostasBriefing)[];

/** Perguntas com a opção "Outro", que abre um campo para escrever. */
export const PERGUNTAS_COM_OUTRO = ["segmento", "origem", "desafio"] as const;
export type PerguntaComOutro = (typeof PERGUNTAS_COM_OUTRO)[number];
export type Outros = Partial<Record<PerguntaComOutro, string>>;

export const temOutro = (chave: keyof RespostasBriefing): chave is PerguntaComOutro =>
  (PERGUNTAS_COM_OUTRO as readonly string[]).includes(chave);

/** Texto do "Outro": curto, obrigatório só quando a opção é "outro". */
export const outroSchema = z.string().trim().min(2, briefing.outro.erro).max(80, briefing.outro.erro);

export const objetivoSchema = z.string().trim().max(500, briefing.objetivo.erro);

/** Corpo do POST /api/briefing. O mesmo esquema valida no navegador e no servidor. */
export const briefingSchema = contatoSchema
  .extend(origemSchema.shape)
  .extend(respostasBriefingSchema.shape)
  .extend({
    objetivo: objetivoSchema.default(""),
    outros: z
      .object({
        segmento: z.string().trim().max(80).optional(),
        origem: z.string().trim().max(80).optional(),
        desafio: z.string().trim().max(80).optional(),
      })
      .default({}),
  })
  .superRefine((dados, ctx) => {
    for (const chave of PERGUNTAS_COM_OUTRO) {
      if (dados[chave] !== "outro") continue;
      if (!outroSchema.safeParse(dados.outros[chave] ?? "").success) {
        ctx.addIssue({ code: "custom", path: ["outros", chave], message: briefing.outro.erro });
      }
    }
  });
export type Briefing = z.infer<typeof briefingSchema>;
export type BriefingEntrada = z.input<typeof briefingSchema>;

/** Rótulo da resposta; no "Outro", o que a pessoa escreveu. */
export function rotuloResposta(chave: keyof RespostasBriefing, valor: string, outros: Outros = {}): string {
  if (temOutro(chave) && valor === "outro" && outros[chave]?.trim()) return outros[chave].trim();
  const opcoes = briefingOpcoes[chave] as readonly { id: string; rotulo: string }[];
  return opcoes.find((o) => o.id === valor)?.rotulo ?? valor;
}

/** Mensagem do WhatsApp para quando o briefing não foi gravado. */
export function montarMensagemBriefing(dados: {
  nome: string;
  empresa?: string;
  respostas: RespostasBriefing;
  outros?: Outros;
  objetivo?: string;
}): string {
  const m = briefing.mensagem;
  const linhas = PERGUNTAS_BRIEFING.map(
    (chave) => `• ${m.rotulos[chave]}: ${rotuloResposta(chave, dados.respostas[chave], dados.outros)}`,
  );
  const objetivo = dados.objetivo?.trim();
  if (objetivo) linhas.push(`• ${m.objetivo}: ${objetivo}`);
  return [m.abertura(dados.nome.trim(), dados.empresa?.trim() || undefined), ...linhas].join("\n");
}
