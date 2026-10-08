/**
 * Captura UTM, fbclid e gclid na primeira carga da sessão. Fica em
 * sessionStorage para chegar junto com o lead, mesmo depois de a pessoa
 * navegar pelas âncoras.
 */
const CHAVE = "sa:origem";
const PARAMETROS = {
  source: "utm_source",
  medium: "utm_medium",
  campaign: "utm_campaign",
  content: "utm_content",
  term: "utm_term",
  fbclid: "fbclid",
  gclid: "gclid",
} as const;

export type Origem = {
  utm: Partial<Record<keyof typeof PARAMETROS, string>>;
  pagina: string;
  referrer: string;
};

function origemAtual(): Origem {
  const busca = new URLSearchParams(window.location.search);
  const utm: Origem["utm"] = {};
  for (const [chave, parametro] of Object.entries(PARAMETROS) as [keyof typeof PARAMETROS, string][]) {
    const valor = busca.get(parametro);
    if (valor) utm[chave] = valor.slice(0, 300);
  }
  return {
    utm,
    pagina: `${window.location.origin}${window.location.pathname}`,
    referrer: document.referrer.slice(0, 2000),
  };
}

export function capturarOrigem(): void {
  try {
    if (window.sessionStorage.getItem(CHAVE)) return;
    window.sessionStorage.setItem(CHAVE, JSON.stringify(origemAtual()));
  } catch {
    // Sem sessionStorage, a origem é lida de novo no envio.
  }
}

export function lerOrigem(): Origem {
  try {
    const salvo = window.sessionStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo) as Origem;
  } catch {
    // Cai para a URL atual.
  }
  return origemAtual();
}
