import { DiagnosticoProvider } from "@/components/diagnostico/DiagnosticoProvider";
import { BarraFixa } from "@/components/site/BarraFixa";
import { ComoComeca } from "@/components/site/ComoComeca";
import { CtaFinal } from "@/components/site/CtaFinal";
import { Duvidas } from "@/components/site/Duvidas";
import { FaixaEtapas } from "@/components/site/FaixaEtapas";
import { Footer } from "@/components/site/Footer";
import { Frentes } from "@/components/site/Frentes";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { JsonLd } from "@/components/site/JsonLd";
import { Metodo } from "@/components/site/Metodo";
import { Cases, Depoimentos, Numeros } from "@/components/site/ProvaReal";
import { Publica } from "@/components/site/Publica";
import { PularConteudo } from "@/components/site/PularConteudo";
import { QuemFaz } from "@/components/site/QuemFaz";
import { WhatsappFlutuante } from "@/components/site/WhatsappFlutuante";
import { ancoras, comum, site } from "@/content/site";
import { urlWhatsapp } from "@/lib/whatsapp";

const ctaSemJs = urlWhatsapp(comum.mensagemWhatsappDireta);

export default function Home() {
  return (
    <>
      <PularConteudo />
      <Header
        marca={site.nome}
        navegacao={{ rotulo: comum.navPrincipal, ancoras }}
        cta={{ rotulo: comum.ctaDiagnostico, hrefSemJs: ctaSemJs }}
      />
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <FaixaEtapas />
        <Metodo />
        <Frentes />
        <ComoComeca />
        <QuemFaz />
        <Publica />
        <Cases />
        <Depoimentos />
        <Numeros />
        <Duvidas />
        <CtaFinal />
      </main>
      <Footer />
      <WhatsappFlutuante />
      <BarraFixa rotulo={comum.ctaDiagnostico} hrefSemJs={ctaSemJs} />
      <DiagnosticoProvider />
      <JsonLd />
    </>
  );
}
