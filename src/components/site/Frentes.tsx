import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";

import { comum, frentes, fundos, secaoFrentes } from "@/content/site";
import { urlWhatsapp } from "@/lib/whatsapp";
import { BotaoDiagnostico } from "./BotaoDiagnostico";
import { FrenteAtiva } from "./FrenteAtiva";
import { VideoFundo } from "./VideoFundo";

/**
 * As quatro frentes em "substituição": a cena fica presa na tela e, conforme
 * a pessoa rola, uma frente dá lugar à próxima; rolando para cima, volta à
 * anterior. Quem controla é o `FrenteAtiva`. Sem JavaScript (ou se o painel
 * não couber na tela), as frentes aparecem uma embaixo da outra.
 */
export function Frentes() {
  return (
    <section id="frentes" data-theme="dark" aria-labelledby="frentes-titulo" className="sa-grao sa-secao">
      {fundos.frentes ? <VideoFundo src={fundos.frentes} className="sa-video-fundo--suave" /> : null}
      <div className="sa-container">
        <div className="sa-texto sa-revela">
          <h2 id="frentes-titulo" className="titulo-1">
            {secaoFrentes.titulo}
          </h2>
          <p className="lead mt-6 text-text-muted">{secaoFrentes.abertura}</p>
        </div>
        <div className="sa-frentes-palco mt-12" data-frentes-palco="">
          <div className="sa-frentes-cena">
            <nav className="sa-frentes-progresso" aria-label={secaoFrentes.rotuloIndice}>
              <ol>
                {frentes.map((frente) => (
                  <li key={frente.id}>
                    <a href={`#frente-${frente.id}`} data-frente-indice={frente.id}>
                      {secaoFrentes.nomeCurto(frente.nome)}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="sa-frentes-paineis">
              {frentes.map((frente) => (
                <article
                  key={frente.id}
                  id={`frente-${frente.id}`}
                  className="sa-frente-painel"
                  data-frente-painel={frente.id}
                  aria-labelledby={`frente-${frente.id}-titulo`}
                >
                  <div className="sa-frente-painel__foto">
                    <Image src={frente.imagem.src} alt={frente.imagem.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" />
                  </div>
                  <div className="sa-frente-painel__corpo">
                    <h3 id={`frente-${frente.id}-titulo`} className="titulo-2">
                      {frente.nome}
                    </h3>
                    <p className="corpo mt-2 text-text-muted">{frente.promessa}</p>
                    <ul className="sa-frente-painel__servicos" aria-label={secaoFrentes.rotuloServicos(frente.nome)}>
                      {frente.servicos.map((servico) => (
                        <li key={servico}>{servico}</li>
                      ))}
                    </ul>
                    <BotaoDiagnostico
                      origem="frente"
                      frente={frente.id}
                      hrefSemJs={urlWhatsapp(comum.mensagemWhatsappDireta)}
                      className="sa-btn sa-btn--contorno mt-6"
                    >
                      {secaoFrentes.acao}
                      <ArrowRightIcon aria-hidden="true" size={18} strokeWidth={2} />
                    </BotaoDiagnostico>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
        <FrenteAtiva />
      </div>
    </section>
  );
}
