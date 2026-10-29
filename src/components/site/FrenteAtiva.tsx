"use client";

import { useEffect } from "react";

import { registrarEvento } from "@/lib/analytics";
import type { FrenteId } from "@/content/opcoes";

/**
 * Marca qual frente está em foco enquanto a pessoa rola: o painel que cruza a
 * faixa logo abaixo do cabeçalho ganha `data-ativa`, e o link do índice,
 * `aria-current`. Não renderiza nada; o conteúdo vem do servidor.
 */
export function FrenteAtiva() {
  useEffect(() => {
    const paineis = Array.from(document.querySelectorAll<HTMLElement>("[data-frente-painel]"));
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-frente-indice]"));
    if (!paineis.length) return;
    document.documentElement.dataset.frentesJs = "";
    const vistas = new Set<string>();
    // Enquanto a rolagem do clique no índice anda, o observador não troca a frente.
    let travadoAte = 0;

    const ativar = (id: string) => {
      paineis.forEach((p) => p.toggleAttribute("data-ativa", p.dataset.frentePainel === id));
      links.forEach((l) => {
        const atual = l.dataset.frenteIndice === id;
        if (atual) {
          l.setAttribute("aria-current", "true");
          // No celular o índice é uma faixa que rola de lado: mantém o atual à vista.
          const faixa = l.closest("ol");
          if (faixa && faixa.scrollWidth > faixa.clientWidth) {
            faixa.scrollTo({ left: l.offsetLeft - 16, behavior: "smooth" });
          }
        } else l.removeAttribute("aria-current");
      });
      if (!vistas.has(id)) {
        vistas.add(id);
        registrarEvento("frente_aberta", { frente: id as FrenteId });
      }
    };
    ativar(paineis[0].dataset.frentePainel ?? "");

    // Faixa estreita a 30% da altura da tela: o painel que passa por ela é o atual.
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting && performance.now() > travadoAte) ativar((e.target as HTMLElement).dataset.frentePainel ?? "");
        }
      },
      { rootMargin: "-30% 0px -69% 0px" },
    );
    paineis.forEach((p) => observador.observe(p));

    // Clique no índice: rola até o painel descontando cabeçalho e faixa fixa.
    const aoClicar = (e: MouseEvent) => {
      const link = (e.target as Element).closest<HTMLAnchorElement>("[data-frente-indice]");
      const id = link?.dataset.frenteIndice;
      const painel = paineis.find((p) => p.dataset.frentePainel === id);
      if (!link || !id || !painel) return;
      e.preventDefault();
      const fixo = (document.querySelector("header")?.offsetHeight ?? 0) + (window.innerWidth < 1024 ? (link.closest("nav")?.offsetHeight ?? 0) : 48);
      const destino = painel.getBoundingClientRect().top + window.scrollY - fixo - 16;
      const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      travadoAte = performance.now() + (suave ? 900 : 100);
      ativar(id);
      window.scrollTo({ top: destino, behavior: suave ? "smooth" : "auto" });
      history.replaceState(null, "", `#frente-${id}`);
    };
    document.addEventListener("click", aoClicar);
    return () => {
      document.removeEventListener("click", aoClicar);
      observador.disconnect();
      delete document.documentElement.dataset.frentesJs;
    };
  }, []);

  return null;
}
