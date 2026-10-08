import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { comum, frentes, secaoFrentes } from "@/content/site";
import { urlWhatsapp } from "@/lib/whatsapp";
import { BotaoDiagnostico } from "./BotaoDiagnostico";

/** Quatro linhas de largura total. Sem ícone e sem número: não são sequência. */
export function Frentes() {
  return (
    <section id="frentes" data-theme="dark" aria-labelledby="frentes-titulo" className="sa-grao sa-secao">
      <div className="sa-container">
        <div className="sa-texto">
          <h2 id="frentes-titulo" className="titulo-1">
            {secaoFrentes.titulo}
          </h2>
          <p className="lead mt-6 text-text-muted">{secaoFrentes.abertura}</p>
        </div>
        <Accordion type="multiple" defaultValue={[secaoFrentes.abertaAoCarregar]} className="sa-frentes mt-12">
          {frentes.map((frente) => (
            <AccordionItem key={frente.id} value={frente.id} className="sa-frente">
              <AccordionTrigger className="sa-frente__gatilho" data-frente-gatilho={frente.id}>
                <span className="titulo-2">{frente.nome}</span>
                <span className="corpo sa-frente__promessa">{frente.promessa}</span>
              </AccordionTrigger>
              <AccordionContent className="sa-frente__corpo">
                <ul className="sa-frente__lista corpo" aria-label={secaoFrentes.rotuloServicos(frente.nome)}>
                  {frente.servicos.map((servico) => (
                    <li key={servico}>{servico}</li>
                  ))}
                </ul>
                <div className="sa-frente__acao">
                  <BotaoDiagnostico
                    origem="frente"
                    frente={frente.id}
                    hrefSemJs={urlWhatsapp(comum.mensagemWhatsappDireta)}
                    className="sa-link corpo"
                  >
                    {secaoFrentes.acao}
                  </BotaoDiagnostico>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
