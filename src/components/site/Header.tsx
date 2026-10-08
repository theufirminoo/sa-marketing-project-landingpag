"use client";

import { useSyncExternalStore } from "react";

import { BotaoDiagnostico } from "./BotaoDiagnostico";
import { Logo } from "./Logo";

function assinarRolagem(aoMudar: () => void) {
  window.addEventListener("scroll", aoMudar, { passive: true });
  return () => window.removeEventListener("scroll", aoMudar);
}

type Props = {
  marca: string;
  /** Sem âncoras e sem CTA: usado em /privacidade. */
  simples?: boolean;
  navegacao?: { rotulo: string; ancoras: readonly { href: string; rotulo: string }[] };
  cta?: { rotulo: string; hrefSemJs: string };
};

/**
 * Fixo, 64 px. Transparente sobre o hero; ganha fundo depois de 8 px de
 * rolagem. Os textos chegam por props para o site.ts não ir ao cliente.
 */
export function Header({ marca, simples = false, navegacao, cta }: Props) {
  const rolou = useSyncExternalStore(
    assinarRolagem,
    () => window.scrollY > 8,
    () => false,
  );

  return (
    <header className="sa-cabecalho" data-rolou={rolou || simples ? "true" : "false"}>
      <div className="sa-container grid h-full grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Logo nome={marca} href={simples ? "/" : "#inicio"} className="justify-self-start" />
        {navegacao ? (
          <nav aria-label={navegacao.rotulo} className="hidden lg:block">
            <ul className="m-0 flex list-none gap-8 p-0">
              {navegacao.ancoras.map((a) => (
                <li key={a.href}>
                  <a href={a.href} className="sa-link inline-flex min-h-12 items-center no-underline hover:underline">
                    {a.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        {cta && !simples ? (
          <div className="justify-self-end">
            {/* Abaixo de 360 px o rótulo quebra em duas linhas para não estourar a largura. */}
            <BotaoDiagnostico
              origem="cabecalho"
              hrefSemJs={cta.hrefSemJs}
              className="sa-btn px-4 whitespace-nowrap max-[359px]:py-1 max-[359px]:whitespace-normal md:px-6"
            >
              {cta.rotulo}
            </BotaoDiagnostico>
          </div>
        ) : null}
      </div>
    </header>
  );
}
