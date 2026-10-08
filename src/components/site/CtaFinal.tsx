import { comum, ctaFinal, travas } from "@/content/site";
import { urlWhatsapp } from "@/lib/whatsapp";
import { BotaoDiagnostico } from "./BotaoDiagnostico";

/** Fundo âmbar. É o único bloco centralizado da página. */
export function CtaFinal() {
  return (
    <section id="cta-final" aria-labelledby="cta-final-titulo" className="sa-secao sa-secao--alta sa-sobre-ambar relative isolate overflow-hidden bg-accent text-marca-preto">
      <div className="sa-formas" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="sa-container flex flex-col items-center text-center">
        <h2 id="cta-final-titulo" className="titulo-1 max-w-[20ch]">
          {ctaFinal.titulo}
        </h2>
        <ul className="sa-chips mt-8 w-full max-w-[var(--container-texto)] justify-center" aria-labelledby="cta-final-titulo">
          {travas.map((trava) => (
            <li key={trava.id}>
              <BotaoDiagnostico
                origem="cta-final"
                trava={trava.id}
                className="sa-chip sa-chip--ambar"
                hrefSemJs={urlWhatsapp(comum.mensagemWhatsappSemJs(trava.rotulo))}
              >
                {trava.rotulo}
              </BotaoDiagnostico>
            </li>
          ))}
        </ul>
        <p className="mt-8">
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
