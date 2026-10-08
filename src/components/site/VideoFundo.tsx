"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Conexao = { saveData?: boolean };

type Props = {
  src: string;
  /** Classe de opacidade e mistura, definida em globals.css. */
  className?: string;
  rotulos: { pausar: string; tocar: string };
};

/**
 * Vídeo decorativo atrás do conteúdo da seção. Só baixa e toca depois da
 * primeira interação e quando a seção está na tela, nunca com movimento
 * reduzido ou economia de dados, e tem botão de pausa (WCAG 2.2.2).
 */
export function VideoFundo({ src, className, rotulos }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  // O primeiro quadro é desenhado ainda invisível; só depois o vídeo aparece.
  // Assim ele não disputa o LCP com o título.
  const [visivel, setVisivel] = useState(false);
  const [pausadoPelaPessoa, setPausadoPelaPessoa] = useState(false);
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conexao = (navigator as Navigator & { connection?: Conexao }).connection;
    if (reduzido || conexao?.saveData) return;
    // Só depois da primeira interação: o LCP já foi fechado e o vídeo não
    // disputa banda nem o maior elemento da tela com o título.
    const eventos = ["pointerdown", "keydown", "scroll", "touchstart", "wheel"] as const;
    const permitir = () => {
      setPermitido(true);
      eventos.forEach((e) => window.removeEventListener(e, permitir));
    };
    eventos.forEach((e) => window.addEventListener(e, permitir, { passive: true, once: true }));
    return () => eventos.forEach((e) => window.removeEventListener(e, permitir));
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || !permitido || pausadoPelaPessoa) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) video.play().catch(() => setTocando(false));
        else video.pause();
      },
      { rootMargin: "100px" },
    );
    observador.observe(video);
    return () => observador.disconnect();
  }, [permitido, pausadoPelaPessoa]);

  const alternar = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      setPausadoPelaPessoa(false);
      setPermitido(true);
      video.play().catch(() => setTocando(false));
    } else {
      setPausadoPelaPessoa(true);
      video.pause();
    }
  };

  return (
    <>
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
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
      >
        <source src={src.replace(/\.mp4$/, ".webm")} type="video/webm" />
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        className="sa-btn-icone sa-video-fundo__controle"
        aria-label={tocando ? rotulos.pausar : rotulos.tocar}
        onClick={alternar}
        hidden={!permitido && !tocando}
      >
        {tocando ? (
          <PauseIcon aria-hidden="true" size={20} strokeWidth={1.5} />
        ) : (
          <PlayIcon aria-hidden="true" size={20} strokeWidth={1.5} />
        )}
      </button>
    </>
  );
}
