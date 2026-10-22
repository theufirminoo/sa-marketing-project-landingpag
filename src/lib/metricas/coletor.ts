import { lerOrigem } from "@/lib/utm";

import type { Contexto, Evento, TipoEvento } from "./esquema";

/**
 * Coletor de métricas próprias. Só é carregado (import dinâmico) depois do
 * "Aceitar" no aviso de cookies; antes disso nenhum byte dele chega ao
 * navegador. Junta os eventos numa fila e manda em lotes para /api/eventos
 * com sendBeacon, que não atrasa a página nem a saída dela.
 *
 * Nunca lê o que a pessoa digita: campos de formulário ficam de fora. Os
 * identificadores são aleatórios e ficam só neste navegador.
 */

type Valor = string | number | boolean | null;
type Dados = Record<string, Valor>;

const DESTINO = "/api/eventos";
const CONSENTIMENTO = "sa:consentimento";
const VISITANTE = "sa:visitante";
const SESSAO = "sa:sessao";
const INTERVALO_MS = 15_000;

let iniciado = false;
let contexto: Contexto;
let fila: Evento[] = [];

function consentiu(): boolean {
  try {
    return window.localStorage.getItem(CONSENTIMENTO) === "aceito";
  } catch {
    return true; // sem localStorage, vale a escolha feita nesta página
  }
}

function uuid(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16),
      );
}

function limpar(dados: Record<string, unknown>): Dados {
  const saida: Dados = {};
  for (const [chave, valor] of Object.entries(dados).slice(0, 30)) {
    const k = chave.slice(0, 40);
    if (valor === null || typeof valor === "boolean") saida[k] = valor;
    else if (typeof valor === "number" && Number.isFinite(valor)) saida[k] = Math.round(valor * 1000) / 1000;
    else if (typeof valor === "string") saida[k] = valor.slice(0, 300);
  }
  return saida;
}

function registrar(tipo: TipoEvento, dados: Record<string, unknown> = {}) {
  if (!consentiu()) return;
  fila.push({ tipo, t: Math.round(performance.now()), em: new Date().toISOString(), dados: limpar(dados) });
  if (fila.length >= 25) enviar();
}

function enviar() {
  if (!fila.length) return;
  if (!consentiu()) {
    fila = [];
    return;
  }
  while (fila.length) {
    const lote = JSON.stringify({ contexto, eventos: fila.splice(0, 100) });
    const corpo = new Blob([lote], { type: "application/json" });
    if (!navigator.sendBeacon?.(DESTINO, corpo)) {
      fetch(DESTINO, { method: "POST", body: corpo, keepalive: true }).catch(() => {});
    }
  }
}

/** Visitante (este navegador) e sessão (esta aba). */
function identificar() {
  let visitante = { id: uuid(), primeira: new Date().toISOString(), visitas: 0 };
  try {
    const salvo = window.localStorage.getItem(VISITANTE);
    if (salvo) visitante = { ...visitante, ...JSON.parse(salvo) };
  } catch {
    // segue com um visitante só desta página
  }
  let sessao: string | null = null;
  try {
    sessao = window.sessionStorage.getItem(SESSAO);
  } catch {
    // idem
  }
  if (!sessao) {
    sessao = uuid();
    visitante.visitas += 1;
    try {
      window.sessionStorage.setItem(SESSAO, sessao);
    } catch {
      // idem
    }
  }
  try {
    window.localStorage.setItem(VISITANTE, JSON.stringify(visitante));
  } catch {
    // idem
  }
  return { visitante, sessao };
}

function montarContexto(): Contexto {
  const { visitante, sessao } = identificar();
  const origem = lerOrigem();
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean };
  };
  const conexao = nav.connection;
  const utm: Record<string, string> = {};
  for (const [k, v] of Object.entries(origem.utm)) if (v) utm[k] = v;
  return {
    visitante: visitante.id,
    sessao,
    visita: Math.max(1, visitante.visitas),
    primeiraVisita: visitante.primeira,
    pagina: `${location.pathname}${location.hash}`.slice(0, 500),
    titulo: document.title.slice(0, 200),
    referrer: origem.referrer || undefined,
    utm,
    idioma: navigator.language,
    idiomas: navigator.languages?.join(",").slice(0, 200),
    fuso: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tela: { largura: screen.width, altura: screen.height, densidade: window.devicePixelRatio },
    janela: { largura: window.innerWidth, altura: window.innerHeight },
    toque: navigator.maxTouchPoints > 0,
    memoriaGb: nav.deviceMemory,
    nucleos: navigator.hardwareConcurrency,
    conexao: conexao
      ? { tipo: conexao.effectiveType, downlink: conexao.downlink, rtt: conexao.rtt, economia: conexao.saveData }
      : undefined,
    temaEscuro: window.matchMedia("(prefers-color-scheme: dark)").matches,
    movimentoReduzido: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    automatizado: navigator.webdriver || undefined,
  };
}

function nomeDaSecao(el: Element | null): string | null {
  const secao = el?.closest("section, header, footer, [role=dialog]");
  if (!secao) return null;
  if (secao.getAttribute("role") === "dialog") return "diagnostico";
  return secao.id || secao.getAttribute("aria-labelledby") || secao.tagName.toLowerCase();
}

function observarVisualizacao() {
  const [nav] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  registrar("visualizacao", {
    navegacao: nav?.type ?? null,
    ttfb: nav ? nav.responseStart : null,
    domPronto: nav ? nav.domContentLoadedEventEnd : null,
    carregada: nav ? nav.loadEventEnd || null : null,
    transferidoKb: nav ? Math.round(nav.transferSize / 1024) : null,
  });
}

/** Seções vistas e quanto tempo cada uma ficou na tela. */
function observarSecoes() {
  const tempo = new Map<string, number>();
  const desde = new Map<string, number>();
  const vistas = new Set<string>();
  const observador = new IntersectionObserver(
    (entradas) => {
      const agora = performance.now();
      for (const e of entradas) {
        const nome = nomeDaSecao(e.target);
        if (!nome) continue;
        if (e.isIntersecting) {
          desde.set(nome, agora);
          if (!vistas.has(nome)) {
            vistas.add(nome);
            registrar("secao", { secao: nome, acao: "viu", ordem: vistas.size });
          }
        } else if (desde.has(nome)) {
          tempo.set(nome, (tempo.get(nome) ?? 0) + agora - (desde.get(nome) ?? agora));
          desde.delete(nome);
        }
      }
    },
    { threshold: 0.35 },
  );
  document.querySelectorAll("main section, footer").forEach((s) => observador.observe(s));
  return {
    vistas,
    fechar() {
      const agora = performance.now();
      for (const [nome, inicio] of desde) {
        tempo.set(nome, (tempo.get(nome) ?? 0) + agora - inicio);
        desde.set(nome, agora);
      }
      for (const [nome, ms] of tempo) if (ms > 300) registrar("secao", { secao: nome, acao: "tempo", ms: Math.round(ms) });
      tempo.clear();
    },
  };
}

function observarRolagem() {
  const marcos = [25, 50, 75, 90, 100];
  let maximo = 0;
  const medir = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.min(100, Math.round((window.scrollY / total) * 100)) : 100;
    if (pct > maximo) {
      for (const m of marcos) if (maximo < m && pct >= m) registrar("rolagem", { pct: m });
      maximo = pct;
    }
  };
  window.addEventListener("scroll", medir, { passive: true });
  return { maximo: () => maximo };
}

function observarCliques() {
  document.addEventListener(
    "click",
    (e) => {
      const alvo = (e.target as Element | null)?.closest("a, button, [role=button], summary");
      if (!alvo || alvo.closest("input, textarea, select")) return;
      const link = alvo instanceof HTMLAnchorElement ? alvo : null;
      let destino: string | null = null;
      if (link) {
        const url = new URL(link.href, location.href);
        destino = url.origin === location.origin ? `${url.pathname}${url.hash}` : url.hostname;
      }
      registrar("clique", {
        elemento: alvo.tagName.toLowerCase(),
        texto: (alvo.getAttribute("aria-label") || (alvo as HTMLElement).innerText || "").replace(/\s+/g, " ").trim().slice(0, 80),
        destino,
        diagnostico: alvo.getAttribute("data-diagnostico"),
        trava: alvo.getAttribute("data-trava"),
        frente: alvo.getAttribute("data-frente") || alvo.getAttribute("data-frente-gatilho"),
        whatsapp: alvo.getAttribute("data-whatsapp-origem") || (destino === "wa.me" ? "link" : null),
        secao: nomeDaSecao(alvo),
        x: Math.round((e.clientX / window.innerWidth) * 100),
        y: Math.round(window.scrollY + e.clientY),
      });
    },
    { capture: true, passive: true },
  );
}

/** Web Vitals medidos com o próprio navegador, sem biblioteca. */
function observarVitais() {
  const vitais: Record<string, number> = {};
  const observar = (tipo: string, cb: (lista: PerformanceEntryList) => void, extra: Record<string, unknown> = {}) => {
    try {
      new PerformanceObserver((l) => cb(l.getEntries())).observe({ type: tipo, buffered: true, ...extra } as PerformanceObserverInit);
    } catch {
      // navegador sem esse tipo de medição
    }
  };
  observar("largest-contentful-paint", (l) => (vitais.lcp = l[l.length - 1].startTime));
  observar("paint", (l) =>
    l.forEach((p) => {
      if (p.name === "first-contentful-paint") vitais.fcp = p.startTime;
    }),
  );
  observar("layout-shift", (l) =>
    l.forEach((s) => {
      const ls = s as PerformanceEntry & { value: number; hadRecentInput: boolean };
      if (!ls.hadRecentInput) vitais.cls = (vitais.cls ?? 0) + ls.value;
    }),
  );
  observar("event", (l) => l.forEach((ev) => (vitais.inp = Math.max(vitais.inp ?? 0, ev.duration))), { durationThreshold: 40 });
  observar("longtask", (l) => (vitais.tarefasLongas = (vitais.tarefasLongas ?? 0) + l.length));
  let enviado = false;
  return () => {
    if (enviado || !Object.keys(vitais).length) return;
    enviado = true;
    registrar("vital", vitais);
  };
}

function observarMidia() {
  document.addEventListener(
    "playing",
    (e) => {
      const v = e.target as HTMLVideoElement;
      if (v.dataset.medido) return;
      v.dataset.medido = "1";
      registrar("video", { video: (v.currentSrc || "").split("/").pop() ?? null, secao: nomeDaSecao(v) });
    },
    true,
  );
  const slides = document.querySelectorAll(".sa-carrossel__slide");
  const mudou = new MutationObserver((ms) => {
    for (const m of ms) {
      const el = m.target as HTMLElement;
      if (el.dataset.ativo === "true") registrar("slide", { indice: Array.from(slides).indexOf(el) + 1 });
    }
  });
  slides.forEach((s) => mudou.observe(s, { attributes: true, attributeFilter: ["data-ativo"] }));
}

function observarErros() {
  let total = 0;
  const anotar = (mensagem: string, origem?: string, linha?: number) => {
    if (++total > 10) return;
    registrar("erro", { mensagem: mensagem.slice(0, 200), origem: origem?.split("/").pop() ?? null, linha: linha ?? null });
  };
  window.addEventListener("error", (e) => anotar(e.message, e.filename, e.lineno));
  window.addEventListener("unhandledrejection", (e) => anotar(String(e.reason).slice(0, 200)));
}

/** Liga o coletor. Chamado pelo aviso de cookies depois do "Aceitar". */
export function iniciarMetricas(): void {
  if (!consentiu()) return;
  if (iniciado) {
    // Aceitou de novo depois de recusar: novos identificadores.
    contexto = montarContexto();
    return;
  }
  iniciado = true;
  contexto = montarContexto();

  window.saMetricas = (evento, dados) => registrar("diagnostico", { evento, ...dados });

  observarVisualizacao();
  const secoes = observarSecoes();
  const rolagem = observarRolagem();
  observarCliques();
  const fecharVitais = observarVitais();
  observarMidia();
  observarErros();

  let visivelDesde = document.visibilityState === "visible" ? performance.now() : 0;
  let ativoMs = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (visivelDesde) ativoMs += performance.now() - visivelDesde;
      visivelDesde = 0;
      fecharVitais();
      secoes.fechar();
      registrar("saida", { ativoMs: Math.round(ativoMs), rolagemMax: rolagem.maximo(), secoesVistas: secoes.vistas.size });
      enviar();
    } else {
      visivelDesde = performance.now();
    }
  });
  window.setInterval(enviar, INTERVALO_MS);
}

/** Desliga e apaga os identificadores. Chamado quando a pessoa recusa depois. */
export function apagarIdentificadores(): void {
  fila = [];
  try {
    window.localStorage.removeItem(VISITANTE);
    window.sessionStorage.removeItem(SESSAO);
  } catch {
    // nada a apagar
  }
}
