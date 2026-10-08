import { ImageResponse } from "next/og";

import { hero, metadados } from "@/content/site";
import { carregarFonte, cores } from "./_og/marca";

export const alt = metadados.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Fundo preto, o título do hero em giz e um bloco âmbar. Sem foto. */
export default async function OpengraphImage() {
  const fonte = await carregarFonte();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          padding: 64,
          background: cores.preto,
          color: cores.giz,
          fontFamily: "Bricolage",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", fontSize: 112, lineHeight: 0.95, letterSpacing: "-0.02em" }}>
          {hero.titulo.map((linha) => (
            <span key={linha}>{linha}</span>
          ))}
        </div>
        <div style={{ width: 160, height: 160, background: cores.ambar, borderRadius: 4 }} />
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Bricolage", data: fonte, style: "normal", weight: 700 }],
    },
  );
}
