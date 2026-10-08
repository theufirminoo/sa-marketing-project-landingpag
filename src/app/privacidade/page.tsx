import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Provisorio } from "@/components/site/Provisorio";
import { PularConteudo } from "@/components/site/PularConteudo";
import { politicaProvisoria } from "@/content/provisorios";
import { privacidade, site } from "@/content/site";

export const metadata: Metadata = {
  title: `${privacidade.titulo.replace(/\.$/, "")} | ${site.nome}`,
  alternates: { canonical: "/privacidade" },
};

export default function Privacidade() {
  return (
    <>
      <PularConteudo />
      <Header marca={site.nome} simples />
      <main id="conteudo" tabIndex={-1} data-theme="light" className="sa-secao pt-[calc(var(--header-h)+var(--space-16))]">
        <article className="sa-container">
          <div className="sa-texto">
            <h1 className="titulo-1">{privacidade.titulo}</h1>
            {politicaProvisoria ? (
              <p className="corpo mt-6 rounded-sm bg-accent-tint p-4">
                {privacidade.aviso} <Provisorio />
              </p>
            ) : null}
            {privacidade.secoes.map((secao) => (
              <section key={secao.titulo} className="mt-12">
                <h2 className="titulo-3">{secao.titulo}</h2>
                {secao.paragrafos.map((paragrafo) => (
                  <p key={paragrafo} className="corpo mt-4">
                    {paragrafo}
                  </p>
                ))}
              </section>
            ))}
            <p className="mt-12">
              <Link href="/" className="sa-link corpo">
                {privacidade.voltar}
              </Link>
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
