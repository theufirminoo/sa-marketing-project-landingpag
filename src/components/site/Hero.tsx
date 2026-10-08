import { Fragment, type CSSProperties } from "react";

import { comum, fundos, hero, travas } from "@/content/site";
import { urlWhatsapp } from "@/lib/whatsapp";
import { BotaoDiagnostico } from "./BotaoDiagnostico";
import { HeroVideo } from "./HeroVideo";
import { Provisorio } from "./Provisorio";
import { VideoFundo } from "./VideoFundo";

const indice = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * O hero já é a primeira pergunta. Cada opção é um <button> em pílula:
 * clicar abre o diagnóstico na tela 2 com a resposta registrada.
 * A entrada é CSS, para não esperar o JavaScript e não atrasar o LCP: o
 * título sobe 16 px e as opções aparecem em seguida, com 40 ms entre elas.
 */
export function Hero() {
  return (
    <section
      id="inicio"
      data-theme="dark"
      aria-labelledby="hero-titulo"
      className="sa-grao overflow-hidden pt-[calc(var(--header-h)+var(--space-6))] pb-16 lg:pt-[calc(var(--header-h)+var(--space-16))] lg:pb-32"
    >
      <div className="sa-brilho" aria-hidden="true" />
      {fundos.hero ? <VideoFundo src={fundos.hero} className="sa-video-fundo--hero" rotulos={fundos.rotulos} /> : null}
      <div className="sa-veu" aria-hidden="true" />
      <div className="sa-container lg:grid lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-7">
          {/* Um bloco de texto só: o Chrome conta o h1 inteiro como candidato a LCP. */}
          <h1 id="hero-titulo" className="display sa-hero-titulo">
            {hero.titulo.map((linha, i) => (
              <Fragment key={linha}>
                {linha}
                {i < hero.titulo.length - 1 ? (
                  <>
                    {" "}
                    <br />
                  </>
                ) : null}
              </Fragment>
            ))}
          </h1>
          <p className="lead mt-6 text-text-muted">{hero.subtitulo}</p>
          <p id="hero-pergunta" className="titulo-3 mt-8">
            {hero.pergunta}
          </p>
          <ul className="sa-chips mt-4" aria-labelledby="hero-pergunta">
            {travas.map((trava, i) => (
              <li key={trava.id} className="sa-hero-entra" style={indice(i)}>
                <BotaoDiagnostico
                  origem="hero"
                  trava={trava.id}
                  className="sa-chip"
                  hrefSemJs={urlWhatsapp(comum.mensagemWhatsappSemJs(trava.rotulo))}
                >
                  {trava.rotulo}
                </BotaoDiagnostico>
              </li>
            ))}
          </ul>
          <p className="pequeno sa-hero-entra mt-4 text-text-muted" style={indice(travas.length)}>
            {comum.microtexto}
          </p>
        </div>
        <div className="mx-auto mt-12 w-full max-w-sm lg:col-span-4 lg:col-start-9 lg:mx-0 lg:mt-0 lg:max-w-none">
          <HeroVideo video={hero.video} etiqueta={<Provisorio className="absolute top-3 left-3" />} />
        </div>
      </div>
    </section>
  );
}
