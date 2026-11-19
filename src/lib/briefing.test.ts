import { describe, expect, it } from "vitest";

import {
  briefingSchema,
  etapasAtivas,
  indicarFrentes,
  montarMensagemAgendar,
  montarMensagemBriefing,
  type RespostasBriefing,
} from "./briefing";
import { montarEmailBriefing } from "./email/aviso-briefing";
import { formatarEmpresa, formatarInstagram, formatarNome, temNomeCompleto } from "./formatar";
import { calcularFit, FIT_MAXIMO } from "./fit";

const respostas: RespostasBriefing = {
  segmento: "saude-estetica",
  tempo: "3-5",
  produto: "Limpeza de pele",
  faturamento: "50-200",
  origem: "indicacao",
  estrategia: "nao-mas-pretendo",
  desafio: ["processo-comercial"],
  decisao: "eu",
  prazo: "agora",
  investimento: "2500-5000",
  objetivo: "",
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

  it("problemas: pelo menos um, sem repetição, na ordem da lista", () => {
    expect(briefingSchema.safeParse({ ...corpo, desafio: [] }).success).toBe(false);
    const r = briefingSchema.safeParse({ ...corpo, desafio: ["site-inadequado", "poucas-vendas", "poucas-vendas"] });
    expect(r.data?.desafio).toEqual(["poucas-vendas", "site-inadequado"]);
  });

  it("recusa resposta fora da lista", () => {
    expect(briefingSchema.safeParse({ ...corpo, investimento: "1-milhao" }).success).toBe(false);
    expect(briefingSchema.safeParse({ ...corpo, faturamento: "nao-informado" }).success).toBe(false);
  });

  it("produto é obrigatório; objetivo é opcional", () => {
    expect(briefingSchema.safeParse({ ...corpo, produto: " " }).error?.issues[0].message).toBe(
      "Escreva o produto ou serviço para continuar.",
    );
    expect(briefingSchema.safeParse({ ...corpo, objetivo: "a".repeat(501) }).error?.issues[0].message).toBe(
      "Use até 500 caracteres.",
    );
  });

  it("quem cuida do marketing: exigido só com estratégia, e descartado sem ela", () => {
    expect(briefingSchema.safeParse({ ...corpo, estrategia: "sim" }).success).toBe(false);
    expect(briefingSchema.safeParse({ ...corpo, estrategia: "sim", marketing: "eu-mesmo" }).data?.marketing).toBe("eu-mesmo");
    expect(briefingSchema.safeParse({ ...corpo, estrategia: "nao", marketing: "eu-mesmo" }).data?.marketing).toBeUndefined();
  });

  it("Outro exige o texto escrito", () => {
    const sem = briefingSchema.safeParse({ ...corpo, segmento: "outro" });
    expect(sem.error?.issues[0].path).toEqual(["outros", "segmento"]);
    expect(sem.error?.issues[0].message).toBe("Escreva em poucas palavras para continuar.");
    expect(briefingSchema.safeParse({ ...corpo, segmento: "outro", outros: { segmento: "Oficina" } }).success).toBe(true);
    const problemaOutro = briefingSchema.safeParse({ ...corpo, desafio: ["poucas-vendas", "outro"] });
    expect(problemaOutro.error?.issues[0].path).toEqual(["outros", "desafio"]);
  });

  it("exige WhatsApp com DDD", () => {
    expect(briefingSchema.safeParse({ ...corpo, whatsapp: "91234-5678" }).success).toBe(false);
  });
});

describe("etapas", () => {
  it("'quem cuida' só aparece para quem tem estratégia", () => {
    expect(etapasAtivas({ estrategia: "nao" }).map((e) => e.id)).not.toContain("marketing");
    expect(etapasAtivas({ estrategia: "sim" }).map((e) => e.id)).toContain("marketing");
  });

  it("a conversa segue os quatro capítulos, na ordem", () => {
    const blocos = etapasAtivas({ estrategia: "sim" }).map((e) => e.bloco);
    expect([...new Set(blocos)]).toEqual(["empresa", "vendas", "problemas", "proximos"]);
  });
});

describe("calcularFit", () => {
  it("dono sem estratégia, com porte, verba e prazo é alto", () => {
    expect(calcularFit(respostas)).toEqual({ fit: "alto", pontos: 13, versao: 3 });
  });

  it("pontuação máxima bate com FIT_MAXIMO", () => {
    const r = calcularFit({ ...respostas, faturamento: "acima-200", investimento: "acima-10000" });
    expect(r.pontos).toBe(FIT_MAXIMO);
  });

  it("com estratégia, a necessidade vem de quem cuida", () => {
    const sozinho = calcularFit({ ...respostas, estrategia: "sim", marketing: "eu-mesmo" });
    const equipe = calcularFit({ ...respostas, estrategia: "sim", marketing: "equipe-interna" });
    expect(sozinho.pontos - equipe.pontos).toBe(2);
  });

  it("quem ainda pesquisa ou não decide fica no máximo médio", () => {
    expect(calcularFit({ ...respostas, faturamento: "acima-200", prazo: "pesquisando" }).fit).toBe("medio");
    expect(calcularFit({ ...respostas, faturamento: "acima-200", decisao: "outra-pessoa" }).fit).toBe("medio");
  });

  it("sem verba e sem porte é baixo", () => {
    expect(calcularFit({ ...respostas, faturamento: "ate-10", investimento: "ate-1000" }).fit).toBe("baixo");
    expect(calcularFit({ ...respostas, faturamento: "10-20", investimento: "ate-1000" }).fit).toBe("baixo");
  });
});

describe("montarMensagemBriefing", () => {
  it("lista as respostas na ordem da conversa", () => {
    const m = montarMensagemBriefing({
      nome: " Ana ",
      empresa: "Clínica Ana",
      respostas: { ...respostas, objetivo: "Agenda cheia" },
    });
    expect(m.split("\n")).toEqual([
      "Oi, tudo bem? 😊 Aqui é Ana, da Clínica Ana. Respondi o briefing pelo site e quero marcar a primeira conversa.",
      "• Ramo: Saúde e estética",
      "• No mercado há: De 3 a 5 anos",
      "• Mais vende: Limpeza de pele",
      "• Faturamento: De R$ 50 mil a R$ 200 mil",
      "• Clientes vêm de: Indicação",
      "• Estratégia de marketing: Não, mas pretendo ter",
      "• Problemas: Problemas no processo comercial",
      "• Decisão: Eu decido",
      "• Começar: Ainda este mês",
      "• Investimento: De R$ 2.500 a R$ 5.000",
      "• Como deseja estar em 6 meses a 1 ano: Agenda cheia",
    ]);
  });

  it("no Outro, mostra o que a pessoa escreveu; sem objetivo, a linha some", () => {
    const m = montarMensagemBriefing({
      nome: "Ana",
      respostas: { ...respostas, segmento: "outro", desafio: ["outro"] },
      outros: { segmento: "Oficina mecânica", desafio: "Precificar" },
    });
    expect(m).toContain("• Ramo: Oficina mecânica");
    expect(m).toContain("• Problemas: Precificar");
    expect(m).not.toContain("Como deseja estar");
  });
});

describe("e-mail do briefing para a SA", () => {
  const dados = briefingSchema.parse({ ...corpo, nome: "Ana <b>Souza</b>", objetivo: "Agenda cheia" });
  const email = montarEmailBriefing(dados, calcularFit(dados), new Date("2026-11-18T15:00:00Z"));

  it("assunto com a empresa e o FIT", () => {
    expect(email.assunto).toBe("Novo briefing: Clínica Ana · FIT alto");
  });

  it("traz contato, FIT, frentes e todas as respostas", () => {
    for (const trecho of ["Clínica Ana", "(11) 98765-4321", "13 de 15 pontos", "SA Consultoria", "Limpeza de pele", "Agenda cheia"]) {
      expect(email.texto).toContain(trecho);
    }
  });

  it("sem botão de WhatsApp nem rodapé do Supabase", () => {
    expect(email.html).not.toContain("wa.me");
    expect(email.html).not.toContain("Supabase");
    expect(email.texto).not.toContain("wa.me");
  });

  it("escapa o que a pessoa digitou no HTML", () => {
    expect(email.html).toContain("Ana &lt;b&gt;Souza&lt;/b&gt;");
    expect(email.html).not.toContain("<b>Souza</b>");
  });
});

describe("indicarFrentes", () => {
  it("cada problema aponta para a frente que cuida dele", () => {
    expect(indicarFrentes(["site-inadequado"])).toEqual(["tech"]);
    expect(indicarFrentes(["posicionamento"])).toEqual(["studio"]);
    expect(indicarFrentes(["outro"])).toEqual(["consultoria"]);
  });

  it("a frente mais citada vem primeiro; no empate, a ordem do site", () => {
    expect(indicarFrentes(["poucos-clientes", "gerar-leads", "falta-estrategia"])).toEqual(["social", "consultoria"]);
    expect(indicarFrentes(["site-inadequado", "poucas-vendas"])).toEqual(["consultoria", "tech"]);
  });
});

describe("montarMensagemAgendar", () => {
  it("pede a primeira conversa com um consultor", () => {
    expect(montarMensagemAgendar({ nome: "Ana Souza", empresa: "Clínica Ana" })).toBe(
      "Oi, tudo bem? 😊 Aqui é Ana Souza, da Clínica Ana.\nAcabei de responder o briefing no site e quero marcar a primeira conversa para receber a minha análise estratégica.",
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
