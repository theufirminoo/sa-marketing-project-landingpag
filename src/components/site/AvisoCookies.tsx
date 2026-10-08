"use client";

import Script from "next/script";
import { useState, useSyncExternalStore } from "react";

type Escolha = "aceito" | "recusado";
const CHAVE = "sa:consentimento";
const EVENTO = "sa:consentimento";

function lerEscolha(): Escolha | null {
  try {
    const valor = window.localStorage.getItem(CHAVE);
    return valor === "aceito" || valor === "recusado" ? valor : null;
  } catch {
    return null;
  }
}

function assinar(aoMudar: () => void) {
  window.addEventListener(EVENTO, aoMudar);
  window.addEventListener("storage", aoMudar);
  return () => {
    window.removeEventListener(EVENTO, aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}

/** O aviso só aparece depois da primeira rolagem: assim ele não cobre a pergunta do hero. */
function assinarRolagem(aoMudar: () => void) {
  window.addEventListener("scroll", aoMudar, { passive: true });
  return () => window.removeEventListener("scroll", aoMudar);
}
const rolou = () => window.scrollY > 8;

function escolher(valor: Escolha) {
  try {
    window.localStorage.setItem(CHAVE, valor);
  } catch {
    // Sem localStorage, a escolha vale só até recarregar.
  }
  window.dispatchEvent(new Event(EVENTO));
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Aviso discreto, com "Aceitar" e "Recusar" de mesmo peso. O GTM só carrega
 * depois do "Aceitar" e só se NEXT_PUBLIC_GTM_ID existir. Nada é medido
 * antes da escolha, então o aviso pode esperar a primeira rolagem.
 */
type Textos = { rotulo: string; texto: string; aceitar: string; recusar: string; politica: string };

export function AvisoCookies({ textos: avisoCookies }: { textos: Textos }) {
  const escolha = useSyncExternalStore<Escolha | null | "servidor">(
    assinar,
    lerEscolha,
    () => "servidor",
  );
  // Guarda a escolha na memória quando o localStorage está bloqueado.
  const [escolhaLocal, setEscolhaLocal] = useState<Escolha | null>(null);
  const final = escolhaLocal ?? escolha;
  const jaRolou = useSyncExternalStore(assinarRolagem, rolou, () => false);
  // Depois de aparecer, o aviso fica até a escolha, mesmo se a pessoa voltar ao topo.
  const [visto, setVisto] = useState(false);
  if (jaRolou && !visto) setVisto(true);

  return (
    <>
      {final === null && visto ? (
        <section className="sa-aviso-cookies" aria-label={avisoCookies.rotulo}>
          <p className="pequeno">
            {avisoCookies.texto}{" "}
            <a href="/privacidade" className="sa-link">
              {avisoCookies.politica}
            </a>
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="sa-btn sa-btn--secundario"
              onClick={() => {
                setEscolhaLocal("aceito");
                escolher("aceito");
              }}
            >
              {avisoCookies.aceitar}
            </button>
            <button
              type="button"
              className="sa-btn sa-btn--secundario"
              onClick={() => {
                setEscolhaLocal("recusado");
                escolher("recusado");
              }}
            >
              {avisoCookies.recusar}
            </button>
          </div>
        </section>
      ) : null}
      {final === "aceito" && GTM_ID ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(GTM_ID)});`}
        </Script>
      ) : null}
    </>
  );
}

