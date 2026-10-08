"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { FRENTES, ORIGENS, TRAVAS, type FrenteId } from "@/content/opcoes";
import { registrarEvento } from "@/lib/analytics";
import { capturarOrigem } from "@/lib/utm";
import type { Pedido } from "./estado";

const DiagnosticoDialog = dynamic(() => import("./DiagnosticoDialog"), { ssr: false });

const pertence = <T extends string>(lista: readonly T[], valor: string | undefined): valor is T =>
  valor !== undefined && (lista as readonly string[]).includes(valor);

function alvo(evento: Event, seletor: string): HTMLElement | null {
  const elemento = evento.target;
  return elemento instanceof Element ? (elemento.closest(seletor) as HTMLElement | null) : null;
}

/**
 * Uma ilha de cliente para a página inteira. Os CTAs são HTML do servidor
 * com data-diagnostico; aqui um clique neles abre o diálogo. O código do
 * diálogo só é baixado na primeira intenção (ponteiro ou foco num CTA) ou
 * quando o navegador fica ocioso.
 */
export function DiagnosticoProvider() {
  const [carregar, setCarregar] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const contador = useRef(0);

  useEffect(() => {
    capturarOrigem();

    const precarregar = (evento: Event) => {
      if (alvo(evento, "[data-diagnostico]")) setCarregar(true);
    };

    const clique = (evento: MouseEvent) => {
      const botao = alvo(evento, "[data-diagnostico]");
      if (botao) {
        const { diagnostico: origem, trava, frente } = botao.dataset;
        if (!pertence(ORIGENS, origem)) return;
        evento.preventDefault();
        contador.current += 1;
        setPedido({
          id: contador.current,
          origem,
          trava: pertence(TRAVAS, trava) ? trava : undefined,
          frente: pertence(FRENTES, frente) ? frente : undefined,
          abridor: botao,
        });
        setCarregar(true);
        setAberto(true);
        registrarEvento("diagnostico_aberto", { origem });
        return;
      }

      const gatilho = alvo(evento, "[data-frente-gatilho]");
      if (gatilho) {
        // Lido depois do clique: "true" quer dizer que a linha acabou de abrir.
        window.setTimeout(() => {
          const frente = gatilho.dataset.frenteGatilho;
          if (gatilho.getAttribute("aria-expanded") === "true" && pertence(FRENTES, frente)) {
            registrarEvento("frente_aberta", { frente: frente as FrenteId });
          }
        }, 0);
        return;
      }

      const whatsapp = alvo(evento, "[data-whatsapp-origem]");
      const origemWhatsapp = whatsapp?.dataset.whatsappOrigem;
      if (origemWhatsapp === "cta-final" || origemWhatsapp === "rodape") {
        registrarEvento("whatsapp_aberto", { origem: origemWhatsapp });
      }
    };

    document.addEventListener("pointerover", precarregar, { passive: true });
    document.addEventListener("focusin", precarregar);
    document.addEventListener("click", clique);

    const temOcioso = typeof window.requestIdleCallback === "function";
    const ocioso = temOcioso
      ? window.requestIdleCallback(() => setCarregar(true), { timeout: 5000 })
      : window.setTimeout(() => setCarregar(true), 3000);

    return () => {
      document.removeEventListener("pointerover", precarregar);
      document.removeEventListener("focusin", precarregar);
      document.removeEventListener("click", clique);
      if (temOcioso) window.cancelIdleCallback(ocioso);
      else window.clearTimeout(ocioso);
    };
  }, []);

  const aoMudarAberto = useCallback((valor: boolean) => setAberto(valor), []);

  if (!carregar) return null;
  return <DiagnosticoDialog aberto={aberto} pedido={pedido} aoMudarAberto={aoMudarAberto} />;
}
