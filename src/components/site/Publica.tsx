import Image from "next/image";
import { PlayIcon } from "lucide-react";

import { comum, publica, site } from "@/content/site";

/** Sem embed e sem script do Instagram. Lista vazia: a seção não aparece. */
export function Publica() {
  if (publica.reels.length === 0) return null;
  return (
    <section data-theme="dark" aria-labelledby="publica-titulo" className="sa-grao sa-secao">
      <div className="sa-container">
        <div className="sa-texto">
          <h2 id="publica-titulo" className="titulo-1">
            {publica.titulo}
          </h2>
          <p className="lead mt-6 text-text-muted">{publica.abertura}</p>
        </div>
        <ul className="mt-12 grid list-none gap-6 p-0 md:grid-cols-3">
          {publica.reels.map((reel) => (
            <li key={reel.url}>
              <a href={reel.url} target="_blank" rel="noopener" className="sa-reel" aria-label={`${publica.rotuloReel(reel.legenda)} ${comum.novaAba}`}>
                <span className="sa-moldura">
                  <Image src={reel.poster} alt={reel.alt} width={720} height={1280} sizes="(min-width: 768px) 30vw, 100vw" />
                  <span className="sa-reel__tocar" aria-hidden="true">
                    <PlayIcon size={20} strokeWidth={1.5} />
                  </span>
                </span>
                <span className="pequeno text-text-muted">{reel.legenda}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <a href={site.instagram.url} target="_blank" rel="noopener" className="sa-link corpo">
            {publica.linkPerfil}
            <span className="sr-only"> {comum.novaAba}</span>
          </a>
        </p>
      </div>
    </section>
  );
}
