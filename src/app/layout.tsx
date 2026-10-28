import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins } from "next/font/google";

import { AvisoCookies } from "@/components/site/AvisoCookies";
import { temProvisorios } from "@/content/provisorios";
import { avisoCookies, metadados, site } from "@/content/site";
import "./globals.css";

/** Primária: títulos. Montserrat variável (do guia de identidade da SA). */
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-titulo",
});

/** Secundária: textos, botões e rótulos. Mesma família da apresentação comercial. */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-poppins",
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
    <html lang="pt-BR" className={`${montserrat.variable} ${poppins.variable}`}>
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
