"use client";

import { useEffect, useState } from "react";

import { BotaoDiagnostico } from "./BotaoDiagnostico";

/**
 * Abaixo de 768 px: sobe quando o hero sai da tela e desce quando o CTA
 * final entra. Escondida, sai da ordem de foco.
 */
export function BarraFixa({ rotulo, hrefSemJs }: { rotulo: string; hrefSemJs: string }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const ctaFinal = document.getElementById("cta-final");
    if (!hero || !ctaFinal) return;

    let heroSaiu = false;
    let ctaChegou = false;

    const observador = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.target === hero) heroSaiu = !e.isIntersecting && e.boundingClientRect.top < 0;
        if (e.target === ctaFinal) ctaChegou = e.isIntersecting || e.boundingClientRect.top < 0;
      }
      setVisivel(heroSaiu && !ctaChegou);
    });
    observador.observe(hero);
    observador.observe(ctaFinal);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.barraFixa = visivel ? "visivel" : "";
  }, [visivel]);

  return (
    <div className="sa-barra-fixa" data-visivel={visivel ? "true" : "false"} inert={!visivel}>
      <BotaoDiagnostico origem="barra-fixa" hrefSemJs={hrefSemJs} className="sa-btn sa-btn--bloco">
        {rotulo}
      </BotaoDiagnostico>
    </div>
  );
}
