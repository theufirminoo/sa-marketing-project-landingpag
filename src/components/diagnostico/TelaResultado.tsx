"use client";

import type { RefObject } from "react";
import { CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { comum, diagnostico } from "@/content/site";
import { registrarEvento } from "@/lib/analytics";

const tela = diagnostico.telas.resultado;

type Props = {
  nome: string;
  frentes: readonly string[];
  respostas: readonly (readonly [string, string])[];
  urlWhatsapp: string;
  tituloRef: RefObject<HTMLHeadingElement | null>;
  aoRefazer: () => void;
};

export function IconeWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

/** Fim do diagnóstico: frentes indicadas, resumo das respostas e o envio pelo WhatsApp. */
export function TelaResultado({ nome, frentes, respostas, urlWhatsapp, tituloRef, aoRefazer }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="sa-diag__corpo sa-resultado">
        <span className="sa-resultado__selo" aria-hidden="true">
          <CheckIcon size={22} strokeWidth={2.5} />
        </span>
        <p className="rotulo mt-4 text-accent-text">{tela.rotulo}</p>
        <DialogTitle ref={tituloRef} tabIndex={-1} className="titulo-2 mt-2">
          {tela.titulo(nome)}
        </DialogTitle>

        <h3 className="pequeno sa-resultado__rotulo">{tela.rotuloFrentes}</h3>
        <ul className="sa-resultado__frentes">
          {frentes.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        <h3 className="pequeno sa-resultado__rotulo">{tela.rotuloRespostas}</h3>
        <dl className="sa-resultado__respostas">
          {respostas.map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt className="pequeno text-text-muted">{rotulo}</dt>
              <dd className="corpo m-0">{valor}</dd>
            </div>
          ))}
        </dl>

        <p className="pequeno mt-6 text-text-muted">{tela.texto}</p>
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
            className="gap-2"
            onClick={() => registrarEvento("whatsapp_aberto", { origem: "resultado" })}
          >
            <IconeWhatsapp />
            {tela.abrirWhatsapp}
            <span className="sr-only"> {comum.novaAba}</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
