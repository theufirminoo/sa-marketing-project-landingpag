import Image from "next/image";

import { quemFaz } from "@/content/site";
import { Provisorio } from "./Provisorio";

type Cartao = { id: string; nome: string; foto?: string; linhas: readonly string[] };

/** Silhueta provisória de cabeça e ombros, para quem ainda não tem foto. */
function Silhueta({ nome }: { nome: string }) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={quemFaz.altSilhueta(nome)} focusable="false">
      <circle cx="100" cy="74" r="40" />
      <path d="M8 200c0-52 38-84 92-84s92 32 92 84z" />
    </svg>
  );
}

/** Foto quadrada e, embaixo dela, nome e função. Nada cobre o rosto. */
function Retrato({ cartao }: { cartao: Cartao }) {
  return (
    <figure className="sa-pessoa m-0">
      <div className="sa-pessoa__foto">
        {cartao.foto ? (
          <Image
            src={cartao.foto}
            alt={quemFaz.altFoto(cartao.nome)}
            width={800}
            height={800}
            sizes="(min-width: 1280px) 384px, (min-width: 768px) 30vw, 50vw"
          />
        ) : (
          <>
            <Silhueta nome={cartao.nome} />
            <Provisorio className="absolute top-3 left-3" />
          </>
        )}
      </div>
      <figcaption className="sa-pessoa__legenda">
        <span className="titulo-3">{cartao.nome}</span>
        {cartao.linhas.map((linha) => (
          <span key={linha} className="pequeno text-text-muted">
            {linha}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

function Grupo({ id, rotulo, texto, cartoes }: { id: string; rotulo: string; texto?: string; cartoes: Cartao[] }) {
  return (
    <div className="sa-time__grupo">
      <h3 id={id} className="titulo-2">
        {rotulo}
      </h3>
      {texto ? <p className="corpo mt-2 text-text-muted">{texto}</p> : null}
      <ul className="sa-time" aria-labelledby={id}>
        {cartoes.map((cartao) => (
          <li key={cartao.id} className="sa-revela">
            <Retrato cartao={cartao} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Fundo neutro e parado, sem vídeo, para as pessoas aparecerem.
 * Sócios e parceiros usam a mesma grade de três colunas: as fotos de
 * baixo ficam alinhadas com as de cima.
 */
export function QuemFaz() {
  const socios = quemFaz.pessoas.map((p) => ({ id: p.id, nome: p.nome, foto: p.foto, linhas: [p.cargo, p.cargoPt] }));
  const parceiros = quemFaz.parceiros.map((p) => ({ id: p.id, nome: p.nome, foto: p.foto, linhas: [p.funcao] }));
  return (
    <section id="quem-faz" data-theme="dark" aria-labelledby="quem-faz-titulo" className="sa-secao sa-secao--time">
      <div className="sa-container">
        <div className="sa-texto sa-revela">
          <h2 id="quem-faz-titulo" className="titulo-1">
            {quemFaz.titulo}
          </h2>
          <p className="lead mt-6 text-text-muted">{quemFaz.abertura}</p>
        </div>
        <Grupo id="time-socios" rotulo={quemFaz.rotuloSocios} cartoes={socios} />
        <Grupo id="time-parceiros" rotulo={quemFaz.rotuloParceiros} texto={quemFaz.aberturaParceiros} cartoes={parceiros} />
      </div>
    </section>
  );
}
