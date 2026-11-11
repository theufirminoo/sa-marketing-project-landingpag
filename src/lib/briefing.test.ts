import { describe, expect, it } from "vitest";

import { briefingSchema, montarMensagemBriefing, type RespostasBriefing } from "./briefing";
import { calcularFit, FIT_MAXIMO } from "./fit";

const respostas: RespostasBriefing = {
  segmento: "saude-estetica",
  faturamento: "50-200",
  origem: "indicacao",
  marketing: "eu-mesmo",
  decisao: "eu",
  prazo: "agora",
  investimento: "3000-6000",
};

const corpo = {
  nome: "Ana Souza",
  whatsapp: "(11) 91234-5678",
  empresa: "Clínica Ana",
  instagram: "",
  site: "",
  ...respostas,
};

describe("briefingSchema", () => {
  it("aceita o briefing sem objetivo e sem origem", () => {
    const r = briefingSchema.safeParse(corpo);
    expect(r.success).toBe(true);
    expect(r.data?.objetivo).toBe("");
    expect(r.data?.utm).toEqual({});
  });

  it("recusa resposta fora da lista", () => {
    expect(briefingSchema.safeParse({ ...corpo, investimento: "1-milhao" }).success).toBe(false);
  });

  it("recusa objetivo com mais de 500 caracteres", () => {
    const r = briefingSchema.safeParse({ ...corpo, objetivo: "a".repeat(501) });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Use até 500 caracteres.");
  });

  it("exige WhatsApp com DDD", () => {
    expect(briefingSchema.safeParse({ ...corpo, whatsapp: "91234-5678" }).success).toBe(false);
  });
});

describe("calcularFit", () => {
  it("dono com verba, porte e prazo é alto", () => {
    expect(calcularFit(respostas)).toEqual({ fit: "alto", pontos: 13, versao: 1 });
  });

  it("pontuação máxima bate com FIT_MAXIMO", () => {
    const r = calcularFit({ ...respostas, faturamento: "acima-200", investimento: "acima-6000" });
    expect(r.pontos).toBe(FIT_MAXIMO);
  });

  it("quem ainda pesquisa fica no máximo médio", () => {
    const r = calcularFit({ ...respostas, faturamento: "acima-200", investimento: "acima-6000", prazo: "pesquisando" });
    expect(r.pontos).toBeGreaterThanOrEqual(11);
    expect(r.fit).toBe("medio");
  });

  it("quem não decide fica no máximo médio", () => {
    expect(calcularFit({ ...respostas, faturamento: "acima-200", decisao: "outra-pessoa" }).fit).toBe("medio");
  });

  it("sem verba e sem porte é baixo", () => {
    expect(calcularFit({ ...respostas, faturamento: "ate-20", investimento: "ate-1500" }).fit).toBe("baixo");
  });

  it("pontuação baixa é baixo", () => {
    const r = calcularFit({
      ...respostas,
      faturamento: "ate-20",
      marketing: "equipe-interna",
      decisao: "outra-pessoa",
      prazo: "pesquisando",
      investimento: "nao-sei",
    });
    expect(r).toEqual({ fit: "baixo", pontos: 2, versao: 1 });
  });
});

describe("montarMensagemBriefing", () => {
  it("lista as respostas pelos rótulos e inclui o objetivo", () => {
    const m = montarMensagemBriefing({ nome: " Ana ", empresa: "Clínica Ana", respostas, objetivo: "Agenda cheia" });
    expect(m.split("\n")).toEqual([
      "Oi, tudo bem? 😊 Aqui é Ana, da Clínica Ana. Respondi o briefing pelo site:",
      "• Ramo: Saúde e estética",
      "• Faturamento: De R$ 50 mil a R$ 200 mil",
      "• Clientes vêm de: Indicação",
      "• Marketing: Eu mesmo, quando dá tempo",
      "• Decisão: Eu decido",
      "• Começar: Ainda este mês",
      "• Investimento: De R$ 3.000 a R$ 6.000",
      "• Objetivo: Agenda cheia",
    ]);
  });

  it("sem empresa e sem objetivo", () => {
    const m = montarMensagemBriefing({ nome: "Ana", respostas });
    expect(m.startsWith("Oi, tudo bem? 😊 Aqui é Ana. Respondi")).toBe(true);
    expect(m).not.toContain("Objetivo");
  });
});
