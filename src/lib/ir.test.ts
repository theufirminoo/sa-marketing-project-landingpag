import { describe, expect, it } from "vitest";

import { ehDestino, ehOrigem, ehRobo, urlBotao, urlDestino } from "./ir";

describe("links da bio", () => {
  it("diagnóstico abre direto, com os UTMs da bio", () => {
    expect(urlDestino("diagnostico", "https://saagencia.com.br")).toBe(
      "https://saagencia.com.br/?diagnostico&utm_source=instagram&utm_medium=bio&utm_campaign=link-na-bio",
    );
  });

  it("site leva os UTMs da bio", () => {
    expect(urlDestino("site", "https://saagencia.com.br")).toBe(
      "https://saagencia.com.br/?utm_source=instagram&utm_medium=bio&utm_campaign=link-na-bio",
    );
  });

  it("WhatsApp abre com a mensagem de quem veio do Instagram", () => {
    const url = urlDestino("whatsapp");
    expect(url.startsWith("https://api.whatsapp.com/send?phone=")).toBe(true);
    expect(decodeURIComponent(url.split("&text=")[1])).toContain("Vim pelo Instagram da SA");
  });

  it("botões passam pela rota que conta o clique", () => {
    expect(urlBotao("whatsapp")).toBe("/ir/whatsapp?de=bio");
  });

  it("aceita só destinos e origens conhecidos", () => {
    expect(ehDestino("site")).toBe(true);
    expect(ehDestino("../admin")).toBe(false);
    expect(ehOrigem("bio")).toBe(true);
    expect(ehOrigem("qualquer")).toBe(false);
    expect(ehOrigem(null)).toBe(false);
  });

  it("robôs de prévia não contam como clique", () => {
    expect(ehRobo("facebookexternalhit/1.1")).toBe(true);
    expect(ehRobo("WhatsApp/2.23")).toBe(true);
    expect(ehRobo("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Instagram 300.0")).toBe(false);
  });
});
