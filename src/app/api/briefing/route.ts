import { after, type NextRequest } from "next/server";

import { gravarBriefing, lerInstagram, marcarAvisoEnviado } from "@/lib/banco/comercial";
import { bancoComercial } from "@/lib/banco/conexao";
import { briefingSchema } from "@/lib/briefing";
import { montarEmailBriefing, enviarEmail } from "@/lib/email/aviso-briefing";
import { calcularFit } from "@/lib/fit";
import { criarLimite, ipDe } from "@/lib/limite";

/**
 * Recebe o briefing, valida com o mesmo esquema do formulário, calcula o FIT
 * (só para a SA), grava antes de responder e, depois, manda o e-mail de aviso
 * para a SA (src/lib/email/aviso-briefing.ts): a tela de agradecimento só diz
 * "a SA recebeu" quando o banco confirmou. Sem banco ou com falha, responde
 * `salvo: false` e a pessoa envia pelo WhatsApp. Nunca registra dado pessoal.
 */

const passouDoLimite = criarLimite(5);
/** O e-mail espera a pessoa sair da tela do presente (até 2 min) para contar o toque no Instagram. */
const ESPERA_INSTAGRAM_MS = 120_000;
const INTERVALO_MS = 5_000;

// Tempo da função: a resposta sai na hora; o e-mail pode esperar até 2 min depois.
export const maxDuration = 180;
const TEMPO_LIMITE_MS = 6_000;

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

  const resultado = briefingSchema.safeParse(bruto);
  if (!resultado.success) {
    const campos = [...new Set(resultado.error.issues.map((i) => i.path.join(".")))];
    return Response.json({ ok: false, erro: "validacao", campos }, { status: 400 });
  }

  // Campo isca preenchido: finge sucesso e não grava.
  if (resultado.data.site.trim() !== "") {
    return Response.json({ ok: true, salvo: true });
  }

  const sql = await bancoComercial();
  if (!sql) {
    if (process.env.NODE_ENV === "production") console.warn("[briefing] DATABASE_URL ausente: briefing não gravado.");
    return Response.json({ ok: true, salvo: false });
  }

  let relogio: ReturnType<typeof setTimeout> | undefined;
  try {
    const esgotou = new Promise<never>((_, rejeita) => {
      relogio = setTimeout(() => rejeita(new Error("tempo esgotado")), TEMPO_LIMITE_MS);
    });
    const fit = calcularFit(resultado.data);
    const codigo = await Promise.race([gravarBriefing(sql, resultado.data, fit), esgotou]);
    // Depois de responder: espera a pessoa passar pela tela do presente (ou
    // 2 min), manda o e-mail para a SA com o toque no Instagram e marca a fila.
    after(async () => {
      let instagram = { clicouEm: null as Date | null, saiu: false };
      for (let esperado = 0; esperado < ESPERA_INSTAGRAM_MS; esperado += INTERVALO_MS) {
        instagram = await lerInstagram(sql, codigo).catch(() => instagram);
        if (instagram.saiu) break;
        await new Promise((fim) => setTimeout(fim, INTERVALO_MS));
      }
      const enviado = await enviarEmail(montarEmailBriefing(resultado.data, fit, new Date(), instagram.clicouEm));
      if (enviado) await marcarAvisoEnviado(sql, codigo).catch(() => {});
    });
    return Response.json({ ok: true, salvo: true, codigo });
  } catch (erro) {
    // Só o tipo do erro e o código do Postgres: nunca os dados da pessoa.
    const motivo = erro instanceof Error ? `${erro.name}${"code" in erro ? ` ${String(erro.code)}` : ""}` : "desconhecido";
    console.error(`[briefing] Falha ao gravar (${motivo}).`);
    return Response.json({ ok: true, salvo: false });
  } finally {
    clearTimeout(relogio);
  }
}
