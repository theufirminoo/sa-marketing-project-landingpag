import type { NextRequest } from "next/server";

/**
 * Limite simples de chamadas por IP, em memória. Em várias instâncias da
 * função, vale por instância: segura robô insistente, não ataque distribuído.
 */
export function criarLimite(maximoPorMinuto: number) {
  const JANELA_MS = 60_000;
  const chamadas = new Map<string, number[]>();
  return function passouDoLimite(ip: string, agora: number = Date.now()): boolean {
    const recentes = (chamadas.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
    recentes.push(agora);
    chamadas.set(ip, recentes);
    if (chamadas.size > 5_000) {
      for (const [chave, tempos] of chamadas) {
        if (tempos.every((t) => agora - t >= JANELA_MS)) chamadas.delete(chave);
      }
    }
    return recentes.length > maximoPorMinuto;
  };
}

export function ipDe(request: NextRequest): string {
  const encaminhado = request.headers.get("x-forwarded-for");
  return encaminhado?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "desconhecido";
}
