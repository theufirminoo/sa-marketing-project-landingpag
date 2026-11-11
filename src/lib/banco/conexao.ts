import type postgres from "postgres";

export type Sql = ReturnType<typeof postgres>;
let conexao: Promise<Sql> | null = null;

/**
 * Conexão com o banco comercial (Supabase, esquema `comercial`). Use a URL do
 * pooler em modo transação (porta 6543). Sem DATABASE_URL, devolve null e
 * quem chama segue sem gravar. Só o servidor importa este módulo.
 */
export async function bancoComercial(): Promise<Sql | null> {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  // Guarda a promessa: duas chamadas ao mesmo tempo dividem a mesma conexão.
  conexao ??= import("postgres").then(({ default: postgres }) =>
    // Poucas conexões e sem prepared statements: função serverless atrás do pooler.
    postgres(url, { max: 3, idle_timeout: 20, connect_timeout: 5, prepare: false }),
  );
  return conexao;
}
