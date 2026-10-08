"use client";

import { useEffect } from "react";

/**
 * Marca com aria-current="step" a etapa que está no centro da tela. É a
 * rolagem da pessoa que move o estado. Desligado com movimento reduzido.
 */
export function MetodoMarcador() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const etapas = Array.from(document.querySelectorAll<HTMLElement>("[data-metodo] > [data-etapa]"));
    if (etapas.length === 0) return;

    const marcar = (atual: Element) => {
      for (const etapa of etapas) {
        if (etapa === atual) etapa.setAttribute("aria-current", "step");
        else etapa.removeAttribute("aria-current");
      }
    };

    const observador = new IntersectionObserver(
      (entradas) => {
        const noCentro = entradas.find((e) => e.isIntersecting);
        if (noCentro) marcar(noCentro.target);
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    etapas.forEach((etapa) => observador.observe(etapa));
    return () => observador.disconnect();
  }, []);

  return null;
}
