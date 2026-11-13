import { after, type NextRequest } from "next/server";

import { contarClique } from "@/lib/banco/comercial";
import { bancoComercial } from "@/lib/banco/conexao";
import { ehDestino, ehOrigem, ehRobo, urlDestino } from "@/lib/ir";

/**
 * Conta o clique de um botão da bio e leva ao destino na hora (a contagem é
 * gravada depois de responder). Guarda só dia, origem, destino e total:
 * nada sobre quem clicou.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/ir/[destino]">) {
  const { destino } = await params;
  if (!ehDestino(destino)) return new Response(null, { status: 404 });

  const de = request.nextUrl.searchParams.get("de");
  const origem = ehOrigem(de) ? de : "direto";

  if (!ehRobo(request.headers.get("user-agent") ?? "")) {
    after(async () => {
      const sql = await bancoComercial();
      if (!sql) return;
      try {
        await contarClique(sql, origem, destino);
      } catch (erro) {
        const motivo = erro instanceof Error ? erro.name : "desconhecido";
        console.error(`[ir] Falha ao contar o clique (${motivo}).`);
      }
    });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: urlDestino(destino), "Cache-Control": "no-store" },
  });
}
