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
  type Desafio,
  type FrenteId,
} from "@/content/opcoes";
import { briefing, briefingOpcoes } from "@/content/site";
import { temNomeCompleto } from "./formatar";
import { contatoSchema, origemSchema } from "./lead";

/** Respostas, na ordem em que aparecem. Só "desafio" aceita várias. */
export const respostasBriefingSchema = z.object({
  segmento: z.enum(SEGMENTOS),
  faturamento: z.enum(FATURAMENTOS),
  origem: z.enum(ORIGENS_CLIENTE),
  desafio: z
    .array(z.enum(DESAFIOS))
    .min(1, briefing.perguntas.desafio.erro)
    .max(DESAFIOS.length)
    .transform((lista) => DESAFIOS.filter((d) => lista.includes(d))),
  marketing: z.enum(MARKETINGS),
  decisao: z.enum(DECISOES),
  prazo: z.enum(PRAZOS),
  investimento: z.enum(INVESTIMENTOS),
});
export type RespostasBriefing = z.infer<typeof respostasBriefingSchema>;
export type PerguntaBriefingId = keyof RespostasBriefing;

export const PERGUNTAS_BRIEFING = Object.keys(respostasBriefingSchema.shape) as PerguntaBriefingId[];
/** Perguntas em que a pessoa marca várias opções. */
export const PERGUNTAS_MULTIPLAS: readonly PerguntaBriefingId[] = ["desafio"];

/** Perguntas com a opção "Outro", que abre um campo para escrever. */
export const PERGUNTAS_COM_OUTRO = ["segmento", "origem", "desafio"] as const;
export type PerguntaComOutro = (typeof PERGUNTAS_COM_OUTRO)[number];
export type Outros = Partial<Record<PerguntaComOutro, string>>;

export const temOutro = (chave: PerguntaBriefingId): chave is PerguntaComOutro =>
  (PERGUNTAS_COM_OUTRO as readonly string[]).includes(chave);

/** A resposta tem "outro" (escolha única ou entre as marcadas). */
export const marcouOutro = (valor: string | readonly string[] | undefined): boolean =>
  Array.isArray(valor) ? valor.includes("outro") : valor === "outro";

/** Texto do "Outro": curto, obrigatório só quando a opção foi marcada. */
export const outroSchema = z.string().trim().min(2, briefing.outro.erro).max(80, briefing.outro.erro);

export const objetivoSchema = z.string().trim().max(500, briefing.objetivo.erro);

/** Contato do briefing: nome completo (nome e sobrenome). */
export const contatoBriefingSchema = contatoSchema.extend({
  nome: z
    .string()
    .trim()
    .max(80, briefing.contato.nome.erro)
    .refine(temNomeCompleto, briefing.contato.nome.erro),
});
export type ContatoBriefing = z.infer<typeof contatoBriefingSchema>;

/** Corpo do POST /api/briefing. O mesmo esquema valida no navegador e no servidor. */
export const briefingSchema = contatoBriefingSchema
  .extend(origemSchema.shape)
  .extend(respostasBriefingSchema.shape)
  .extend({
    /** Aceite marcado na abertura (LGPD). Sem ele, nada é gravado. */
    consentimento: z.literal(true),
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
      if (!marcouOutro(dados[chave])) continue;
      if (!outroSchema.safeParse(dados.outros[chave] ?? "").success) {
        ctx.addIssue({ code: "custom", path: ["outros", chave], message: briefing.outro.erro });
      }
    }
  });
export type Briefing = z.infer<typeof briefingSchema>;
export type BriefingEntrada = z.input<typeof briefingSchema>;

/**
 * Frentes indicadas pelos desafios marcados: cada desafio aponta para a
 * frente que cuida dele (site.ts). Ordem: a frente mais citada primeiro; no
 * empate, a ordem das frentes no site.
 */
export function indicarFrentes(desafios: readonly Desafio[]): FrenteId[] {
  const contagem = new Map<FrenteId, number>();
  for (const opcao of briefingOpcoes.desafio) {
    if (desafios.includes(opcao.id)) contagem.set(opcao.frente, (contagem.get(opcao.frente) ?? 0) + 1);
  }
  const ordem: FrenteId[] = ["consultoria", "social", "studio", "tech"];
  return ordem.filter((f) => contagem.has(f)).sort((a, b) => (contagem.get(b) ?? 0) - (contagem.get(a) ?? 0));
}

/** Rótulo da resposta; no "Outro", o que a pessoa escreveu. Várias viram lista com vírgula. */
export function rotuloResposta(chave: PerguntaBriefingId, valor: string | readonly string[], outros: Outros = {}): string {
  const opcoes = briefingOpcoes[chave] as readonly { id: string; rotulo: string }[];
  const rotulo = (id: string) => {
    if (temOutro(chave) && id === "outro" && outros[chave]?.trim()) return outros[chave].trim();
    return opcoes.find((o) => o.id === id)?.rotulo ?? id;
  };
  return Array.isArray(valor) ? valor.map(rotulo).join(", ") : rotulo(valor as string);
}

/** Mensagem do WhatsApp quando o briefing foi gravado: só pede a agenda. */
export function montarMensagemAgendar(dados: { nome: string; empresa?: string }): string {
  return briefing.mensagem.agendar(dados.nome.trim(), dados.empresa?.trim() || undefined);
}

/** Mensagem do WhatsApp quando o briefing não foi gravado: leva as respostas. */
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
