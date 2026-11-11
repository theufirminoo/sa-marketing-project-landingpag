import { describe, expect, it } from "vitest";

import { briefingSchema, indicarFrentes, montarMensagemAgendar, montarMensagemBriefing, type RespostasBriefing } from "./briefing";
import { formatarEmpresa, formatarInstagram, formatarNome, temNomeCompleto } from "./formatar";
import { calcularFit, FIT_MAXIMO } from "./fit";

const respostas: RespostasBriefing = {
  segmento: "saude-estetica",
  faturamento: "50-200",
  origem: "indicacao",
  desafio: ["converter"],
  marketing: "eu-mesmo",
  decisao: "eu",
  prazo: "agora",
  investimento: "3000-6000",
};

const corpo = {
  nome: "Ana Souza",
  consentimento: true,
  whatsapp: "(11) 98765-4321",
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

  it("sem o aceite da abertura, recusa", () => {
    expect(briefingSchema.safeParse({ ...corpo, consentimento: false }).success).toBe(false);
    expect(briefingSchema.safeParse({ ...corpo, consentimento: undefined }).success).toBe(false);
  });

  it("exige nome e sobrenome", () => {
    const r = briefingSchema.safeParse({ ...corpo, nome: "Ana" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Informe nome e sobrenome, como Ana Souza.");
    expect(briefingSchema.safeParse({ ...corpo, nome: "Ana S" }).success).toBe(false);
    expect(briefingSchema.safeParse({ ...corpo, nome: "Ana da Silva" }).success).toBe(true);
  });

  it("desafios: pelo menos um, sem repetição, na ordem da lista", () => {
    expect(briefingSchema.safeParse({ ...corpo, desafio: [] }).success).toBe(false);
    const r = briefingSchema.safeParse({ ...corpo, desafio: ["processos-manuais", "sem-plano", "sem-plano"] });
    expect(r.data?.desafio).toEqual(["sem-plano", "processos-manuais"]);
  });

  it("recusa resposta fora da lista", () => {
    expect(briefingSchema.safeParse({ ...corpo, investimento: "1-milhao" }).success).toBe(false);
  });

  it("recusa objetivo com mais de 500 caracteres", () => {
    const r = briefingSchema.safeParse({ ...corpo, objetivo: "a".repeat(501) });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Use até 500 caracteres.");
  });

  it("Outro exige o texto escrito", () => {
    const sem = briefingSchema.safeParse({ ...corpo, segmento: "outro" });
    expect(sem.success).toBe(false);
    expect(sem.error?.issues[0].path).toEqual(["outros", "segmento"]);
    expect(sem.error?.issues[0].message).toBe("Escreva em poucas palavras para continuar.");
    const com = briefingSchema.safeParse({ ...corpo, segmento: "outro", outros: { segmento: "Oficina" } });
    expect(com.success).toBe(true);
    const desafioOutro = briefingSchema.safeParse({ ...corpo, desafio: ["converter", "outro"] });
    expect(desafioOutro.error?.issues[0].path).toEqual(["outros", "desafio"]);
  });

  it("recusa faixas que saíram do briefing", () => {
    expect(briefingSchema.safeParse({ ...corpo, faturamento: "nao-informado" }).success).toBe(false);
    expect(briefingSchema.safeParse({ ...corpo, investimento: "nao-sei" }).success).toBe(false);
  });

  it("exige WhatsApp com DDD", () => {
    expect(briefingSchema.safeParse({ ...corpo, whatsapp: "91234-5678" }).success).toBe(false);
  });
});

describe("calcularFit", () => {
  it("dono com verba, porte e prazo é alto", () => {
    expect(calcularFit(respostas)).toEqual({ fit: "alto", pontos: 13, versao: 2 });
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
    expect(calcularFit({ ...respostas, faturamento: "ate-10", investimento: "ate-1500" }).fit).toBe("baixo");
    expect(calcularFit({ ...respostas, faturamento: "10-20", investimento: "ate-1500" }).fit).toBe("baixo");
  });

  it("pontuação baixa é baixo", () => {
    const r = calcularFit({
      ...respostas,
      faturamento: "ate-10",
      marketing: "equipe-interna",
      decisao: "outra-pessoa",
      prazo: "pesquisando",
      investimento: "1500-3000",
    });
    expect(r).toEqual({ fit: "baixo", pontos: 2, versao: 2 });
  });
});

describe("montarMensagemBriefing", () => {
  it("lista as respostas pelos rótulos e inclui o objetivo", () => {
    const m = montarMensagemBriefing({ nome: " Ana ", empresa: "Clínica Ana", respostas, objetivo: "Agenda cheia" });
    expect(m.split("\n")).toEqual([
      "Oi, tudo bem? 😊 Aqui é Ana, da Clínica Ana. Respondi o briefing pelo site e quero marcar a primeira conversa 📅",
      "• Ramo: Saúde e estética",
      "• Faturamento: De R$ 50 mil a R$ 200 mil",
      "• Clientes vêm de: Indicação",
      "• Desafios: Muita conversa e pouca venda fechada",
      "• Marketing: Eu mesmo, quando dá tempo",
      "• Decisão: Eu decido",
      "• Começar: Ainda este mês",
      "• Investimento: De R$ 3.000 a R$ 6.000",
      "• Objetivo: Agenda cheia",
    ]);
  });

  it("no Outro, mostra o que a pessoa escreveu", () => {
    const m = montarMensagemBriefing({
      nome: "Ana",
      respostas: { ...respostas, segmento: "outro", desafio: ["outro"] },
      outros: { segmento: "Oficina mecânica", desafio: "Precificar" },
    });
    expect(m).toContain("• Ramo: Oficina mecânica");
    expect(m).toContain("• Desafios: Precificar");
  });

  it("sem empresa e sem objetivo", () => {
    const m = montarMensagemBriefing({ nome: "Ana", respostas });
    expect(m.startsWith("Oi, tudo bem? 😊 Aqui é Ana. Respondi")).toBe(true);
    expect(m).not.toContain("Objetivo");
  });
});

describe("indicarFrentes", () => {
  it("cada desafio aponta para a frente que cuida dele", () => {
    expect(indicarFrentes(["processos-manuais"])).toEqual(["tech"]);
    expect(indicarFrentes(["imagem-da-marca"])).toEqual(["studio"]);
    expect(indicarFrentes(["outro"])).toEqual(["consultoria"]);
  });

  it("a frente mais citada vem primeiro; no empate, a ordem do site", () => {
    expect(indicarFrentes(["atrair-clientes", "seguidores-nao-compram", "sem-plano"])).toEqual(["social", "consultoria"]);
    expect(indicarFrentes(["processos-manuais", "sem-plano"])).toEqual(["consultoria", "tech"]);
  });
});

describe("montarMensagemAgendar", () => {
  it("pede a primeira conversa com um consultor", () => {
    expect(montarMensagemAgendar({ nome: "Ana Souza", empresa: "Clínica Ana" })).toBe(
      "Oi, tudo bem? 😊 Aqui é Ana Souza, da Clínica Ana.\nAcabei de responder o briefing no site e quero marcar a primeira conversa com um consultor da SA 📅",
    );
  });
});

describe("formatação dos campos", () => {
  it("nome: iniciais maiúsculas, conectores minúsculos", () => {
    expect(formatarNome("matheus firmino da silva")).toBe("Matheus Firmino da Silva");
    expect(formatarNome("da silva")).toBe("Da Silva");
    expect(formatarNome("joão  ")).toBe("João  ");
    expect(formatarNome("Maria Da")).toBe("Maria da");
    // Digitando letra por letra, "Dani" e "Dias" não ficam presos como conector.
    let nome = "";
    for (const letra of "maria dias") nome = formatarNome(nome + letra);
    expect(nome).toBe("Maria Dias");
  });

  it("empresa: iniciais maiúsculas sem mexer em siglas", () => {
    expect(formatarEmpresa("sa marketing")).toBe("Sa Marketing");
    expect(formatarEmpresa("SA marketing")).toBe("SA Marketing");
  });

  it("instagram: @ no começo, uma vez só, sem espaço", () => {
    expect(formatarInstagram("s")).toBe("@s");
    expect(formatarInstagram("@@sa marketing")).toBe("@samarketing");
    expect(formatarInstagram("@")).toBe("");
  });

  it("nome completo: duas palavras com 2 letras ou mais", () => {
    expect(temNomeCompleto("Ana")).toBe(false);
    expect(temNomeCompleto("Ana S.")).toBe(false);
    expect(temNomeCompleto("Ana Li")).toBe(true);
  });
});
