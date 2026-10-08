import { after, type NextRequest } from "next/server";

import { leadSchema, montarCorpoCrm, type CorpoCrm } from "@/lib/lead";

/**
 * Recebe o lead do diagnóstico, valida de novo com o mesmo esquema zod e
 * encaminha ao CRM depois de responder. A falha do webhook nunca bloqueia a
 * pessoa: o resultado aparece e o WhatsApp leva os dados na mensagem.
 * Nunca registra dado pessoal em log de produção.
 */

const LIMITE_POR_MINUTO = 5;
const JANELA_MS = 60_000;
const TEMPO_LIMITE_MS = 5_000;
const emProducao = process.env.NODE_ENV === "production";

/** Limite simples por IP, em memória. Em várias instâncias, vale por instância. */
const envios = new Map<string, number[]>();

function passouDoLimite(ip: string, agora: number): boolean {
  const recentes = (envios.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  recentes.push(agora);
  envios.set(ip, recentes);
  if (envios.size > 5_000) {
    for (const [chave, tempos] of envios) {
      if (tempos.every((t) => agora - t >= JANELA_MS)) envios.delete(chave);
    }
  }
  return recentes.length > LIMITE_POR_MINUTO;
}

function ipDe(request: NextRequest): string {
  const encaminhado = request.headers.get("x-forwarded-for");
  return encaminhado?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "desconhecido";
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
  if (passouDoLimite(ipDe(request), Date.now())) {
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
  after(() => encaminharAoCrm(corpo));
  return Response.json({ ok: true });
}
