import type { FrenteId, OrigemDiagnostico } from "@/content/opcoes";

/**
 * Eventos do dataLayer. Nenhum leva dado pessoal: nada de nome, WhatsApp,
 * empresa ou Instagram. O GTM só carrega depois do "Aceitar".
 */
type Eventos = {
  diagnostico_aberto: { origem: OrigemDiagnostico };
  diagnostico_etapa: { etapa: number; resposta: string };
  lead_enviado: { frentes_recomendadas: string };
  whatsapp_aberto: { origem: "resultado" | "cta-final" | "rodape" };
  frente_aberta: { frente: FrenteId };
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function registrarEvento<E extends keyof Eventos>(evento: E, dados: Eventos[E]): void {
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event: evento, ...dados });
  } catch {
    // Medição nunca quebra a página.
  }
}
