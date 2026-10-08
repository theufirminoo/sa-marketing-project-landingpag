import { logoSvg } from "@/content/provisorios";
import { ancoras, comum, rodape, site } from "@/content/site";
import { urlWhatsapp } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { Provisorio } from "./Provisorio";

/** O ano vem de next.config.ts, fixado no build. */
const ano = process.env.NEXT_PUBLIC_ANO_BUILD ?? "";

export function Footer() {
  return (
    <footer data-theme="dark" className="sa-grao sa-rodape bg-bg-sunken py-16 lg:py-24">
      <div className="sa-container pequeno grid grid-cols-2 gap-x-6 gap-y-8 text-text-muted md:grid-cols-12">
        <div className="col-span-2 flex items-center gap-2 md:col-span-4">
          <Logo nome={site.nome} href="/#inicio" />
          {logoSvg ? null : <Provisorio />}
        </div>
        <nav aria-label={comum.navRodape} className="md:col-span-4">
          <ul className="m-0 grid list-none gap-1 p-0">
            {ancoras.map((a) => (
              <li key={a.href}>
                <a href={`/${a.href}`} className="sa-link sa-link--suave inline-flex min-h-12 items-center">
                  {a.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="m-0 grid list-none content-start gap-1 p-0 md:col-span-4">
          <li>
            <a href={site.instagram.url} target="_blank" rel="noopener" className="sa-link sa-link--suave inline-flex min-h-12 items-center">
              {rodape.instagram}
              <span className="sr-only"> {comum.novaAba}</span>
            </a>
          </li>
          <li>
            <a
              href={urlWhatsapp(comum.mensagemWhatsappDireta)}
              target="_blank"
              rel="noopener"
              className="sa-link sa-link--suave inline-flex min-h-12 items-center gap-2"
              data-whatsapp-origem="rodape"
            >
              {rodape.whatsapp}
              <span className="sr-only"> {comum.novaAba}</span>
              <Provisorio />
            </a>
          </li>
          <li>
            <a href="/privacidade" className="sa-link sa-link--suave inline-flex min-h-12 items-center">
              {rodape.politica}
            </a>
          </li>
        </ul>
        <div className="col-span-2 grid gap-2 border-t border-border pt-8 md:col-span-12 md:grid-cols-[1fr_auto] md:items-baseline md:gap-6">
          <p>
            {rodape.empresa} <Provisorio />
            <br />
            {rodape.direitos(ano)}
          </p>
          <p>
            {rodape.desenvolvidoPor}{" "}
            <a href={site.desenvolvedor.url} target="_blank" rel="noopener" className="sa-link sa-link--suave">
              {site.desenvolvedor.nome}
              <span className="sr-only"> {comum.novaAba}</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
