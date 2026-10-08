"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Conexao = { saveData?: boolean };

type Props = {
  src: string;
  /** Classe de opacidade e mistura, definida em globals.css. */
  className?: string;
};

/**
 * Vídeo decorativo atrás do conteúdo da seção, em laço contínuo e sem
 * controle. Só começa depois da primeira interação (para não virar o LCP) e
 * nunca com movimento reduzido ou economia de dados.
 */
export function VideoFundo({ src, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  // O primeiro quadro é desenhado ainda invisível; só depois o vídeo aparece.
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conexao = (navigator as Navigator & { connection?: Conexao }).connection;
    if (reduzido || conexao?.saveData) return;
    const eventos = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart", "wheel"] as const;
    const tocar = () => {
      eventos.forEach((e) => window.removeEventListener(e, tocar));
      ref.current?.play().catch(() => {});
    };
    eventos.forEach((e) => window.addEventListener(e, tocar, { passive: true, once: true }));
    return () => eventos.forEach((e) => window.removeEventListener(e, tocar));
  }, []);

  return (
    <video
      ref={ref}
      className={cn("sa-video-fundo", className)}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      data-tocando={visivel ? "true" : "false"}
      onPlaying={() => window.setTimeout(() => setVisivel(true), 300)}
    >
      <source src={src.replace(/\.mp4$/, ".webm")} type="video/webm" />
      <source src={src} type="video/mp4" />
    </video>
  );
}
