import { describe, expect, it } from "vitest";

import {
  mascararWhatsapp,
  montarMensagemDiagnostico,
  normalizarWhatsapp,
  urlWhatsapp,
  whatsappInternacional,
  whatsappValido,
} from "./whatsapp";

describe("normalizarWhatsapp", () => {
  it("tira pontuação", () => {
    expect(normalizarWhatsapp("(11) 91234-5678")).toBe("11912345678");
  });

  it("aceita colar com +55", () => {
    expect(normalizarWhatsapp("+55 11 91234-5678")).toBe("11912345678");
    expect(normalizarWhatsapp("+55 (11) 3123-4567")).toBe("1131234567");
  });

  it("aceita colar com 55 sem o mais", () => {
    expect(normalizarWhatsapp("5511912345678")).toBe("11912345678");
    expect(normalizarWhatsapp("551131234567")).toBe("1131234567");
  });

  it("tira o zero de operadora", () => {
    expect(normalizarWhatsapp("011 91234-5678")).toBe("11912345678");
  });

  it("não confunde o DDD 55 com o código do país", () => {
    expect(normalizarWhatsapp("(55) 99123-4567")).toBe("55991234567");
    expect(normalizarWhatsapp("(55) 3212-3456")).toBe("5532123456");
  });
});

describe("whatsappValido", () => {
  it("aceita celular com 11 dígitos e fixo com 10", () => {
    expect(whatsappValido("(11) 91234-5678")).toBe(true);
    expect(whatsappValido("(21) 3123-4567")).toBe(true);
    expect(whatsappValido("+55 55 99123-4567")).toBe(true);
  });

  it("recusa número curto, DDD inexistente e celular sem 9", () => {
    expect(whatsappValido("(11) 91234-567")).toBe(false);
    expect(whatsappValido("(20) 91234-5678")).toBe(false);
    expect(whatsappValido("(11) 81234-5678")).toBe(false);
    expect(whatsappValido("")).toBe(false);
  });
});

describe("mascararWhatsapp", () => {
  it("formata enquanto a pessoa digita", () => {
    expect(mascararWhatsapp("1")).toBe("(1");
    expect(mascararWhatsapp("11")).toBe("(11");
    expect(mascararWhatsapp("119")).toBe("(11) 9");
    expect(mascararWhatsapp("1191234")).toBe("(11) 9123-4");
    expect(mascararWhatsapp("11912345678")).toBe("(11) 91234-5678");
  });

  it("formata o que foi colado com +55", () => {
    expect(mascararWhatsapp("+55 11 91234-5678")).toBe("(11) 91234-5678");
  });

  it("não passa de 11 dígitos", () => {
    expect(mascararWhatsapp("119123456789")).toBe("(11) 91234-5678");
  });
});

describe("whatsappInternacional", () => {
  it("devolve 55 + DDD + número", () => {
    expect(whatsappInternacional("(11) 91234-5678")).toBe("5511912345678");
  });
});

describe("mensagem e URL do wa.me", () => {
  const mensagem = montarMensagemDiagnostico({
    nome: "Ana",
    empresa: "Padaria Pão Bom",
    trava: "seguidores-nao-vendem",
    fase: "constancia",
    faturamento: "20-50",
  });

  it("segue o modelo do diagnóstico", () => {
    expect(mensagem).toBe(
      [
        "Oi, aqui é Ana, da Padaria Pão Bom. Fiz o diagnóstico no site da SA.",
        "Trava: Tenho seguidores, mas não vendo",
        "Fase: Já vendo e quero constância",
        "Faturamento: De R$ 20 mil a R$ 50 mil",
      ].join("\n"),
    );
  });

  it("omite a empresa quando ela não foi informada", () => {
    const semEmpresa = montarMensagemDiagnostico({
      nome: "Ana",
      empresa: " ",
      trava: "processos-manuais",
      fase: "comecando",
      faturamento: "nao-informado",
    });
    expect(semEmpresa.split("\n")[0]).toBe("Oi, aqui é Ana. Fiz o diagnóstico no site da SA.");
  });

  it("monta a URL com o número e o texto codificado", () => {
    const url = urlWhatsapp(mensagem, "5500000000000");
    expect(url.startsWith("https://wa.me/5500000000000?text=")).toBe(true);
    expect(decodeURIComponent(url.split("?text=")[1])).toBe(mensagem);
    expect(url).not.toMatch(/[\s\n]/);
  });
});
