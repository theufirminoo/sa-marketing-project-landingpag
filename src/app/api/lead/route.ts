import { after, type NextRequest } from "next/server";

import { gravarDiagnostico } from "@/lib/banco/comercial";
import { bancoComercial } from "@/lib/banco/conexao";
import { leadSchema, montarCorpoCrm, type CorpoCrm, type Lead } from "@/lib/lead";
import { criarLimite, ipDe } from "@/lib/limite";

/**
 * Recebe o lead do diagnóstico, valida de novo com o mesmo esquema zod e,
 * depois de responder, grava no banco comercial (um diagnóstico por WhatsApp)
 * e encaminha ao CRM. A falha do webhook nunca bloqueia a
 * pessoa: o resultado aparece e o WhatsApp leva os dados na mensagem.
 * Nunca registra dado pessoal em log de produção.
 */

const TEMPO_LIMITE_MS = 5_000;
const emProducao = process.env.NODE_ENV === "production";
const passouDoLimite = criarLimite(5);

/** Grava no banco comercial. Sem DATABASE_URL, segue só com o CRM. */
async function gravarNoBanco(lead: Lead): Promise<void> {
  const sql = await bancoComercial();
  if (!sql) return;
  try {
    await gravarDiagnostico(sql, lead);
  } catch (erro) {
    // Só o tipo do erro e o código do Postgres: nunca os dados da pessoa.
    const motivo = erro instanceof Error ? `${erro.name}${"code" in erro ? ` ${String(erro.code)}` : ""}` : "desconhecido";
    console.error(`[lead] Falha ao gravar o diagnóstico (${motivo}).`);
  }
}

async function encaminharAoCrm(corpo: CorpoCrm): Promise<void> {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) {
    if (emProducao) console.warn("[lead] CRM_WEBHOOK_URL ausente: lead não encaminhado.");
    else console.info("[lead] CRM_WEBHOOK_URL ausente. Corpo que iria ao CRM:", corpo);
    return;
  }

  const token = process.env.CRM_WEBHOOK_TOKEN;
  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
    if (!resposta.ok) console.error(`[lead] CRM respondeu ${resposta.status}.`);
  } catch (erro) {
    const motivo = erro instanceof Error ? erro.name : "desconhecido";
    console.error(`[lead] Falha ao encaminhar ao CRM (${motivo}).`);
  }
}

export async function POST(request: NextRequest) {
  if (passouDoLimite(ipDe(request))) {
    return Response.json({ ok: false, erro: "limite" }, { status: 429 });
  }

  let bruto: unknown;
  try {
    bruto = await request.json();
  } catch {
    return Response.json({ ok: false, erro: "json" }, { status: 400 });
  }

  const resultado = leadSchema.safeParse(bruto);
  if (!resultado.success) {
    const campos = [...new Set(resultado.error.issues.map((i) => i.path.join(".")))];
    return Response.json({ ok: false, erro: "validacao", campos }, { status: 400 });
  }

  // Campo isca preenchido: responde sucesso e não envia nada.
  if (resultado.data.site.trim() !== "") {
    return Response.json({ ok: true });
  }

  const corpo = montarCorpoCrm(resultado.data);
  after(() => Promise.all([gravarNoBanco(resultado.data), encaminharAoCrm(corpo)]));
  return Response.json({ ok: true });
}
