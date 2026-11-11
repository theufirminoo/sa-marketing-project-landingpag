import type { NextRequest } from "next/server";

import { bancoComercial } from "@/lib/banco/conexao";

/**
 * Sinal de vida do banco. O Supabase grátis pausa o projeto depois de 7 dias
 * sem uso; o Cron da Vercel (vercel.json) chama esta rota nos dias 1, 7, 13,
 * 19, 25 e 31 de cada mês, então o maior intervalo é de 6 dias. Grava uma
 * linha só (`comercial.manutencao`), sem dado de ninguém. Só o Cron chama:
 * a Vercel manda `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: NextRequest) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new Response(null, { status: 401 });
  }

  const sql = await bancoComercial();
  if (!sql) {
    console.warn("[manter-banco] DATABASE_URL ausente: nada a manter.");
    return Response.json({ ok: false, motivo: "sem-banco" });
  }

  try {
    await sql`
      insert into comercial.manutencao (id, ultimo_sinal, sinais)
      values (1, now(), 1)
      on conflict (id) do update set ultimo_sinal = now(), sinais = comercial.manutencao.sinais + 1
    `;
    return Response.json({ ok: true });
  } catch (erro) {
    const motivo = erro instanceof Error ? `${erro.name}${"code" in erro ? ` ${String(erro.code)}` : ""}` : "desconhecido";
    console.error(`[manter-banco] Falha ao dar sinal (${motivo}).`);
    return Response.json({ ok: false, motivo: "falha" }, { status: 500 });
  }
}
