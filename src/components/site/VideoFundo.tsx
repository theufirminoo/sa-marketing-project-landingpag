"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  src: string;
  /** Classe de opacidade e mistura, definida em globals.css. */
  className?: string;
};

/**
 * Vídeo decorativo atrás do conteúdo da seção, em laço contínuo e sem
 * controle. Só começa depois da primeira interação, para não virar o LCP.
 * Se o navegador recusar o play (economia de energia), tenta de novo no
 * próximo toque.
 * Por decisão do cliente, toca também com movimento reduzido: é só fundo.
 */
export function VideoFundo({ src, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  // O primeiro quadro é desenhado ainda invisível; só depois o vídeo aparece.
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Tenta tocar a cada interação até conseguir. No iPhone em modo de
    // economia de energia o autoplay é bloqueado e só um toque libera.
    const eventos = ["pointerdown", "pointerup", "touchstart", "touchend", "click", "keydown", "scroll", "wheel", "pointermove"] as const;
    const video = ref.current;
    if (!video) return;
    const parar = () => eventos.forEach((e) => window.removeEventListener(e, tentar));
    const tentar = () => {
      if (!video.paused) return parar();
      video.play().then(parar, () => {});
    };
    eventos.forEach((e) => window.addEventListener(e, tentar, { passive: true }));
    return parar;
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
      {/* MP4 (H.264) primeiro: é o que o Safari do iPhone toca. O navegador
          que não decodifica H.264 passa para o WebM. */}
      <source src={src} type="video/mp4" />
      <source src={src.replace(/\.mp4$/, ".webm")} type="video/webm" />
    </video>
  );
}
