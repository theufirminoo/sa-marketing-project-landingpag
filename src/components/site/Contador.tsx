"use client";

import { useEffect, useRef } from "react";

const DURACAO = 1400;

/** Separa "+38%" em prefixo "+", número 38 com 0 casas e sufixo "%". */
function separar(valor: string) {
  const m = valor.match(/^(\D*)([\d.,]+)(.*)$/);
  if (!m) return null;
  const [, antes, numero, depois] = m;
  const casas = numero.includes(",") ? numero.split(",")[1].length : 0;
  const alvo = Number(numero.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(alvo) ? { antes, depois, casas, alvo } : null;
}

/**
 * Número que sobe contando até o valor quando entra na tela. O HTML do
 * servidor já traz o valor final (sem JavaScript ou com movimento reduzido,
 * fica parado). Leitor de tela ouve só o valor final.
 */
export function Contador({ valor, className }: { valor: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const partes = separar(valor);
    if (!el || !partes || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const formato = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: partes.casas,
      maximumFractionDigits: partes.casas,
    });
    const escrever = (n: number) => {
      el.textContent = `${partes.antes}${formato.format(n)}${partes.depois}`;
    };
    escrever(0);
    let quadro = 0;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();
        const inicio = performance.now();
        const passo = (agora: number) => {
          const t = Math.min(1, (agora - inicio) / DURACAO);
          escrever(partes.alvo * (1 - Math.pow(1 - t, 3)));
          if (t < 1) quadro = requestAnimationFrame(passo);
          else el.textContent = valor;
        };
        quadro = requestAnimationFrame(passo);
      },
      { threshold: 0.6 },
    );
    observador.observe(el);
    return () => {
      observador.disconnect();
      cancelAnimationFrame(quadro);
      el.textContent = valor;
    };
  }, [valor]);

  return (
    <>
      <span ref={ref} className={className} aria-hidden="true">
        {valor}
      </span>
      <span className="sr-only">{valor}</span>
    </>
  );
}
