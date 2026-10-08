import { whatsappNumero } from "@/content/provisorios";
import {
  diagnostico,
  faturamentos,
  fases,
  travas,
  type Faturamento,
  type Fase,
  type Trava,
} from "@/content/site";

/** DDDs em uso no Brasil (Anatel). */
const DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/**
 * Deixa só DDD + número. Aceita colar com ou sem +55, com ou sem o zero
 * de operadora, com qualquer pontuação.
 */
export function normalizarWhatsapp(entrada: string): string {
  const comMais = /^\s*\+/.test(entrada);
  let digitos = entrada.replace(/\D/g, "");
  if (digitos.startsWith("55") && (comMais || digitos.length > 11)) {
    digitos = digitos.slice(2);
  }
  return digitos.replace(/^0+/, "");
}

/** DDD válido e 10 dígitos (fixo, começa de 2 a 5) ou 11 (celular, começa com 9). */
export function whatsappValido(entrada: string): boolean {
  const d = normalizarWhatsapp(entrada);
  if (d.length !== 10 && d.length !== 11) return false;
  if (!DDDS.has(Number(d.slice(0, 2)))) return false;
  return d.length === 11 ? d[2] === "9" : /[2-5]/.test(d[2]);
}

/** Máscara aplicada enquanto a pessoa digita: (11) 91234-5678. */
export function mascararWhatsapp(entrada: string): string {
  const d = normalizarWhatsapp(entrada).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  if (resto.length <= 4) return `(${ddd}) ${resto}`;
  if (d.length <= 10) return `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`;
  return `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`;
}

/** Formato do CRM: 55 + DDD + número. */
export function whatsappInternacional(entrada: string): string {
  return `55${normalizarWhatsapp(entrada)}`;
}

const rotulo = <T extends string>(lista: readonly { id: T; rotulo: string }[], id: T) =>
  lista.find((o) => o.id === id)?.rotulo ?? id;

export type DadosMensagem = {
  nome: string;
  empresa?: string;
  trava: Trava;
  fase: Fase;
  faturamento: Faturamento;
};

export function montarMensagemDiagnostico(dados: DadosMensagem): string {
  const m = diagnostico.mensagem;
  const empresa = dados.empresa?.trim() || undefined;
  return [
    m.abertura(dados.nome.trim(), empresa),
    `${m.trava}: ${rotulo(travas, dados.trava)}`,
    `${m.fase}: ${rotulo(fases, dados.fase)}`,
    `${m.faturamento}: ${rotulo(faturamentos, dados.faturamento)}`,
  ].join("\n");
}

export function urlWhatsapp(mensagem: string, numero: string = whatsappNumero): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
