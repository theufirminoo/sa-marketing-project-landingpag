import { NextResponse, type NextRequest } from "next/server";

/**
 * briefing.saagencia.com.br abre o formulário de briefing na raiz. O resto
 * (arquivos, /api, /privacidade) passa direto, no mesmo projeto da Vercel.
 */
const HOST_BRIEFING = "briefing.saagencia.com.br";

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (host === HOST_BRIEFING) {
    return NextResponse.rewrite(new URL("/briefing", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
