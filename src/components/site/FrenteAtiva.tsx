"use client";

import { useEffect } from "react";

import { registrarEvento } from "@/lib/analytics";
import type { FrenteId } from "@/content/opcoes";

/** Quanto de rolagem cada frente ocupa, em fração da altura da tela. */
const PASSO = 0.7;

/**
 * Liga o modo "substituição" das frentes: o palco ganha altura extra, a cena
 * fica presa (sticky) e a posição da rolagem escolhe qual painel aparece.
 * Desliga sozinho se algum painel não couber na cena (tela muito baixa):
 * aí as frentes ficam uma embaixo da outra. Não renderiza nada.
 */
export function FrenteAtiva() {
  useEffect(() => {
    const palco = document.querySelector<HTMLElement>("[data-frentes-palco]");
    const cena = palco?.querySelector<HTMLElement>(".sa-frentes-cena");
    const paineis = Array.from(document.querySelectorAll<HTMLElement>("[data-frente-painel]"));
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-frente-indice]"));
    if (!palco || !cena || !paineis.length) return;
    const raiz = document.documentElement;
    const vistas = new Set<string>();
    let atual = -1;
    let quadro = 0;

    const mostrar = (i: number) => {
      if (i === atual) return;
      atual = i;
      paineis.forEach((p, k) => {
        p.toggleAttribute("data-ativa", k === i);
        p.toggleAttribute("data-antes", k < i);
      });
      links.forEach((l, k) => {
        if (k === i) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
        l.toggleAttribute("data-feito", k < i);
      });
      const id = paineis[i].dataset.frentePainel ?? "";
      if (!vistas.has(id)) {
        vistas.add(id);
        registrarEvento("frente_aberta", { frente: id as FrenteId });
      }
    };

    const passo = () => window.innerHeight * PASSO;
    const topoFixo = () => parseFloat(getComputedStyle(cena).top) || 0;
    // Rolagem a partir do momento em que a cena gruda no topo, em "passos".
    const indiceDaRolagem = () => {
      const p = -(palco.getBoundingClientRect().top - topoFixo()) / passo();
      return Math.min(paineis.length - 1, Math.max(0, Math.floor(p + 0.5)));
    };

    const montar = () => {
      raiz.removeAttribute("data-frentes-js");
      palco.style.height = "";
      // Só liga se cada painel couber na cena presa. Em telas baixas (celular
      // com barras do navegador), compacta em níveis até caber: foto mais
      // baixa, sem foto, sem a promessa.
      raiz.setAttribute("data-frentes-js", "");
      let nivel = 0;
      palco.removeAttribute("data-compacto");
      while (cena.scrollHeight > cena.clientHeight + 2 && nivel < 3) {
        nivel += 1;
        palco.setAttribute("data-compacto", String(nivel));
      }
      const alturaCena = cena.clientHeight;
      if (cena.scrollHeight > alturaCena + 2) {
        palco.removeAttribute("data-compacto");
        raiz.removeAttribute("data-frentes-js");
        paineis.forEach((p) => p.removeAttribute("data-ativa"));
        atual = -1;
        return;
      }
      palco.style.height = `${alturaCena + passo() * (paineis.length - 1)}px`;
      mostrar(indiceDaRolagem());
    };

    const aoRolar = () => {
      if (quadro || !raiz.hasAttribute("data-frentes-js")) return;
      quadro = requestAnimationFrame(() => {
        quadro = 0;
        mostrar(indiceDaRolagem());
      });
    };

    // Índice e foco do teclado levam à posição de rolagem de cada frente.
    const irPara = (i: number) => {
      const alvo = palco.getBoundingClientRect().top + window.scrollY - topoFixo() + i * passo();
      const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: alvo, behavior: suave ? "smooth" : "auto" });
    };
    const aoClicar = (e: MouseEvent) => {
      const link = (e.target as Element).closest<HTMLAnchorElement>("[data-frente-indice]");
      if (!link || !raiz.hasAttribute("data-frentes-js")) return;
      e.preventDefault();
      irPara(links.indexOf(link));
    };
    const aoFocar = (e: FocusEvent) => {
      const painel = (e.target as Element).closest<HTMLElement>("[data-frente-painel]");
      if (!painel || !raiz.hasAttribute("data-frentes-js")) return;
      const i = paineis.indexOf(painel);
      if (i !== atual) {
        mostrar(i);
        irPara(i);
      }
    };

    // A barra de endereço do celular muda a altura ao rolar: só remonta se a largura mudar.
    let largura = window.innerWidth;
    const aoRedimensionar = () => {
      if (window.innerWidth === largura) return;
      largura = window.innerWidth;
      montar();
    };

    // Deslizar para o lado na cena também troca de frente (como no carrossel).
    let toque: { x: number; y: number } | null = null;
    const aoTocar = (e: TouchEvent) => {
      toque = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const aoSoltar = (e: TouchEvent) => {
      const inicio = toque;
      toque = null;
      if (!inicio || !raiz.hasAttribute("data-frentes-js")) return;
      const dx = e.changedTouches[0].clientX - inicio.x;
      const dy = e.changedTouches[0].clientY - inicio.y;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      const destino = Math.min(paineis.length - 1, Math.max(0, atual + (dx < 0 ? 1 : -1)));
      if (destino !== atual) {
        mostrar(destino);
        irPara(destino);
      }
    };

    montar();
    cena.addEventListener("touchstart", aoTocar, { passive: true });
    cena.addEventListener("touchend", aoSoltar, { passive: true });
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRedimensionar);
    document.addEventListener("click", aoClicar);
    document.addEventListener("focusin", aoFocar);
    return () => {
      cancelAnimationFrame(quadro);
      cena.removeEventListener("touchstart", aoTocar);
      cena.removeEventListener("touchend", aoSoltar);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRedimensionar);
      document.removeEventListener("click", aoClicar);
      document.removeEventListener("focusin", aoFocar);
      raiz.removeAttribute("data-frentes-js");
      palco.style.height = "";
    };
  }, []);

  return null;
}
