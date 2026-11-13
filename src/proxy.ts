import { NextResponse, type NextRequest } from "next/server";

/**
 * Subdomínios do mesmo projeto da Vercel, cada um abrindo uma página na raiz:
 * briefing.saagencia.com.br abre o briefing e bio.saagencia.com.br, a página
 * da bio do Instagram. O resto (arquivos, /api, /ir, /privacidade) passa direto.
 */
const SUBDOMINIOS: Record<string, string> = {
  "briefing.saagencia.com.br": "/briefing",
  "bio.saagencia.com.br": "/bio",
};

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const destino = SUBDOMINIOS[host];
  if (destino) return NextResponse.rewrite(new URL(destino, request.url));
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
