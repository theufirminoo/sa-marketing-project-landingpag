"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type Props = {
  src: string;
  /** Classe de opacidade e mistura, definida em globals.css. */
  className?: string;
  /** Primeiro vídeo da página: `autoplay` nativo, que o Safari do iPhone respeita melhor que um play() por script. */
  automatico?: boolean;
};

/**
 * Vídeo decorativo atrás do conteúdo da seção, em laço contínuo e sem
 * controle. Começa sozinho logo depois do carregamento da página (ou na
 * primeira interação, o que vier antes).
 * Se o navegador recusar o play (economia de energia), tenta de novo no
 * próximo toque.
 * Fica sempre visível (sem esperar o "playing" para aparecer): o Safari do
 * iPhone não dá play automático em vídeo com opacidade zero, e o vídeo nunca
 * chegava a aparecer. Antes de ter quadro, ele é só transparente.
 * Por decisão do cliente, toca também com movimento reduzido: é só fundo.
 */
export function VideoFundo({ src, className, automatico = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Tenta tocar a cada interação até conseguir. No iPhone em modo de
    // economia de energia o autoplay é bloqueado e só um toque libera.
    const eventos = ["pointerdown", "pointerup", "touchstart", "touchend", "click", "keydown", "scroll", "wheel", "pointermove"] as const;
    const video = ref.current;
    if (!video) return;
    const parar = () => eventos.forEach((e) => window.removeEventListener(e, tentar));
    const tentar = () => {
      if (!video.paused) return parar();
      // Slide escondido do carrossel: quem dá o play é o Carrossel ao mostrá-lo.
      if (video.closest('.sa-carrossel__slide[data-ativo="false"]')) return;
      video.play().then(
        () => {
          delete video.dataset.bloqueado;
          parar();
        },
        // Navegador com economia de dados ou bateria bloqueia o autoplay até o
        // primeiro toque. Enquanto isso, o quadro parado ganha um zoom lento
        // (CSS) para o fundo não parecer travado.
        () => {
          video.dataset.bloqueado = "";
        },
      );
    };
    eventos.forEach((e) => window.addEventListener(e, tentar, { passive: true }));
    // Também começa sozinho, logo depois que a página termina de carregar:
    // o título já foi desenhado e o vídeo entra por trás, esmaecendo.
    let espera = 0;
    const depoisDeCarregar = () => {
      espera = window.setTimeout(tentar, 400);
    };
    if (document.readyState === "complete") depoisDeCarregar();
    else window.addEventListener("load", depoisDeCarregar, { once: true });
    return () => {
      parar();
      window.clearTimeout(espera);
      window.removeEventListener("load", depoisDeCarregar);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={cn("sa-video-fundo", className)}
      muted
      loop
      playsInline
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      autoPlay={automatico}
      preload={automatico ? "auto" : "none"}
      onPlaying={(e) => delete e.currentTarget.dataset.bloqueado}
      aria-hidden="true"
      tabIndex={-1}
    >
      {/* MP4 (H.264) primeiro: é o que o Safari do iPhone toca. O navegador
          que não decodifica H.264 passa para o WebM. */}
      <source src={src} type="video/mp4" />
      <source src={src.replace(/\.mp4$/, ".webm")} type="video/webm" />
    </video>
  );
}
