import { describe, expect, it } from "vitest";

import { contatoSchema, leadSchema, montarCorpoCrm, normalizarInstagram } from "./lead";

const contatoValido = {
  nome: "Ana",
  whatsapp: "(11) 91234-5678",
  empresa: "",
  instagram: "",
  site: "",
};

describe("contatoSchema", () => {
  it("aceita o mínimo obrigatório", () => {
    expect(contatoSchema.safeParse(contatoValido).success).toBe(true);
  });

  it("exige nome com 2 caracteres", () => {
    const r = contatoSchema.safeParse({ ...contatoValido, nome: " A " });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Informe seu nome para a SA saber com quem fala.");
  });

  it("recusa WhatsApp sem DDD", () => {
    const r = contatoSchema.safeParse({ ...contatoValido, whatsapp: "91234-5678" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe(
      "Faltam dígitos. Informe o DDD e os 9 números, como (11) 91234-5678.",
    );
  });
});

describe("leadSchema", () => {
  const lead = {
    ...contatoValido,
    trava: "seguidores-nao-vendem",
    fase: "constancia",
    faturamento: "20-50",
  };

  it("aceita um lead completo sem UTM", () => {
    const r = leadSchema.safeParse(lead);
    expect(r.success).toBe(true);
    expect(r.data?.utm).toEqual({});
  });

  it("recusa resposta fora das opções", () => {
    expect(leadSchema.safeParse({ ...lead, fase: "outra" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...lead, frenteDeInteresse: "marketing" }).success).toBe(false);
  });
});

describe("normalizarInstagram", () => {
  it("aceita com ou sem @ e com o endereço do perfil", () => {
    expect(normalizarInstagram("suaempresa")).toBe("@suaempresa");
    expect(normalizarInstagram("@SuaEmpresa")).toBe("@suaempresa");
    expect(normalizarInstagram("https://www.instagram.com/suaempresa/?hl=pt")).toBe("@suaempresa");
    expect(normalizarInstagram("  ")).toBe("");
  });
});

describe("montarCorpoCrm", () => {
  it("monta o corpo no formato do CRM", () => {
    const lead = leadSchema.parse({
      nome: " Ana ",
      whatsapp: "+55 (11) 91234-5678",
      empresa: "Padaria Pão Bom",
      instagram: "@padariapaobom",
      site: "",
      trava: "seguidores-nao-vendem",
      fase: "constancia",
      faturamento: "20-50",
      frenteDeInteresse: "tech",
      utm: { source: "instagram", medium: "pago", campaign: "outubro" },
      pagina: "https://samarketing.co.br/",
      referrer: "https://l.instagram.com/",
    });
    const corpo = montarCorpoCrm(lead, new Date("2026-10-07T14:03:00.000Z"));
    expect(corpo).toEqual({
      origem: "landing-sa",
      enviadoEm: "2026-10-07T14:03:00.000Z",
      nome: "Ana",
      whatsapp: "5511912345678",
      empresa: "Padaria Pão Bom",
      instagram: "@padariapaobom",
      trava: "seguidores-nao-vendem",
      fase: "constancia",
      faturamento: "20-50",
      frenteDeInteresse: "tech",
      frentesRecomendadas: ["tech", "consultoria", "social"],
      utm: { source: "instagram", medium: "pago", campaign: "outubro" },
      pagina: "https://samarketing.co.br/",
      referrer: "https://l.instagram.com/",
    });
  });
});
