import { z } from "zod";

import {
  diagnostico,
  FATURAMENTOS,
  FASES,
  FRENTES,
  TRAVAS,
  type FrenteId,
} from "@/content/site";
import { recomendarFrentes } from "./recomendacao";
import { whatsappInternacional, whatsappValido } from "./whatsapp";

const campos = diagnostico.telas.contato.campos;

/** Tira @, endereço do perfil e espaços: "@SuaEmpresa" e "instagram.com/suaempresa" viram "@suaempresa". */
export function normalizarInstagram(entrada: string): string {
  const usuario = entrada
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/^@+/, "")
    .replace(/[/?#].*$/, "")
    .trim()
    .toLowerCase();
  return usuario ? `@${usuario}` : "";
}

/** Tela 4. O mesmo esquema valida no navegador e no servidor. */
export const contatoSchema = z.object({
  nome: z.string().trim().min(2, campos.nome.erro).max(80, campos.nome.erro),
  whatsapp: z.string().refine(whatsappValido, campos.whatsapp.erro),
  empresa: z.string().trim().max(120),
  instagram: z.string().trim().max(80),
  /** Campo isca. Pessoas não veem; robôs preenchem. */
  site: z.string().max(500),
});
export type Contato = z.infer<typeof contatoSchema>;

const textoCurto = z.string().trim().max(300).optional();

/** Corpo do POST /api/lead. */
export const leadSchema = contatoSchema.extend({
  trava: z.enum(TRAVAS),
  fase: z.enum(FASES),
  faturamento: z.enum(FATURAMENTOS),
  frenteDeInteresse: z.enum(FRENTES).optional(),
  utm: z
    .object({
      source: textoCurto,
      medium: textoCurto,
      campaign: textoCurto,
      content: textoCurto,
      term: textoCurto,
      fbclid: textoCurto,
      gclid: textoCurto,
    })
    .default({}),
  pagina: z.string().trim().max(2000).optional(),
  referrer: z.string().trim().max(2000).optional(),
});
export type Lead = z.infer<typeof leadSchema>;
export type LeadEntrada = z.input<typeof leadSchema>;

export type CorpoCrm = {
  origem: "landing-sa";
  enviadoEm: string;
  nome: string;
  whatsapp: string;
  empresa: string;
  instagram: string;
  trava: Lead["trava"];
  fase: Lead["fase"];
  faturamento: Lead["faturamento"];
  frenteDeInteresse: FrenteId | null;
  frentesRecomendadas: FrenteId[];
  utm: Lead["utm"];
  pagina: string;
  referrer: string;
};

/** Monta o corpo enviado ao CRM. As frentes são recalculadas aqui, no servidor. */
export function montarCorpoCrm(lead: Lead, agora: Date = new Date()): CorpoCrm {
  return {
    origem: "landing-sa",
    enviadoEm: agora.toISOString(),
    nome: lead.nome.trim(),
    whatsapp: whatsappInternacional(lead.whatsapp),
    empresa: lead.empresa.trim(),
    instagram: normalizarInstagram(lead.instagram),
    trava: lead.trava,
    fase: lead.fase,
    faturamento: lead.faturamento,
    frenteDeInteresse: lead.frenteDeInteresse ?? null,
    frentesRecomendadas: recomendarFrentes(lead.trava, lead.frenteDeInteresse),
    utm: lead.utm,
    pagina: lead.pagina ?? "",
    referrer: lead.referrer ?? "",
  };
}
