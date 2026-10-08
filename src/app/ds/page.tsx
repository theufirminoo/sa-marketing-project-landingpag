import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleAlertIcon } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * Vitrine do design system, só em desenvolvimento. Mostra cada primitivo
 * nos dois temas e nos estados que dá para fixar sem interação. Hover e
 * pressionado são conferidos no navegador. Textos de amostra ficam aqui
 * porque esta rota não vai ao ar.
 */
export const metadata: Metadata = { title: "Design system", robots: { index: false } };

function Vitrine({ tema }: { tema: "dark" | "light" }) {
  return (
    <section data-theme={tema} className={tema === "dark" ? "sa-grao sa-secao" : "sa-secao"} aria-labelledby={`ds-${tema}`}>
      <div className="sa-container grid gap-12">
        <h2 id={`ds-${tema}`} className="titulo-1">
          Tema {tema === "dark" ? "escuro" : "claro"}
        </h2>

        <div className="grid gap-4">
          <h3 className="titulo-3">Tipografia</h3>
          <p className="display">Display</p>
          <p className="titulo-1">Título 1</p>
          <p className="titulo-2">Título 2</p>
          <p className="titulo-3">Título 3</p>
          <p className="lead">Lead: abertura de seção.</p>
          <p className="corpo">Corpo: texto corrido.</p>
          <p className="pequeno text-text-muted">Pequeno: microtexto.</p>
          <p className="rotulo">Rótulo</p>
        </div>

        <div className="grid gap-4">
          <h3 className="titulo-3">Botões</h3>
          <div className="flex flex-wrap gap-4">
            <Button>Principal</Button>
            <Button aria-disabled="true">Principal desabilitado</Button>
            <Button variant="secundario">Secundário</Button>
            <Button variant="secundario" disabled>
              Secundário desabilitado
            </Button>
            <Button variant="link">Link como botão</Button>
            <a href="#ds-dark" className="sa-link">
              Link
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          <h3 className="titulo-3">Opções</h3>
          <ul className="sa-chips">
            <li>
              <button type="button" className="sa-chip">
                Opção em repouso
              </button>
            </li>
            <li>
              <button type="button" className="sa-chip" disabled>
                Opção desabilitada
              </button>
            </li>
          </ul>
          <RadioGroup defaultValue="b" aria-label="Exemplo de resposta única">
            <RadioGroupItem value="a">Não selecionada</RadioGroupItem>
            <RadioGroupItem value="b">Selecionada, com visto</RadioGroupItem>
            <RadioGroupItem value="c" disabled>
              Desabilitada
            </RadioGroupItem>
          </RadioGroup>
          <ul className="sa-etiquetas" aria-label="Etiquetas">
            <li className="sa-etiqueta rotulo">SA Social</li>
            <li className="sa-etiqueta rotulo">SA Studio</li>
          </ul>
        </div>

        <div className="grid max-w-[420px] gap-4">
          <h3 className="titulo-3">Campos</h3>
          <div className="sa-campo">
            <Label htmlFor={`ds-campo-${tema}`}>Rótulo</Label>
            <Input id={`ds-campo-${tema}`} placeholder="Exemplo" />
          </div>
          <div className="sa-campo">
            <Label htmlFor={`ds-erro-${tema}`}>Campo com erro</Label>
            <Input id={`ds-erro-${tema}`} aria-invalid="true" aria-describedby={`ds-erro-msg-${tema}`} defaultValue="(11) 9123" />
            <p id={`ds-erro-msg-${tema}`} className="pequeno sa-erro">
              <CircleAlertIcon aria-hidden="true" size={20} strokeWidth={1.5} />
              <span>Mensagem de erro que diz o que falta.</span>
            </p>
          </div>
          <Progress value={2} max={4} aria-label="Progresso de exemplo" />
        </div>

        <div className="grid gap-4">
          <h3 className="titulo-3">Linhas que se abrem</h3>
          <Accordion type="multiple" defaultValue={["aberta"]} className="sa-frentes">
            <AccordionItem value="aberta" className="sa-frente">
              <AccordionTrigger className="sa-frente__gatilho">
                <span className="titulo-2">Linha aberta</span>
                <span className="corpo sa-frente__promessa">Promessa da frente.</span>
              </AccordionTrigger>
              <AccordionContent className="sa-frente__corpo">
                <ul className="sa-frente__lista corpo">
                  <li>Subsserviço um</li>
                  <li>Subsserviço dois</li>
                  <li>Subsserviço três</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fechada" className="sa-frente">
              <AccordionTrigger className="sa-frente__gatilho">
                <span className="titulo-2">Linha fechada</span>
                <span className="corpo sa-frente__promessa">Promessa da frente.</span>
              </AccordionTrigger>
              <AccordionContent className="sa-frente__corpo">
                <p className="corpo">Conteúdo.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible defaultValue="d1" className="sa-faqs">
            <AccordionItem value="d1" className="sa-faq">
              <AccordionTrigger className="sa-faq__gatilho">
                <span className="titulo-3">Dúvida aberta?</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="corpo sa-faq__resposta">Resposta em corpo e texto de apoio.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="d2" className="sa-faq">
              <AccordionTrigger className="sa-faq__gatilho">
                <span className="titulo-3">Dúvida fechada?</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="corpo sa-faq__resposta">Resposta.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export default function DesignSystem() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main id="conteudo">
      <Vitrine tema="dark" />
      <Vitrine tema="light" />
      <section className="sa-secao sa-sobre-ambar bg-accent text-marca-preto" aria-labelledby="ds-ambar">
        <div className="sa-container flex flex-col items-center gap-6 text-center">
          <h2 id="ds-ambar" className="titulo-1">
            Sobre âmbar
          </h2>
          <ul className="sa-chips justify-center">
            <li>
              <button type="button" className="sa-chip sa-chip--ambar">
                Opção sobre âmbar
              </button>
            </li>
          </ul>
          <Button variant="preto">Botão sobre âmbar</Button>
          <a href="#ds-ambar" className="sa-link">
            Link sobre âmbar
          </a>
        </div>
      </section>
      <section className="sa-grao sa-secao sa-cafe" aria-labelledby="ds-cafe">
        <div className="sa-container">
          <h2 id="ds-cafe" className="titulo-1 text-marca-giz">
            Sobre café
          </h2>
          <p className="lead mt-6 text-areia">Areia sobre café, 7,4:1.</p>
        </div>
      </section>
    </main>
  );
}
