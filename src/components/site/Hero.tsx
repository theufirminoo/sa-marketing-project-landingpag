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
        {fundos.hero ? <VideoFundo src={fundos.hero} className="sa-video-fundo--hero" /> : null}
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
            <div className="sa-hero-pergunta mt-8">
              <p className="rotulo text-accent-text">{hero.passo}</p>
              <p id="hero-pergunta" className="titulo-3 mt-2">
                {hero.pergunta}
              </p>
              <p className="pequeno mt-1 text-text-muted">{hero.dica}</p>
            </div>
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
      {slide.video ? <VideoFundo src={slide.video} className="sa-video-fundo--slide" /> : null}
      <div className="sa-slide__veu" aria-hidden="true" />
      <div className="sa-container sa-slide__centro">
        <p className="rotulo text-accent-text">{slide.chamada}</p>
        <h2 className="titulo-1 mt-4">{slide.titulo}</h2>
        <p className="lead mx-auto mt-6 text-text-muted">{slide.texto}</p>
        <BotaoDiagnostico origem="hero" frente={slide.frente} hrefSemJs={semJs} className="sa-btn mt-8">
          {slide.acao}
        </BotaoDiagnostico>
        {slide.destaques ? (
          <ul className="sa-destaques">
            {slide.destaques.map((d) => (
              <li key={d} className="sa-vidro corpo">
                {d}
              </li>
            ))}
          </ul>
        ) : null}
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
          {slide.destaques ? (
            <ol className="sa-cadeia pequeno">
              {slide.destaques.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ol>
          ) : null}
          <BotaoDiagnostico origem="hero" frente={slide.frente} hrefSemJs={semJs} className="sa-btn mt-8">
            {slide.acao}
          </BotaoDiagnostico>
        </div>
      </div>
    </div>
  );
}

/** Foto de fundo, texto à esquerda e cartão de vidro com o que a frente entrega. */
function SlidePainel({ slide }: { slide: SlideHero }) {
  const Lista = slide.painel?.numerado ? "ol" : "ul";
  return (
    <div className="sa-slide sa-slide--painel" data-variante={slide.painel?.numerado ? "etapas" : "lista"}>
      <Image src={slide.imagem.src} alt={slide.imagem.alt} fill sizes="100vw" className="sa-slide__fundo" />
      <div className="sa-slide__veu sa-slide__veu--painel" aria-hidden="true" />
      <div className="sa-container sa-painel">
        <div className="sa-painel__texto">
          <p className="rotulo text-accent-text">{slide.chamada}</p>
          <h2 className="titulo-1 mt-4">{slide.titulo}</h2>
          <p className="lead mt-6 text-text-muted">{slide.texto}</p>
          <BotaoDiagnostico origem="hero" frente={slide.frente} hrefSemJs={semJs} className="sa-btn mt-8">
            {slide.acao}
          </BotaoDiagnostico>
        </div>
        {slide.painel ? (
          <div className="sa-painel__cartao sa-vidro">
            <p className="titulo-3">{slide.painel.titulo}</p>
            <Lista className="sa-painel__lista corpo" data-numerado={slide.painel.numerado ? "true" : undefined}>
              {slide.painel.itens.map((item) => (
                <li key={item.texto}>
                  {item.cabeca ? <strong>{item.cabeca}: </strong> : null}
                  {item.texto}
                </li>
              ))}
            </Lista>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const SLIDES = { video: SlideVideo, foto: SlideFoto, painel: SlidePainel } as const;

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
