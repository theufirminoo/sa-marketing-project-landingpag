import { z } from "zod";

import {
  DECISOES,
  DESAFIOS,
  ESTRATEGIAS,
  FATURAMENTOS,
  INVESTIMENTOS,
  MARKETINGS,
  ORIGENS_CLIENTE,
  PRAZOS,
  SEGMENTOS,
  TEMPOS_MERCADO,
  type Desafio,
  type FrenteId,
} from "@/content/opcoes";
import { briefing, briefingOpcoes } from "@/content/site";
import { temNomeCompleto } from "./formatar";
import { contatoSchema, origemSchema } from "./lead";

/* ------------------------------------------------------------------ */
/* Etapas, na ordem da conversa                                        */
/* ------------------------------------------------------------------ */

export type PerguntaEscolha = keyof typeof briefingOpcoes;
export type PerguntaTexto = keyof typeof briefing.textos;
export type EtapaId = PerguntaEscolha | PerguntaTexto;
export type Bloco = keyof typeof briefing.blocos;

export type Etapa =
  | { id: PerguntaEscolha; tipo: "unica" | "multipla"; bloco: Bloco }
  | { id: PerguntaTexto; tipo: "texto"; bloco: Bloco; obrigatoria: boolean };

/**
 * A conversa em quatro capítulos: a empresa, como vende, o que trava e os
 * próximos passos. "marketing" só aparece para quem tem estratégia.
 */
export const ETAPAS: readonly Etapa[] = [
  { id: "segmento", tipo: "unica", bloco: "empresa" },
  { id: "tempo", tipo: "unica", bloco: "empresa" },
  { id: "produto", tipo: "texto", bloco: "empresa", obrigatoria: true },
  { id: "faturamento", tipo: "unica", bloco: "empresa" },
  { id: "origem", tipo: "unica", bloco: "vendas" },
  { id: "estrategia", tipo: "unica", bloco: "vendas" },
  { id: "marketing", tipo: "unica", bloco: "vendas" },
  { id: "desafio", tipo: "multipla", bloco: "problemas" },
  { id: "decisao", tipo: "unica", bloco: "proximos" },
  { id: "prazo", tipo: "unica", bloco: "proximos" },
  { id: "investimento", tipo: "unica", bloco: "proximos" },
  { id: "objetivo", tipo: "texto", bloco: "proximos", obrigatoria: false },
];

export type Respostas = Partial<Record<EtapaId, string | string[]>>;

/** Etapas que valem para estas respostas (a de "marketing" depende da estratégia). */
export const etapasAtivas = (respostas: Respostas): Etapa[] =>
  ETAPAS.filter((e) => e.id !== "marketing" || respostas.estrategia === "sim");

/* ------------------------------------------------------------------ */
/* Validação                                                           */
/* ------------------------------------------------------------------ */

/** Perguntas com a opção "Outro", que abre um campo para escrever. */
export const PERGUNTAS_COM_OUTRO = ["segmento", "origem", "desafio"] as const;
export type PerguntaComOutro = (typeof PERGUNTAS_COM_OUTRO)[number];
export type Outros = Partial<Record<PerguntaComOutro, string>>;

export const temOutro = (chave: EtapaId): chave is PerguntaComOutro =>
  (PERGUNTAS_COM_OUTRO as readonly string[]).includes(chave);

/** A resposta tem "outro" (escolha única ou entre as marcadas). */
export const marcouOutro = (valor: string | readonly string[] | undefined): boolean =>
  Array.isArray(valor) ? valor.includes("outro") : valor === "outro";

/** Texto do "Outro": curto, obrigatório só quando a opção foi marcada. */
export const outroSchema = z.string().trim().min(2, briefing.outro.erro).max(80, briefing.outro.erro);

/** Validação de cada pergunta de escrever. */
export const textoSchemas = {
  produto: z.string().trim().min(2, briefing.textos.produto.erro).max(120, briefing.textos.produto.erro),
  objetivo: z.string().trim().max(500, briefing.textos.objetivo.erro),
} satisfies Record<PerguntaTexto, z.ZodType<string>>;

/** Respostas, uma por etapa. "marketing" só existe com estratégia; desafios aceitam vários. */
export const respostasBriefingSchema = z.object({
  segmento: z.enum(SEGMENTOS),
  tempo: z.enum(TEMPOS_MERCADO),
  produto: textoSchemas.produto,
  faturamento: z.enum(FATURAMENTOS),
  origem: z.enum(ORIGENS_CLIENTE),
  estrategia: z.enum(ESTRATEGIAS),
  marketing: z.enum(MARKETINGS).optional(),
  desafio: z
    .array(z.enum(DESAFIOS))
    .min(1, briefing.perguntas.desafio.erro)
    .max(DESAFIOS.length)
    .transform((lista) => DESAFIOS.filter((d) => lista.includes(d))),
  decisao: z.enum(DECISOES),
  prazo: z.enum(PRAZOS),
  investimento: z.enum(INVESTIMENTOS),
  objetivo: textoSchemas.objetivo.default(""),
});
export type RespostasBriefing = z.infer<typeof respostasBriefingSchema>;

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
    if (dados.estrategia === "sim" && !dados.marketing) {
      ctx.addIssue({ code: "custom", path: ["marketing"], message: "Informe quem cuida da estratégia." });
    }
  })
  // Sem estratégia, "quem cuida" não se aplica: não vai para o banco.
  .transform((dados) => (dados.estrategia === "sim" ? dados : { ...dados, marketing: undefined }));
export type Briefing = z.infer<typeof briefingSchema>;
export type BriefingEntrada = z.input<typeof briefingSchema>;

/* ------------------------------------------------------------------ */
/* Regras e textos                                                     */
/* ------------------------------------------------------------------ */

/**
 * Frentes indicadas pelos problemas marcados: cada problema aponta para a
 * frente que cuida dele (site.ts). A mais citada primeiro; no empate, a
 * ordem das frentes no site.
 */
export function indicarFrentes(desafios: readonly Desafio[]): FrenteId[] {
  const contagem = new Map<FrenteId, number>();
  for (const opcao of briefingOpcoes.desafio) {
    if (desafios.includes(opcao.id)) contagem.set(opcao.frente, (contagem.get(opcao.frente) ?? 0) + 1);
  }
  const ordem: FrenteId[] = ["consultoria", "social", "studio", "tech"];
  return ordem.filter((f) => contagem.has(f)).sort((a, b) => (contagem.get(b) ?? 0) - (contagem.get(a) ?? 0));
}

/** Rótulo da resposta; no "Outro", o que a pessoa escreveu; texto livre volta como está. */
export function rotuloResposta(chave: EtapaId, valor: string | readonly string[] | undefined, outros: Outros = {}): string {
  if (valor === undefined) return "";
  if (!(chave in briefingOpcoes)) return String(valor).trim();
  const opcoes = briefingOpcoes[chave as PerguntaEscolha] as readonly { id: string; rotulo: string }[];
  const rotulo = (id: string) => {
    if (temOutro(chave) && id === "outro" && outros[chave]?.trim()) return outros[chave].trim();
    return opcoes.find((o) => o.id === id)?.rotulo ?? id;
  };
  return Array.isArray(valor) ? valor.map(rotulo).join(", ") : rotulo(valor as string);
}

/** Pares (pergunta, resposta) na ordem da conversa, sem as vazias. Usado no WhatsApp e no e-mail. */
export function linhasDoBriefing(respostas: RespostasBriefing, outros: Outros = {}): [EtapaId, string][] {
  return etapasAtivas(respostas as Respostas)
    .map((e): [EtapaId, string] => [e.id, rotuloResposta(e.id, respostas[e.id], outros)])
    .filter(([, valor]) => valor !== "");
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
}): string {
  const m = briefing.mensagem;
  const linhas = linhasDoBriefing(dados.respostas, dados.outros).map(([id, valor]) => `• ${m.rotulos[id]}: ${valor}`);
  return [m.abertura(dados.nome.trim(), dados.empresa?.trim() || undefined), ...linhas].join("\n");
}
