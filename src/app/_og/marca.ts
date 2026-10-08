import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * O ImageResponse (Satori) não lê variáveis CSS: estas são as cores de
 * marca de docs/design-system/sa-tokens.css, repetidas aqui de propósito.
 */
export const cores = {
  preto: "#1A1A1A", // --marca-preto
  giz: "#F5F5F3", // --marca-giz
  ambar: "#F7A866", // --marca-ambar
} as const;

let fonte: Promise<Buffer> | undefined;

/**
 * Bricolage Grotesque 700, largura 75%, tamanho óptico 96: instância estática
 * do Google Fonts. Lida uma vez por processo.
 */
export function carregarFonte() {
  fonte ??= readFile(join(process.cwd(), "src/app/_og/bricolage-condensada-700.ttf"));
  return fonte;
}
