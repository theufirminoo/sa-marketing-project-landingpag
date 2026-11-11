import type { Metadata } from "next";

import { BriefingFormulario } from "@/components/briefing/BriefingFormulario";
import { Logo } from "@/components/site/Logo";
import { briefing, rodape, site } from "@/content/site";

/** Página do briefing. Fica fora da busca: o link vai direto para quem já falou com a SA. */
export const metadata: Metadata = {
  title: briefing.metadados.titulo,
  description: briefing.metadados.descricao,
  alternates: { canonical: "/briefing" },
  robots: { index: false, follow: false },
};

export default function Briefing() {
  return (
    <div className="sa-briefing" data-theme="dark">
      <header className="sa-briefing__topo">
        <Logo nome={site.nome} href={site.url} />
      </header>
      <main id="conteudo" className="sa-briefing__palco">
        <BriefingFormulario />
      </main>
      <footer className="sa-briefing__rodape pequeno">{rodape.empresa}</footer>
    </div>
  );
}
