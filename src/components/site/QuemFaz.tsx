import Image from "next/image";

import { fundos, quemFaz, type Parceiro, type Pessoa } from "@/content/site";
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

function RetratoParceiro({ parceiro }: { parceiro: Parceiro }) {
  return (
    <figure className="sa-pessoa sa-pessoa--parceiro relative m-0">
      <div className="sa-pessoa__foto">
        <Image
          src={parceiro.foto}
          alt={quemFaz.altFoto(parceiro.nome)}
          width={800}
          height={1000}
          sizes="(min-width: 1280px) 280px, (min-width: 768px) 22vw, 50vw"
        />
      </div>
      <figcaption className="sa-pessoa__legenda sa-vidro">
        <span className="titulo-3 text-marca-giz">{parceiro.nome}</span>
        <span className="pequeno text-areia">{parceiro.funcao}</span>
      </figcaption>
    </figure>
  );
}

export function QuemFaz() {
  return (
    <section id="quem-faz" data-theme="dark" aria-labelledby="quem-faz-titulo" className="sa-grao sa-secao sa-cafe">
      {fundos.quemFaz ? <VideoFundo src={fundos.quemFaz} className="sa-video-fundo--textura" /> : null}
      <div className="sa-container">
        <div className="sa-texto sa-revela">
          <h2 id="quem-faz-titulo" className="titulo-1 text-marca-giz">
            {quemFaz.titulo}
          </h2>
          <p className="lead mt-6 text-areia">{quemFaz.abertura}</p>
        </div>
        <h3 className="rotulo mt-12 text-areia">{quemFaz.rotuloSocios}</h3>
        <ul className="mt-4 grid list-none gap-12 p-0 md:grid-cols-3 md:gap-6">
          {quemFaz.pessoas.map((pessoa) => (
            <li key={pessoa.id} className="sa-revela">
              <Retrato pessoa={pessoa} />
            </li>
          ))}
        </ul>
        <div className="sa-parceiros">
          <div>
            <h3 className="rotulo text-areia">{quemFaz.rotuloParceiros}</h3>
            <p className="corpo mt-2 text-areia">{quemFaz.aberturaParceiros}</p>
          </div>
          <ul className="sa-parceiros__lista">
            {quemFaz.parceiros.map((parceiro) => (
              <li key={parceiro.id} className="sa-revela">
                <RetratoParceiro parceiro={parceiro} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
