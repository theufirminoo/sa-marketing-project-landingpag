import { describe, expect, it } from "vitest";

import { formatarFrentes, recomendarFrentes } from "./recomendacao";

describe("recomendarFrentes", () => {
  it("segue a tabela da trava", () => {
    expect(recomendarFrentes("seguidores-nao-vendem")).toEqual(["consultoria", "social"]);
    expect(recomendarFrentes("nao-vende-todo-dia")).toEqual(["consultoria", "social"]);
    expect(recomendarFrentes("depende-de-indicacao")).toEqual(["social", "studio"]);
    expect(recomendarFrentes("processos-manuais")).toEqual(["tech"]);
    expect(recomendarFrentes("nao-sabe-por-onde-comecar")).toEqual(["consultoria"]);
  });

  it("põe a frente de interesse em primeiro lugar", () => {
    expect(recomendarFrentes("seguidores-nao-vendem", "tech")).toEqual(["tech", "consultoria", "social"]);
  });

  it("não repete a frente de interesse que já estava na lista", () => {
    expect(recomendarFrentes("depende-de-indicacao", "studio")).toEqual(["studio", "social"]);
    expect(recomendarFrentes("processos-manuais", "tech")).toEqual(["tech"]);
  });
});

describe("formatarFrentes", () => {
  it("junta com vírgula e com e", () => {
    expect(formatarFrentes(["consultoria"])).toBe("SA Consultoria");
    expect(formatarFrentes(["consultoria", "social"])).toBe("SA Consultoria e SA Social");
    expect(formatarFrentes(["tech", "consultoria", "social"])).toBe("SA Tech, SA Consultoria e SA Social");
  });
});
