import Image from "next/image";

import { fundos, quemFaz, type Pessoa } from "@/content/site";
import { Provisorio } from "./Provisorio";
import { VideoFundo } from "./VideoFundo";

/** Silhueta provisória de cabeça e ombros, a mesma para os três. */
function Silhueta({ nome }: { nome: string }) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={quemFaz.altSilhueta(nome)} focusable="false">
      <circle cx="100" cy="74" r="40" />
      <path d="M8 200c0-52 38-84 92-84s92 32 92 84z" />
    </svg>
  );
}

function Retrato({ pessoa }: { pessoa: Pessoa }) {
  return (
    <figure className="sa-pessoa relative m-0">
      <div className="sa-pessoa__foto">
        {pessoa.foto ? (
          <Image
            src={pessoa.foto}
            alt={quemFaz.altFoto(pessoa.nome)}
            width={800}
            height={1000}
            sizes="(min-width: 1280px) 384px, (min-width: 768px) 30vw, 100vw"
          />
        ) : (
          <>
            <Silhueta nome={pessoa.nome} />
            <Provisorio className="absolute top-3 left-3" />
          </>
        )}
      </div>
      <figcaption className="sa-pessoa__legenda sa-vidro">
        <span className="titulo-3 text-marca-giz">{pessoa.nome}</span>
        <span className="pequeno text-marca-giz">{pessoa.cargo}</span>
        <span className="pequeno text-areia">{pessoa.cargoPt}</span>
      </figcaption>
    </figure>
  );
}

export function QuemFaz() {
  return (
    <section id="quem-faz" data-theme="dark" aria-labelledby="quem-faz-titulo" className="sa-grao sa-secao sa-cafe">
      {fundos.quemFaz ? <VideoFundo src={fundos.quemFaz} className="sa-video-fundo--textura" rotulos={fundos.rotulos} /> : null}
      <div className="sa-container">
        <div className="sa-texto sa-revela">
          <h2 id="quem-faz-titulo" className="titulo-1 text-marca-giz">
            {quemFaz.titulo}
          </h2>
          <p className="lead mt-6 text-areia">{quemFaz.abertura}</p>
        </div>
        <ul className="mt-12 grid list-none gap-12 p-0 md:grid-cols-3 md:gap-6">
          {quemFaz.pessoas.map((pessoa) => (
            <li key={pessoa.id} className="sa-revela">
              <Retrato pessoa={pessoa} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
