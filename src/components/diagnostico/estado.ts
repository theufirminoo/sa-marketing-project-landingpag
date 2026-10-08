import {
  FATURAMENTOS,
  FASES,
  FRENTES,
  TRAVAS,
  type Faturamento,
  type Fase,
  type FrenteId,
  type OrigemDiagnostico,
  type Trava,
} from "@/content/site";

export type Tela = 1 | 2 | 3 | 4 | 5;

export type ContatoSalvo = {
  nome: string;
  whatsapp: string;
  empresa: string;
  instagram: string;
};

export type EstadoDiagnostico = {
  tela: Tela;
  trava?: Trava;
  fase?: Fase;
  faturamento?: Faturamento;
  frenteDeInteresse?: FrenteId;
  contato?: ContatoSalvo;
  /** 1 avança, -1 volta. Só decide o lado da animação. */
  direcao: 1 | -1;
};

/** Pedido de abertura, montado a partir do elemento clicado. */
export type Pedido = {
  id: number;
  origem: OrigemDiagnostico;
  trava?: Trava;
  frente?: FrenteId;
  abridor: HTMLElement | null;
};

export type Acao =
  | { tipo: "pedido"; pedido: Pedido }
  | { tipo: "responder"; campo: "trava" | "fase" | "faturamento"; valor: string }
  | { tipo: "avancar" }
  | { tipo: "voltar" }
  | { tipo: "concluir"; contato: ContatoSalvo }
  | { tipo: "refazer" };

const CHAVE = "sa:diagnostico";
export const ESTADO_INICIAL: EstadoDiagnostico = { tela: 1, direcao: 1 };

const pertence = <T extends string>(lista: readonly T[], valor: unknown): valor is T =>
  typeof valor === "string" && (lista as readonly string[]).includes(valor);

export function lerEstado(): EstadoDiagnostico {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE);
    if (!bruto) return ESTADO_INICIAL;
    const salvo = JSON.parse(bruto) as Partial<EstadoDiagnostico>;
    const tela = [1, 2, 3, 4, 5].includes(Number(salvo.tela)) ? (Number(salvo.tela) as Tela) : 1;
    const estado: EstadoDiagnostico = {
      tela,
      direcao: 1,
      trava: pertence(TRAVAS, salvo.trava) ? salvo.trava : undefined,
      fase: pertence(FASES, salvo.fase) ? salvo.fase : undefined,
      faturamento: pertence(FATURAMENTOS, salvo.faturamento) ? salvo.faturamento : undefined,
      frenteDeInteresse: pertence(FRENTES, salvo.frenteDeInteresse) ? salvo.frenteDeInteresse : undefined,
      contato: salvo.contato,
    };
    return telaCoerente(estado);
  } catch {
    return ESTADO_INICIAL;
  }
}

export function salvarEstado(estado: EstadoDiagnostico): void {
  try {
    const { tela, trava, fase, faturamento, frenteDeInteresse, contato } = estado;
    window.sessionStorage.setItem(
      CHAVE,
      JSON.stringify({ tela, trava, fase, faturamento, frenteDeInteresse, contato }),
    );
  } catch {
    // Sem sessionStorage, o diagnóstico funciona, só não retoma.
  }
}

/** Nunca deixa a pessoa numa tela sem as respostas anteriores. */
function telaCoerente(estado: EstadoDiagnostico): EstadoDiagnostico {
  const faltando: Tela | null = !estado.trava ? 1 : !estado.fase ? 2 : !estado.faturamento ? 3 : null;
  if (faltando && estado.tela > faltando) return { ...estado, tela: faltando };
  if (estado.tela === 5 && !estado.contato) return { ...estado, tela: 4 };
  return estado;
}

export function aplicarPedido(estado: EstadoDiagnostico, pedido: Pedido | null): EstadoDiagnostico {
  if (!pedido) return estado;
  if (pedido.trava) {
    // Opção do hero ou do CTA final: resposta registrada, segue para a tela 2.
    return { ...estado, trava: pedido.trava, tela: 2, direcao: 1 };
  }
  if (pedido.frente) {
    const recomeca = estado.tela === 5;
    return { ...estado, frenteDeInteresse: pedido.frente, tela: recomeca ? 1 : estado.tela, direcao: 1 };
  }
  return estado;
}

export function reduzir(estado: EstadoDiagnostico, acao: Acao): EstadoDiagnostico {
  switch (acao.tipo) {
    case "pedido":
      return aplicarPedido(estado, acao.pedido);
    case "responder":
      return { ...estado, [acao.campo]: acao.valor };
    case "avancar":
      return telaCoerente({ ...estado, tela: Math.min(estado.tela + 1, 4) as Tela, direcao: 1 });
    case "voltar":
      return { ...estado, tela: Math.max(estado.tela - 1, 1) as Tela, direcao: -1 };
    case "concluir":
      return { ...estado, contato: acao.contato, tela: 5, direcao: 1 };
    case "refazer":
      return { tela: 1, direcao: -1, frenteDeInteresse: estado.frenteDeInteresse, contato: estado.contato };
  }
}
