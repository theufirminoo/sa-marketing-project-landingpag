import { z } from "zod";

/**
 * Formato dos eventos de métrica própria. Só chegam depois do "Aceitar" no
 * aviso de cookies. Nenhum evento leva nome, WhatsApp, empresa ou Instagram:
 * o lead vai ao CRM por outra rota. Os identificadores são aleatórios,
 * gerados no navegador, e não dizem quem a pessoa é.
 */

const texto = (max: number) => z.string().max(max);
const numero = z.number().finite();

export const TIPOS_EVENTO = [
  "visualizacao",
  "secao",
  "rolagem",
  "clique",
  "diagnostico",
  "vital",
  "video",
  "slide",
  "erro",
  "saida",
] as const;

export const eventoSchema = z.object({
  tipo: z.enum(TIPOS_EVENTO),
  /** Milissegundos desde o início da visita à página. */
  t: numero.min(0).max(86_400_000),
  /** Momento no relógio do navegador (ISO). */
  em: z.iso.datetime(),
  /** Dados do evento: chaves curtas, valores simples. */
  dados: z.record(texto(40), z.union([texto(300), numero, z.boolean(), z.null()])).default({}),
});

export const contextoSchema = z.object({
  visitante: z.uuid(),
  sessao: z.uuid(),
  visita: numero.int().min(1).max(100_000),
  primeiraVisita: z.iso.datetime().optional(),
  pagina: texto(500),
  titulo: texto(200).optional(),
  referrer: texto(2000).optional(),
  utm: z.record(texto(20), texto(300)).default({}),
  idioma: texto(40).optional(),
  idiomas: texto(200).optional(),
  fuso: texto(60).optional(),
  tela: z.object({ largura: numero, altura: numero, densidade: numero }).optional(),
  janela: z.object({ largura: numero, altura: numero }).optional(),
  toque: z.boolean().optional(),
  memoriaGb: numero.optional(),
  nucleos: numero.optional(),
  conexao: z
    .object({ tipo: texto(20).optional(), downlink: numero.optional(), rtt: numero.optional(), economia: z.boolean().optional() })
    .optional(),
  temaEscuro: z.boolean().optional(),
  movimentoReduzido: z.boolean().optional(),
  automatizado: z.boolean().optional(),
});

export const loteSchema = z.object({
  contexto: contextoSchema,
  eventos: z.array(eventoSchema).min(1).max(100),
});

export type Evento = z.infer<typeof eventoSchema>;
export type Contexto = z.infer<typeof contextoSchema>;
export type Lote = z.infer<typeof loteSchema>;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];
