import { duvidas, metadados, site } from "@/content/site";

/** Organization e FAQPage, só com as perguntas que aparecem na página. */
export function JsonLd() {
  const dados = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.nome,
      url: site.url,
      description: metadados.descricao,
      sameAs: [site.instagram.url],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: duvidas.itens.map((item) => ({
        "@type": "Question",
        name: item.pergunta,
        acceptedAnswer: { "@type": "Answer", text: item.resposta },
      })),
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\\u003c") }}
    />
  );
}
