import type postgres from "postgres";

import type { Contexto, Evento } from "./esquema";
import type { Agente } from "./agente";

/** O que o servidor acrescenta a cada lote, sem guardar o IP. */
export type Servidor = {
  recebidoEm: Date;
  ipHash: string;
  pais: string | null;
  regiao: string | null;
  cidade: string | null;
  agente: Agente;
  userAgent: string;
};

type Sql = ReturnType<typeof postgres>;
let conexao: Sql | null = null;

async function banco(): Promise<Sql | null> {
  const url = process.env.EVENTOS_DATABASE_URL;
  if (!url) return null;
  if (!conexao) {
    const { default: postgres } = await import("postgres");
    // Poucas conexões: a rota roda em função serverless.
    conexao = postgres(url, { max: 3, idle_timeout: 20, connect_timeout: 5, prepare: false });
  }
  return conexao;
}

/**
 * Grava o lote na tabela `eventos` (ver db/metricas.sql). Sem
 * EVENTOS_DATABASE_URL, em desenvolvimento mostra um resumo no console e em
 * produção descarta. Falha de banco nunca chega à pessoa.
 */
export async function gravarLote(contexto: Contexto, eventos: Evento[], servidor: Servidor): Promise<void> {
  const sql = await banco();
  if (!sql) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[métricas] ${eventos.length} evento(s): ${eventos.map((e) => e.tipo).join(", ")} | ${servidor.agente.dispositivo}, ${servidor.agente.navegador}`);
    }
    return;
  }
  const { utm, ...resto } = contexto;
  const linhas = eventos.map((e) => ({
    recebido_em: servidor.recebidoEm,
    ocorrido_em: new Date(e.em),
    t_ms: Math.round(e.t),
    tipo: e.tipo,
    visitante_id: contexto.visitante,
    sessao_id: contexto.sessao,
    visita_n: contexto.visita,
    pagina: contexto.pagina,
    referrer: contexto.referrer ?? null,
    utm_source: utm.source ?? null,
    utm_medium: utm.medium ?? null,
    utm_campaign: utm.campaign ?? null,
    utm_content: utm.content ?? null,
    utm_term: utm.term ?? null,
    tem_fbclid: Boolean(utm.fbclid),
    tem_gclid: Boolean(utm.gclid),
    dados: e.dados,
    contexto: resto,
    pais: servidor.pais,
    regiao: servidor.regiao,
    cidade: servidor.cidade,
    ip_hash: servidor.ipHash,
    navegador: servidor.agente.navegador,
    sistema: servidor.agente.sistema,
    dispositivo: servidor.agente.dispositivo,
    robo: servidor.agente.robo || Boolean(contexto.automatizado),
    user_agent: servidor.userAgent.slice(0, 400),
  }));
  try {
    await sql`insert into eventos ${sql(linhas)}`;
  } catch (erro) {
    const motivo = erro instanceof Error ? erro.message.slice(0, 120) : "desconhecido";
    console.error(`[métricas] Falha ao gravar ${linhas.length} evento(s): ${motivo}`);
  }
}
