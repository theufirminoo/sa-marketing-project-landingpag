import type { NextRequest } from "next/server";
import { z } from "zod";

import { registrarWhatsappAberto } from "@/lib/banco/comercial";
import { bancoComercial } from "@/lib/banco/conexao";
import { criarLimite, ipDe } from "@/lib/limite";

/**
 * A tela final avisa aqui quando a pessoa toca em "Chamar um consultor no
 * WhatsApp". Só leva o código do briefing (nunca o número), e o contato passa
 * a "abriu-whatsapp". Não dá para saber se a mensagem foi enviada: isso a
 * equipe confirma no WhatsApp e marca "em-atendimento".
 */

const passouDoLimite = criarLimite(10);
const corpoSchema = z.object({ codigo: z.uuid() });

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
    const achou = await registrarWhatsappAberto(sql, resultado.data.codigo);
    return new Response(null, { status: achou ? 204 : 404 });
  } catch (erro) {
    const motivo = erro instanceof Error ? `${erro.name}${"code" in erro ? ` ${String(erro.code)}` : ""}` : "desconhecido";
    console.error(`[briefing/whatsapp] Falha ao registrar (${motivo}).`);
    return new Response(null, { status: 500 });
  }
}
