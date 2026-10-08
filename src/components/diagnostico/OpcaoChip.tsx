"use client";

import type { MouseEvent } from "react";

import { RadioGroupItem } from "@/components/ui/radio-group";

type Props = {
  valor: string;
  rotulo: string;
  /** Chamado só no clique ou toque. Setas e Espaço não avançam. */
  aoTocar: (valor: string) => void;
};

/** Opção em pílula do diagnóstico, sobre o radio-group do shadcn. */
export function OpcaoChip({ valor, rotulo, aoTocar }: Props) {
  const aoClicar = (evento: MouseEvent<HTMLButtonElement>) => {
    // detail > 0: clique de ponteiro. O Radix dispara click com detail 0
    // quando a seleção muda pelas setas ou pela barra de espaço.
    if (evento.detail > 0) aoTocar(valor);
  };
  return (
    <RadioGroupItem value={valor} onClick={aoClicar}>
      {rotulo}
    </RadioGroupItem>
  );
}
