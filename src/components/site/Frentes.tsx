import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";

import { comum, frentes, fundos, secaoFrentes } from "@/content/site";
import { urlWhatsapp } from "@/lib/whatsapp";
import { BotaoDiagnostico } from "./BotaoDiagnostico";
import { FrenteAtiva } from "./FrenteAtiva";
import { VideoFundo } from "./VideoFundo";

/**
 * As quatro frentes como painéis abertos, um embaixo do outro. Ao rolar, o
 * painel que chega ao topo fica em destaque e o índice (lateral no
 * computador, faixa fixa no celular) acompanha. Nada abre ou fecha: a altura
 * da página não muda enquanto a pessoa rola, então a leitura não pula.
 * Sem JavaScript, todos os painéis aparecem iguais.
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
        <div className="sa-frentes-rolagem mt-12">
          <nav className="sa-frentes-indice" aria-label={secaoFrentes.rotuloIndice}>
            <ol>
              {frentes.map((frente) => (
                <li key={frente.id}>
                  <a href={`#frente-${frente.id}`} data-frente-indice={frente.id}>
                    <span className="sa-frentes-indice__nome">{frente.nome}</span>
                    <span className="sa-frentes-indice__promessa pequeno">{frente.promessa}</span>
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
                  <Image
                    src={frente.imagem.src}
                    alt={frente.imagem.alt}
                    width={960}
                    height={540}
                    sizes="(min-width: 1024px) 55vw, 100vw"
                  />
                </div>
                <div className="sa-frente-painel__corpo">
                  <h3 id={`frente-${frente.id}-titulo`} className="titulo-2">
                    {frente.nome}
                  </h3>
                  <p className="corpo mt-2 text-text-muted">{frente.promessa}</p>
                  <ul className="sa-frente__lista corpo mt-4" aria-label={secaoFrentes.rotuloServicos(frente.nome)}>
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
        <FrenteAtiva />
      </div>
    </section>
  );
}
