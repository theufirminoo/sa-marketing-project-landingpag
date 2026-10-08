"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";

type Conexao = { saveData?: boolean };

type Props = {
  video: {
    src: string;
    poster: string;
    largura: number;
    altura: number;
    descricao: string;
    pausar: string;
    tocar: string;
  };
  /** Etiqueta "Provisório", renderizada no servidor. */
  etiqueta?: ReactNode;
};

/**
 * Vídeo 9:16 com pôster. Só toca sozinho se a pessoa não pediu movimento
 * reduzido nem economia de dados, e só depois da carga da página, para não
 * disputar banda com o título (o LCP).
 */
export function HeroVideo({ video, etiqueta }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conexao = (navigator as Navigator & { connection?: Conexao }).connection;
    if (reduzido || conexao?.saveData) return;

    let cancelado = false;
    const tocar = () => {
      if (cancelado) return;
      elemento.play().catch(() => setTocando(false));
    };
    const depoisDaCarga = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(tocar, { timeout: 3000 });
      else setTimeout(tocar, 1500);
    };
    if (document.readyState === "complete") depoisDaCarga();
    else window.addEventListener("load", depoisDaCarga, { once: true });

    return () => {
      cancelado = true;
      window.removeEventListener("load", depoisDaCarga);
    };
  }, []);

  const alternar = () => {
    const elemento = ref.current;
    if (!elemento) return;
    if (elemento.paused) elemento.play().catch(() => setTocando(false));
    else elemento.pause();
  };

  return (
    <div className="sa-moldura">
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={video.poster}
        width={video.largura}
        height={video.altura}
        aria-label={video.descricao}
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
      >
        <source src={video.src.replace(/\.mp4$/, ".webm")} type="video/webm" />
        <source src={video.src} type="video/mp4" />
      </video>
      <button
        type="button"
        className="sa-btn-icone absolute right-3 bottom-3"
        aria-label={tocando ? video.pausar : video.tocar}
        onClick={alternar}
      >
        {tocando ? (
          <PauseIcon aria-hidden="true" size={20} strokeWidth={1.5} />
        ) : (
          <PlayIcon aria-hidden="true" size={20} strokeWidth={1.5} />
        )}
      </button>
      {etiqueta}
    </div>
  );
}
