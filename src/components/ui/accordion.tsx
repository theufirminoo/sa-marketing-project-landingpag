"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Accordion do shadcn sobre o Radix, com uma mudança: o conteúdo fechado
 * continua no HTML (escondido por CSS). Assim o texto é legível sem
 * JavaScript, entra na busca da página e no HTML servido.
 */

type Ids = { gatilho: string; conteudo: string };
const IdsDoItem = React.createContext<Ids | null>(null);

function useIdsDoItem() {
  const ids = React.useContext(IdsDoItem);
  if (!ids) throw new Error("Use AccordionTrigger e AccordionContent dentro de AccordionItem.");
  return ids;
}

function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const base = React.useId();
  const ids = React.useMemo(
    () => ({ gatilho: `${base}-gatilho`, conteudo: `${base}-conteudo` }),
    [base],
  );
  return (
    <IdsDoItem.Provider value={ids}>
      <AccordionPrimitive.Item
        data-slot="accordion-item"
        className={cn("sa-acordeao-item", className)}
        {...props}
      />
    </IdsDoItem.Provider>
  );
}

/** O cabeçalho (h2, h3) é passado por `nivel`; o sinal de mais e menos é CSS. */
function AccordionTrigger({
  className,
  children,
  nivel = 3,
  classeCabecalho,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  nivel?: 2 | 3;
  classeCabecalho?: string;
}) {
  const ids = useIdsDoItem();
  const Cabecalho = nivel === 2 ? "h2" : "h3";
  return (
    <AccordionPrimitive.Header asChild>
      <Cabecalho className={classeCabecalho}>
        <AccordionPrimitive.Trigger
          data-slot="accordion-trigger"
          id={ids.gatilho}
          aria-controls={ids.conteudo}
          className={className}
          {...props}
        >
          {children}
          <span className="sa-sinal" aria-hidden="true" />
        </AccordionPrimitive.Trigger>
      </Cabecalho>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<"div">) {
  const ids = useIdsDoItem();
  return (
    <div
      data-slot="accordion-content"
      role="region"
      id={ids.conteudo}
      aria-labelledby={ids.gatilho}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
