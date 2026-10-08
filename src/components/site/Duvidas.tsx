import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { duvidas } from "@/content/site";

type Item = (typeof duvidas.itens)[number];

function Resposta({ item }: { item: Item }) {
  if (!("link" in item)) return <>{item.resposta}</>;
  const [antes, depois] = item.resposta.split(item.link.texto);
  return (
    <>
      {antes}
      <a href={item.link.href} className="sa-link">
        {item.link.texto}
      </a>
      {depois}
    </>
  );
}

export function Duvidas() {
  return (
    <section id="duvidas" data-theme="light" aria-labelledby="duvidas-titulo" className="sa-secao">
      <div className="sa-container">
        <h2 id="duvidas-titulo" className="titulo-1 sa-texto sa-revela">
          {duvidas.titulo}
        </h2>
        <Accordion type="single" collapsible defaultValue="duvida-0" className="sa-faqs mt-12">
          {duvidas.itens.map((item, i) => (
            <AccordionItem key={item.pergunta} value={`duvida-${i}`} className="sa-faq sa-vidro">
              <AccordionTrigger className="sa-faq__gatilho">
                <span className="titulo-3">{item.pergunta}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="corpo sa-faq__resposta">
                  <Resposta item={item} />
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
