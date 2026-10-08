import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";

import { AvisoCookies } from "@/components/site/AvisoCookies";
import { temProvisorios } from "@/content/provisorios";
import { avisoCookies, metadados, site } from "@/content/site";
import "./globals.css";

/** Uma família só, variável em peso, largura e tamanho óptico. */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: metadados.titulo,
  description: metadados.descricao,
  applicationName: site.nome,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: site.nome,
    title: metadados.titulo,
    description: metadados.descricao,
  },
  twitter: {
    card: "summary_large_image",
    title: metadados.titulo,
    description: metadados.descricao,
  },
  // Enquanto houver dado provisório, a página não é indexada.
  robots: temProvisorios ? { index: false, follow: false } : { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // Literal exigido pela meta tag: é o --marca-preto.
  themeColor: "#1A1A1A",
  colorScheme: "dark",
};

/** Sem JavaScript: some o que depende dele e o conteúdo dos acordeões aparece. */
const estiloSemJs =
  '[data-precisa-js]{display:none!important}[data-slot="accordion-content"]{display:block!important}';

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={bricolage.variable}>
      <head>
        <noscript>
          <style>{estiloSemJs}</style>
        </noscript>
      </head>
      <body>
        {children}
        <AvisoCookies textos={avisoCookies} />
      </body>
    </html>
  );
}
