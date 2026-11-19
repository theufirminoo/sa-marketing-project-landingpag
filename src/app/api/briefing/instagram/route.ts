import type { NextRequest } from "next/server";
import { z } from "zod";

import { registrarInstagram } from "@/lib/banco/comercial";
import { bancoComercial } from "@/lib/banco/conexao";
import { criarLimite, ipDe } from "@/lib/limite";

/**
 * A tela do presente avisa aqui: "clicou" quando a pessoa toca em "Seguir a
 * SA no Instagram" e "continuou" quando sai da tela. Só leva o código do
 * briefing. O site não sabe se a pessoa seguiu; a equipe confirma e marca
 * `contatos.segue_instagram`.
 */

const passouDoLimite = criarLimite(10);
const corpoSchema = z.object({ codigo: z.uuid(), acao: z.enum(["clicou", "continuou"]) });

export async function POST(request: NextRequest) {
  if (passouDoLimite(ipDe(request))) return new Response(null, { status: 429 });

  let bruto: unknown;
  try {
    bruto = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const resultado = corpoSchema.safeParse(bruto);
  if (!resultado.success) return new Response(null, { status: 400 });

  const sql = await bancoComercial();
  if (!sql) return new Response(null, { status: 204 });

  try {
    const achou = await registrarInstagram(sql, resultado.data.codigo, resultado.data.acao);
    return new Response(null, { status: achou ? 204 : 404 });
  } catch (erro) {
    const motivo = erro instanceof Error ? `${erro.name}${"code" in erro ? ` ${String(erro.code)}` : ""}` : "desconhecido";
    console.error(`[briefing/instagram] Falha ao registrar (${motivo}).`);
    return new Response(null, { status: 500 });
  }
}
