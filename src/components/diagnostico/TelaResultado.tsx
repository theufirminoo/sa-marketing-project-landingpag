"use client";

import type { RefObject } from "react";

import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { comum, diagnostico } from "@/content/site";
import { registrarEvento } from "@/lib/analytics";

const tela = diagnostico.telas.resultado;

type Props = {
  frentes: string;
  urlWhatsapp: string;
  tituloRef: RefObject<HTMLHeadingElement | null>;
  aoRefazer: () => void;
};

export function TelaResultado({ frentes, urlWhatsapp, tituloRef, aoRefazer }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="sa-diag__corpo">
        <DialogTitle ref={tituloRef} tabIndex={-1} className="titulo-2">
          {tela.titulo(frentes)}
        </DialogTitle>
        <p className="corpo sa-diag__resultado mt-6">{tela.texto}</p>
      </div>
      <div className="sa-diag__acoes flex-col-reverse items-stretch md:flex-row md:items-center">
        <Button variant="link" onClick={aoRefazer}>
          {tela.refazer}
        </Button>
        <Button asChild>
          <a
            href={urlWhatsapp}
            target="_blank"
            rel="noopener"
            onClick={() => registrarEvento("whatsapp_aberto", { origem: "resultado" })}
          >
            {tela.abrirWhatsapp}
            <span className="sr-only"> {comum.novaAba}</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
