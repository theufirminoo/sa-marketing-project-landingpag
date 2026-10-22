import { describe, expect, it } from "vitest";

import { lerAgente } from "./agente";
import { loteSchema } from "./esquema";

const contexto = {
  visitante: "6f1c2a52-6a0e-4d6f-9b8a-1c2d3e4f5a6b",
  sessao: "0b7e8c1d-2f3a-4b5c-8d9e-0a1b2c3d4e5f",
  visita: 1,
  pagina: "/",
  utm: { source: "instagram" },
};
const evento = { tipo: "visualizacao", t: 120, em: "2026-10-22T12:00:00.000Z", dados: { ttfb: 80 } };

describe("lote de métricas", () => {
  it("aceita um lote válido", () => {
    expect(loteSchema.safeParse({ contexto, eventos: [evento] }).success).toBe(true);
  });

  it("recusa tipo desconhecido e lote vazio", () => {
    expect(loteSchema.safeParse({ contexto, eventos: [{ ...evento, tipo: "senha" }] }).success).toBe(false);
    expect(loteSchema.safeParse({ contexto, eventos: [] }).success).toBe(false);
  });

  it("recusa identificador que não é aleatório (uuid)", () => {
    expect(loteSchema.safeParse({ contexto: { ...contexto, visitante: "ana@email.com" }, eventos: [evento] }).success).toBe(false);
  });

  it("recusa dado aninhado no evento", () => {
    expect(loteSchema.safeParse({ contexto, eventos: [{ ...evento, dados: { lead: { nome: "Ana" } } }] }).success).toBe(false);
  });
});

describe("leitura do User-Agent", () => {
  it("reconhece iPhone no Instagram", () => {
    const a = lerAgente("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0");
    expect(a).toMatchObject({ navegador: "Instagram", sistema: "iOS", dispositivo: "celular", robo: false });
  });

  it("reconhece Chrome no Windows e robôs", () => {
    expect(lerAgente("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36")).toMatchObject({
      navegador: "Chrome",
      sistema: "Windows",
      dispositivo: "computador",
    });
    expect(lerAgente("Mozilla/5.0 (compatible; Googlebot/2.1)").robo).toBe(true);
  });
});
