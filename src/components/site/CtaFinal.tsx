import { comum, ctaFinal } from "@/content/site";
import { urlWhatsapp } from "@/lib/whatsapp";
import { BotaoDiagnostico } from "./BotaoDiagnostico";

/** Fundo âmbar. É o único bloco centralizado da página. */
export function CtaFinal() {
  return (
    <section id="cta-final" aria-labelledby="cta-final-titulo" className="sa-secao sa-secao--alta sa-sobre-ambar relative isolate overflow-hidden bg-accent text-marca-preto">
      <div className="sa-container flex flex-col items-center text-center">
        <h2 id="cta-final-titulo" className="titulo-1 max-w-[20ch]">
          {ctaFinal.titulo}
        </h2>
        <p className="lead mt-6 max-w-[48ch]">{ctaFinal.texto}</p>
        <ul className="sa-beneficios" aria-label={ctaFinal.rotuloBeneficios}>
          {ctaFinal.beneficios.map((b) => (
            <li key={b.titulo}>
              <h3 className="titulo-3">{b.titulo}</h3>
              <p className="corpo mt-2">{b.texto}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <BotaoDiagnostico origem="cta-final" className="sa-btn sa-btn--preto" hrefSemJs={urlWhatsapp(comum.mensagemWhatsappDireta)}>
            {comum.ctaDiagnostico}
          </BotaoDiagnostico>
        </div>
        <ul className="sa-garantias pequeno">
          {ctaFinal.garantias.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        <p className="mt-6">
          <a
            href={urlWhatsapp(comum.mensagemWhatsappDireta)}
            target="_blank"
            rel="noopener"
            className="sa-link corpo"
            data-whatsapp-origem="cta-final"
          >
            {ctaFinal.linkDireto}
            <span className="sr-only"> {comum.novaAba}</span>
          </a>
        </p>
      </div>
    </section>
  );
}
