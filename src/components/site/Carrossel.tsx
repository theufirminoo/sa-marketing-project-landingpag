"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "lucide-react";

type Rotulos = {
  rotulo: string;
  anterior: string;
  proximo: string;
  pausar: string;
  tocar: string;
  irPara: string[];
  posicao: string[];
};

const INTERVALO = 8000;

/**
 * Carrossel do hero. Os slides vêm prontos do servidor. A troca automática
 * só começa depois da primeira interação (o LCP já fechou), para ao passar
 * o mouse ou focar dentro, e não existe com movimento reduzido. Slides
 * escondidos ficam inertes. Sem JavaScript, só o primeiro aparece.
 */
export function Carrossel({ slides, rotulos }: { slides: ReactNode[]; rotulos: Rotulos }) {
  const [atual, setAtual] = useState(0);
  const [rodando, setRodando] = useState(true);
  const [liberado, setLiberado] = useState(false);
  const [emUso, setEmUso] = useState(false);
  const total = slides.length;
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Com movimento reduzido a troca automática nunca é liberada.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const eventos = ["pointerdown", "keydown", "scroll", "touchstart", "wheel"] as const;
    const liberar = () => {
      setLiberado(true);
      eventos.forEach((e) => window.removeEventListener(e, liberar));
    };
    eventos.forEach((e) => window.addEventListener(e, liberar, { passive: true }));
    return () => eventos.forEach((e) => window.removeEventListener(e, liberar));
  }, []);

  useEffect(() => {
    if (!rodando || !liberado || emUso || document.querySelector("[role=dialog]")) return;
    const id = window.setTimeout(() => setAtual((a) => (a + 1) % total), INTERVALO);
    return () => window.clearTimeout(id);
  }, [atual, rodando, liberado, emUso, total]);

  const ir = (n: number) => setAtual((n + total) % total);

  return (
    <div
      ref={raiz}
      className="sa-carrossel"
      role="region"
      aria-roledescription="carrossel"
      aria-label={rotulos.rotulo}
      onPointerEnter={() => setEmUso(true)}
      onPointerLeave={() => setEmUso(false)}
      onFocus={() => setEmUso(true)}
      onBlur={(e) => {
        if (!raiz.current?.contains(e.relatedTarget as Node)) setEmUso(false);
      }}
    >
      <div className="sa-carrossel__trilho" aria-live={rodando && liberado ? "off" : "polite"}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className="sa-carrossel__slide"
            role="group"
            aria-roledescription="slide"
            aria-label={rotulos.posicao[i]}
            data-ativo={i === atual ? "true" : "false"}
            inert={i !== atual}
          >
            {slide}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="sa-carrossel__seta sa-carrossel__seta--anterior"
        data-precisa-js=""
        aria-label={rotulos.anterior}
        onClick={() => ir(atual - 1)}
      >
        <ChevronLeftIcon aria-hidden="true" size={32} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        className="sa-carrossel__seta sa-carrossel__seta--proxima"
        data-precisa-js=""
        aria-label={rotulos.proximo}
        onClick={() => ir(atual + 1)}
      >
        <ChevronRightIcon aria-hidden="true" size={32} strokeWidth={1.5} />
      </button>
      <div className="sa-carrossel__rodape" data-precisa-js="">
        <div className="sa-carrossel__pontos">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className="sa-carrossel__ponto"
              aria-label={rotulos.irPara[i]}
              aria-current={i === atual ? "true" : undefined}
              onClick={() => ir(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="sa-carrossel__pausa"
          aria-label={rodando ? rotulos.pausar : rotulos.tocar}
          onClick={() => setRodando((r) => !r)}
        >
          {rodando ? (
            <PauseIcon aria-hidden="true" size={16} strokeWidth={1.5} />
          ) : (
            <PlayIcon aria-hidden="true" size={16} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
}
