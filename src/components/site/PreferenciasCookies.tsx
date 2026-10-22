"use client";

import { reabrirAvisoCookies } from "./AvisoCookies";

/** Reabre o aviso para a pessoa mudar a escolha; recusar apaga os identificadores. */
export function PreferenciasCookies({ rotulo, className }: { rotulo: string; className?: string }) {
  return (
    <button type="button" className={className} onClick={reabrirAvisoCookies}>
      {rotulo}
    </button>
  );
}
