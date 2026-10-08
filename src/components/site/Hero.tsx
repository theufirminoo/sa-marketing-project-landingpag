import { Fragment, type CSSProperties } from "react";

import Image from "next/image";

import { carrossel, comum, fundos, hero, travas, type SlideHero } from "@/content/site";
import { urlWhatsapp } from "@/lib/whatsapp";
import { BotaoDiagnostico } from "./BotaoDiagnostico";
import { Carrossel } from "./Carrossel";
import { VideoFundo } from "./VideoFundo";

const indice = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * O hero já é a primeira pergunta. Cada opção é um <button> em pílula:
 * clicar abre o diagnóstico na tela 2 com a resposta registrada.
 * A entrada é CSS, para não esperar o JavaScript e não atrasar o LCP: o
 * título sobe 16 px e as opções aparecem em seguida, com 40 ms entre elas.
 */
function SlidePergunta() {
  return (
    <div className="sa-slide sa-slide--pergunta">
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
        </div>
    </div>
  );
}

const semJs = urlWhatsapp(comum.mensagemWhatsappDireta);

/** Vídeo em tela cheia, texto centralizado. */
function SlideVideo({ slide }: { slide: SlideHero }) {
  return (
    <div className="sa-slide sa-slide--video">
      <Image src={slide.imagem.src} alt="" fill sizes="100vw" className="sa-slide__fundo" />
      {slide.video ? <VideoFundo src={slide.video} className="sa-video-fundo--slide" rotulos={fundos.rotulos} /> : null}
      <div className="sa-slide__veu" aria-hidden="true" />
      <div className="sa-container sa-slide__centro">
        <p className="rotulo text-accent-text">{slide.chamada}</p>
        <h2 className="titulo-1 mt-4">{slide.titulo}</h2>
        <p className="lead mx-auto mt-6 text-text-muted">{slide.texto}</p>
        <BotaoDiagnostico origem="hero" frente={slide.frente} hrefSemJs={semJs} className="sa-btn mt-8">
          {slide.acao}
        </BotaoDiagnostico>
      </div>
    </div>
  );
}

/** Texto à esquerda, foto em arco à direita, com linha âmbar na borda. */
function SlideArco({ slide }: { slide: SlideHero }) {
  return (
    <div className="sa-slide sa-slide--arco">
      <div className="sa-slide__arco">
        <Image src={slide.imagem.src} alt={slide.imagem.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" />
      </div>
      <div className="sa-container sa-slide__lado">
        <p className="rotulo text-accent-text">{slide.chamada}</p>
        <h2 className="titulo-1 mt-4">{slide.titulo}</h2>
        <p className="lead mt-6 text-text-muted">{slide.texto}</p>
        <BotaoDiagnostico origem="hero" frente={slide.frente} hrefSemJs={semJs} className="sa-btn mt-8">
          {slide.acao}
        </BotaoDiagnostico>
      </div>
    </div>
  );
}

/** Foto inteira de um lado e cartão de vidro com o texto do outro. */
function SlideFoto({ slide }: { slide: SlideHero }) {
  return (
    <div className="sa-slide sa-slide--foto">
      <Image src={slide.imagem.src} alt={slide.imagem.alt} fill sizes="100vw" className="sa-slide__fundo" />
      <div className="sa-slide__veu sa-slide__veu--lado" aria-hidden="true" />
      <div className="sa-container sa-slide__lado sa-slide__lado--direita">
        <div className="sa-vidro p-8">
          <p className="rotulo text-accent-text">{slide.chamada}</p>
          <h2 className="titulo-1 mt-4">{slide.titulo}</h2>
          <p className="lead mt-6">{slide.texto}</p>
          <BotaoDiagnostico origem="hero" frente={slide.frente} hrefSemJs={semJs} className="sa-btn mt-8">
            {slide.acao}
          </BotaoDiagnostico>
        </div>
      </div>
    </div>
  );
}

/** Foto ocupando a metade esquerda, texto na direita. */
function SlideMetade({ slide }: { slide: SlideHero }) {
  return (
    <div className="sa-slide sa-slide--metade">
      <div className="sa-slide__metade">
        <Image src={slide.imagem.src} alt={slide.imagem.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" />
      </div>
      <div className="sa-container sa-slide__lado sa-slide__lado--direita">
        <div>
          <p className="rotulo text-accent-text">{slide.chamada}</p>
          <h2 className="titulo-1 mt-4">{slide.titulo}</h2>
          <p className="lead mt-6 text-text-muted">{slide.texto}</p>
          <BotaoDiagnostico origem="hero" frente={slide.frente} hrefSemJs={semJs} className="sa-btn mt-8">
            {slide.acao}
          </BotaoDiagnostico>
        </div>
      </div>
    </div>
  );
}

const SLIDES = { video: SlideVideo, arco: SlideArco, foto: SlideFoto, metade: SlideMetade } as const;

export function Hero() {
  return (
    <section id="inicio" data-theme="dark" aria-labelledby="hero-titulo" className="sa-grao sa-hero overflow-hidden">
      <Carrossel
        rotulos={{
          rotulo: carrossel.rotulo,
          anterior: carrossel.anterior,
          proximo: carrossel.proximo,
          pausar: carrossel.pausar,
          tocar: carrossel.tocar,
          irPara: [0, ...carrossel.slides.map((_, i) => i + 1)].map((i) => carrossel.irPara(i + 1)),
          posicao: [0, ...carrossel.slides.map((_, i) => i + 1)].map((i) => carrossel.posicao(i + 1, carrossel.slides.length + 1)),
        }}
        slides={[
          <SlidePergunta key="pergunta" />,
          ...carrossel.slides.map((slide) => {
            const Slide = SLIDES[slide.formato];
            return <Slide key={slide.id} slide={slide} />;
          }),
        ]}
      />
    </section>
  );
}
