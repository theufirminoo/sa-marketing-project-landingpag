"use client";

import { useEffect, useRef, type FormEvent, type KeyboardEvent, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { RadioGroup } from "@/components/ui/radio-group";
import { diagnostico, type Opcao } from "@/content/site";
import { OpcaoChip } from "./OpcaoChip";

type Props = {
  pergunta: string;
  opcoes: readonly Opcao<string>[];
  valor?: string;
  podeVoltar: boolean;
  tituloRef: RefObject<HTMLHeadingElement | null>;
  aoResponder: (valor: string) => void;
  /** Recebe a resposta escolhida, para não depender do estado da renderização anterior. */
  aoAvancar: (valor: string) => void;
  aoVoltar: () => void;
};

/** Tela de resposta única: um toque responde e avança depois de 200 ms. */
export function TelaOpcoes({ pergunta, opcoes, valor, podeVoltar, tituloRef, aoResponder, aoAvancar, aoVoltar }: Props) {
  const espera = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(espera.current), []);

  const aoTocar = (novo: string) => {
    aoResponder(novo);
    window.clearTimeout(espera.current);
    espera.current = window.setTimeout(() => aoAvancar(novo), 200);
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (valor) aoAvancar(valor);
  };

  // O Radix não deixa o Enter marcar opção; aqui o Enter avança.
  const teclado = (evento: KeyboardEvent) => {
    if (evento.key === "Enter" && valor) {
      evento.preventDefault();
      aoAvancar(valor);
    }
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={enviar} noValidate>
      <div className="sa-diag__corpo">
        <DialogTitle ref={tituloRef} tabIndex={-1} className="titulo-2">
          {pergunta}
        </DialogTitle>
        <RadioGroup
          className="mt-6"
          value={valor ?? ""}
          onValueChange={aoResponder}
          onKeyDown={teclado}
          aria-label={pergunta}
          loop={false}
        >
          {opcoes.map((opcao) => (
            <OpcaoChip key={opcao.id} valor={opcao.id} rotulo={opcao.rotulo} aoTocar={aoTocar} />
          ))}
        </RadioGroup>
      </div>
      <div className="sa-diag__acoes">
        {podeVoltar ? (
          <Button variant="secundario" onClick={aoVoltar}>
            {diagnostico.voltar}
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" aria-disabled={valor ? undefined : true}>
          {diagnostico.continuar}
        </Button>
      </div>
    </form>
  );
}
