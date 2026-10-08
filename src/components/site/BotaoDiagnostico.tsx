import type { ComponentProps } from "react";

import type { FrenteId, OrigemDiagnostico, Trava } from "@/content/opcoes";

type Props = Omit<ComponentProps<"button">, "type"> & {
  origem: OrigemDiagnostico;
  trava?: Trava;
  frente?: FrenteId;
  /** Link do WhatsApp que entra no lugar quando não há JavaScript. */
  hrefSemJs: string;
};

/**
 * Abre o diagnóstico. O clique é tratado por delegação no
 * DiagnosticoProvider, então o botão é HTML puro e pode vir do servidor.
 * Sem JavaScript, o botão some e um link para o WhatsApp entra no lugar.
 * Não importa conteúdo: também é usado dentro de componentes de cliente.
 */
export function BotaoDiagnostico({ origem, trava, frente, hrefSemJs, className, children, ...props }: Props) {
  return (
    <>
      <button
        type="button"
        className={className}
        data-diagnostico={origem}
        data-trava={trava}
        data-frente={frente}
        data-precisa-js=""
        aria-haspopup="dialog"
        {...props}
      >
        {children}
      </button>
      <noscript>
        <a className={className} href={hrefSemJs}>
          {children}
        </a>
      </noscript>
    </>
  );
}
