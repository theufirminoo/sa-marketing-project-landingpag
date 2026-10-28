import { Fragment, type CSSProperties } from "react";

import Image from "next/image";
import {
  ArrowRightIcon,
  BotIcon,
  CameraIcon,
  ClapperboardIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  MessageCircleIcon,
  MessageSquareQuoteIcon,
  MicIcon,
  MonitorSmartphoneIcon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react";

import { carrossel, comum, fundos, hero, type IconeSlide, type SlideHero } from "@/content/site";
import { urlWhatsapp } from "@/lib/whatsapp";
import { BotaoDiagnostico } from "./BotaoDiagnostico";
import { Carrossel } from "./Carrossel";
import { VideoFundo } from "./VideoFundo";

const indice = (i: number) => ({ "--i": i }) as CSSProperties;

const ICONES: Record<IconeSlide, LucideIcon> = {
  site: MonitorSmartphoneIcon,
  whatsapp: MessageCircleIcon,
  ia: BotIcon,
  painel: LayoutDashboardIcon,
  integracao: WorkflowIcon,
  suporte: LifeBuoyIcon,
  reels: ClapperboardIcon,
  foto: CameraIcon,
  videocast: MicIcon,
  depoimento: MessageSquareQuoteIcon,
};

function Icone({ nome }: { nome?: IconeSlide }) {
  if (!nome) return null;
  const Desenho = ICONES[nome];
  return (
    <span className="sa-icone" aria-hidden="true">
      <Desenho size={20} strokeWidth={1.75} />
    </span>
  );
}

/**
 * O hero mostra a primeira pergunta num cartão que é um botão só: tocar
 * abre o diagnóstico na tela 1, com as opções, e ele avança como sempre.
 * A entrada é CSS, para não esperar o JavaScript e não atrasar o LCP: o
 * título sobe 16 px e o cartão aparece em seguida.
 */
function SlidePergunta() {
  return (
    <div className="sa-slide sa-slide--pergunta">
      <div className="sa-brilho" aria-hidden="true" />
        {fundos.hero ? <VideoFundo src={fundos.hero} className="sa-video-fundo--hero" automatico /> : null}
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
            <BotaoDiagnostico
              origem="hero"
              hrefSemJs={urlWhatsapp(comum.mensagemWhatsappDireta)}
              className="sa-hero-cta sa-hero-entra mt-8"
              style={indice(0)}
            >
              <span className="sa-hero-cta__texto">
                <span className="rotulo text-accent-text">{hero.passo}</span>
                <span className="titulo-2">{hero.pergunta}</span>
              </span>
              <span className="sa-hero-cta__acao">
                {hero.acao}
                <ArrowRightIcon aria-hidden="true" size={20} strokeWidth={2} />
              </span>
            </BotaoDiagnostico>
            <p className="pequeno sa-hero-entra mt-4 text-text-muted" style={indice(1)}>
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
              <li key={d.texto} className="sa-destaque">
                {d.imagem ? (
                  <Image src={d.imagem} alt="" fill sizes="(min-width: 1024px) 280px, 45vw" className="sa-destaque__foto" />
                ) : null}
                <Icone nome={d.icone} />
                <span className="sa-destaque__texto corpo">{d.texto}</span>
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
                <li key={d.texto}>{d.texto}</li>
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
                  <Icone nome={item.icone} />
                  <span>
                    {item.cabeca ? <strong>{item.cabeca}: </strong> : null}
                    {item.texto}
                  </span>
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
