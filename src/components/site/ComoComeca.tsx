import { comoComeca, comum } from "@/content/site";
import { urlWhatsapp } from "@/lib/whatsapp";
import { BotaoDiagnostico } from "./BotaoDiagnostico";

export function ComoComeca() {
  return (
    <section data-theme="light" aria-labelledby="como-comeca-titulo" className="sa-secao">
      <div className="sa-container">
        <h2 id="como-comeca-titulo" className="titulo-1 sa-texto sa-revela">
          {comoComeca.titulo}
        </h2>
        <ol className="sa-passos mt-12 grid list-none gap-8 p-0 md:grid-cols-3 md:gap-6">
          {comoComeca.passos.map((passo) => (
            <li key={passo.titulo} className="sa-passo sa-revela">
              <h3 className="titulo-3">{passo.titulo}</h3>
              <p className="corpo mt-2 text-text-muted">{passo.texto}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-col items-start gap-4">
          <BotaoDiagnostico origem="como-comeca" hrefSemJs={urlWhatsapp(comum.mensagemWhatsappDireta)} className="sa-btn">
            {comum.ctaDiagnostico}
          </BotaoDiagnostico>
          <p className="pequeno text-text-muted">{comum.microtexto}</p>
        </div>
      </div>
    </section>
  );
}
