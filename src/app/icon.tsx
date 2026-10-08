import { ImageResponse } from "next/og";

import { carregarFonte, cores } from "./_og/marca";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Provisório: "SA" em giz sobre preto, até a logo vetorial chegar. */
export default async function Icon() {
  const fonte = await carregarFonte();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: cores.preto,
          color: cores.giz,
          fontFamily: "Bricolage",
          fontSize: 20,
          letterSpacing: "-0.02em",
        }}
      >
        SA
      </div>
    ),
    { ...size, fonts: [{ name: "Bricolage", data: fonte, style: "normal", weight: 700 }] },
  );
}
