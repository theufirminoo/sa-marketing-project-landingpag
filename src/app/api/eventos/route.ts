import { createHash } from "node:crypto";

import { after, type NextRequest } from "next/server";

import { lerAgente } from "@/lib/metricas/agente";
import { loteSchema } from "@/lib/metricas/esquema";
import { gravarLote } from "@/lib/metricas/gravar";

/**
 * Recebe os lotes de eventos do coletor (só depois do "Aceitar"), valida,
 * acrescenta o que o servidor sabe (país, região e cidade pelo cabeçalho da
 * hospedagem, navegador e aparelho pelo User-Agent) e grava depois de
 * responder. O IP nunca é guardado: vira um código que muda todo dia, só
 * para separar visitas sem identificar ninguém.
 */

const LIMITE_POR_MINUTO = 120;
const JANELA_MS = 60_000;
const TAMANHO_MAXIMO = 64_000;
const chamadas = new Map<string, number[]>();

function passouDoLimite(ip: string, agora: number): boolean {
  const recentes = (chamadas.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  recentes.push(agora);
  chamadas.set(ip, recentes);
  if (chamadas.size > 5_000) {
    for (const [chave, tempos] of chamadas) {
      if (tempos.every((t) => agora - t >= JANELA_MS)) chamadas.delete(chave);
    }
  }
  return recentes.length > LIMITE_POR_MINUTO;
}

function ipDe(request: NextRequest): string {
  const encaminhado = request.headers.get("x-forwarded-for");
  return encaminhado?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "desconhecido";
}

/** Código do IP com sal e data: o mesmo IP gera outro código no dia seguinte. */
function codigoDoIp(ip: string, dia: string): string {
  const sal = process.env.EVENTOS_SAL || "sa-sem-sal";
  return createHash("sha256").update(`${sal}|${dia}|${ip}`).digest("hex").slice(0, 16);
}

function cabecalho(request: NextRequest, nome: string): string | null {
  const valor = request.headers.get(nome);
  if (!valor) return null;
  try {
    return decodeURIComponent(valor).slice(0, 80);
  } catch {
    return valor.slice(0, 80);
  }
}

export async function POST(request: NextRequest) {
  const ip = ipDe(request);
  const agora = new Date();
  if (passouDoLimite(ip, agora.getTime())) return new Response(null, { status: 429 });

  const corpo = await request.text();
  if (corpo.length > TAMANHO_MAXIMO) return new Response(null, { status: 413 });

  let bruto: unknown;
  try {
    bruto = JSON.parse(corpo);
  } catch {
    return new Response(null, { status: 400 });
  }
  const resultado = loteSchema.safeParse(bruto);
  if (!resultado.success) return new Response(null, { status: 400 });

  const userAgent = request.headers.get("user-agent") ?? "";
  const servidor = {
    recebidoEm: agora,
    ipHash: codigoDoIp(ip, agora.toISOString().slice(0, 10)),
    pais: cabecalho(request, "x-vercel-ip-country"),
    regiao: cabecalho(request, "x-vercel-ip-country-region"),
    cidade: cabecalho(request, "x-vercel-ip-city"),
    agente: lerAgente(userAgent),
    userAgent,
  };
  after(() => gravarLote(resultado.data.contexto, resultado.data.eventos, servidor));
  return new Response(null, { status: 204 });
}
