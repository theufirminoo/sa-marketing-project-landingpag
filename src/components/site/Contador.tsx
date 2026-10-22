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
 * Número que sobe contando até o valor toda vez que entra na tela, indo ou
 * voltando; ao sair, volta para zero e espera a próxima entrada. O HTML do
 * servidor traz o valor final (sem JavaScript, fica parado). Por pedido do
 * cliente, anima também com movimento reduzido: é só o texto mudando, sem
 * deslocamento. Leitor de tela ouve só o valor final.
 */
export function Contador({ valor, className }: { valor: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const partes = separar(valor);
    if (!el || !partes) return;
    const formato = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: partes.casas,
      maximumFractionDigits: partes.casas,
    });
    const escrever = (n: number) => {
      el.textContent = `${partes.antes}${formato.format(n)}${partes.depois}`;
    };
    let quadro = 0;
    const animar = () => {
      cancelAnimationFrame(quadro);
      const inicio = performance.now();
      const passo = (agora: number) => {
        const t = Math.min(1, (agora - inicio) / DURACAO);
        escrever(partes.alvo * (1 - Math.pow(1 - t, 3)));
        if (t < 1) quadro = requestAnimationFrame(passo);
        else el.textContent = valor;
      };
      quadro = requestAnimationFrame(passo);
    };
    escrever(0);
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) animar();
        else {
          cancelAnimationFrame(quadro);
          escrever(0);
        }
      },
      { threshold: 0.5 },
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
