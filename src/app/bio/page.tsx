import type { Metadata } from "next";
import { ArrowRightIcon } from "lucide-react";

import { IconeWhatsapp } from "@/components/diagnostico/TelaResultado";
import { Logo } from "@/components/site/Logo";
import { bio, rodape, site } from "@/content/site";
import { urlBotao } from "@/lib/ir";
import { cn } from "@/lib/utils";

/**
 * Página da bio do Instagram (bio.saagencia.com.br). Só HTML do servidor,
 * sem JavaScript próprio: abre na hora no navegador do Instagram. Cada botão
 * passa por /ir/<destino>, que conta o clique e redireciona.
 */
export const metadata: Metadata = {
  title: bio.metadados.titulo,
  description: bio.metadados.descricao,
  alternates: { canonical: "/bio" },
  robots: { index: false, follow: true },
};

export default function Bio() {
  return (
    <div className="sa-briefing sa-bio" data-theme="dark">
      <main id="conteudo" className="sa-bio__palco">
        <header className="sa-bio__topo">
          <Logo nome={site.nome} href={site.url} />
          <h1 className="titulo-3 mt-4">{bio.nome}</h1>
          <p className="corpo mt-2 text-text-muted">{bio.frase}</p>
        </header>
        <nav aria-label={bio.rotuloLinks}>
          <ul className="sa-bio__lista">
            {bio.botoes.map((botao, indice) => (
              <li key={botao.destino}>
                <a
                  href={urlBotao(botao.destino)}
                  className={cn("sa-btn sa-btn--bloco sa-bio__botao", indice > 0 && "sa-btn--secundario")}
                  {...(botao.destino === "whatsapp" ? { target: "_blank", rel: "noopener" } : {})}
                >
                  {botao.destino === "whatsapp" ? <IconeWhatsapp /> : null}
                  <span className="sa-bio__texto">
                    <span>{botao.rotulo}</span>
                    <span className="sa-bio__detalhe">{botao.detalhe}</span>
                  </span>
                  <ArrowRightIcon aria-hidden="true" size={20} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <footer className="sa-briefing__rodape pequeno">{rodape.empresa}</footer>
    </div>
  );
}
