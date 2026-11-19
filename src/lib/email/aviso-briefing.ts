import { briefing } from "@/content/site";
import { linhasDoBriefing, indicarFrentes, type Briefing } from "@/lib/briefing";
import type { Fit } from "@/lib/fit";
import { normalizarInstagram } from "@/lib/lead";
import { formatarFrentes } from "@/lib/recomendacao";
import { mascararWhatsapp } from "@/lib/whatsapp";

/**
 * E-mail para a SA a cada briefing gravado: quem é, o FIT (só interno) e o
 * que a pessoa respondeu, na ordem da conversa. Enviado pelo Resend (API
 * HTTP, sem SDK). Sem RESEND_API_KEY, nada é enviado e o briefing segue
 * gravado no banco. Nunca registra dado pessoal em log.
 */

const PARA = process.env.AVISO_EMAIL_PARA || "contato@saagencia.com.br";
const DE = process.env.AVISO_EMAIL_DE || "SA Marketing <avisos@envio.saagencia.com.br>";
const TEMPO_LIMITE_MS = 8_000;

const escapar = (texto: string) =>
  texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FIT_ROTULO = { alto: "FIT alto", medio: "FIT médio", baixo: "FIT baixo" } as const;

export type EmailMontado = { assunto: string; html: string; texto: string };

export function montarEmailBriefing(dados: Briefing, fit: Fit, agora: Date = new Date()): EmailMontado {
  const quem = dados.empresa.trim() || dados.nome.trim();
  const assunto = `Novo briefing: ${quem} · ${FIT_ROTULO[fit.fit]}`;
  const instagram = normalizarInstagram(dados.instagram);
  const frentes = formatarFrentes(indicarFrentes(dados.desafio));
  const quando = agora.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
  const rotulos = briefing.mensagem.rotulos;

  const cabecalho: [string, string][] = [
    ["Empresa", dados.empresa.trim() || "(não informada)"],
    ["Nome", dados.nome.trim()],
    ["WhatsApp", mascararWhatsapp(dados.whatsapp)],
    ...(instagram ? [["Instagram", instagram] as [string, string]] : []),
    ["FIT", `${FIT_ROTULO[fit.fit]} (${fit.pontos} de 15 pontos)`],
    ["Frentes indicadas", frentes],
    ["Recebido em", quando],
  ];
  const respostas = linhasDoBriefing(dados, dados.outros).map(([id, valor]) => [rotulos[id], valor] as [string, string]);
  const origem = [dados.utm.source, dados.utm.medium, dados.utm.campaign].filter(Boolean).join(" / ");

  const linhaHtml = ([k, v]: [string, string]) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${escapar(k)}</td><td style="padding:6px 0;color:#1a1a1a">${escapar(v)}</td></tr>`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:24px;background:#f5f5f3;font-family:Arial,sans-serif;font-size:15px;line-height:1.5">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:24px">
<p style="margin:0 0 4px;color:#d9531a;font-weight:bold">Novo briefing</p>
<h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a">${escapar(quem)}</h1>
<table style="border-collapse:collapse;width:100%">${cabecalho.map(linhaHtml).join("")}</table>
<h2 style="margin:24px 0 8px;font-size:17px;color:#1a1a1a">Respostas</h2>
<table style="border-collapse:collapse;width:100%">${respostas.map(linhaHtml).join("")}</table>
${origem ? `<p style="margin:20px 0 0;color:#666;font-size:13px">Origem: ${escapar(origem)}</p>` : ""}
</div></body></html>`;

  const texto = [
    assunto,
    "",
    ...cabecalho.map(([k, v]) => `${k}: ${v}`),
    "",
    "Respostas",
    ...respostas.map(([k, v]) => `${k}: ${v}`),
    ...(origem ? ["", `Origem: ${origem}`] : []),
  ].join("\n");

  return { assunto, html, texto };
}

/** Envia pelo Resend. Devolve se foi aceito. Sem chave, não envia. */
export async function enviarEmail(email: EmailMontado): Promise<boolean> {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    if (process.env.NODE_ENV === "production") console.warn("[email] RESEND_API_KEY ausente: aviso não enviado.");
    return false;
  }
  try {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: DE, to: [PARA], subject: email.assunto, html: email.html, text: email.texto }),
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
    if (!resposta.ok) console.error(`[email] Resend respondeu ${resposta.status}.`);
    return resposta.ok;
  } catch (erro) {
    console.error(`[email] Falha ao enviar (${erro instanceof Error ? erro.name : "desconhecido"}).`);
    return false;
  }
}
