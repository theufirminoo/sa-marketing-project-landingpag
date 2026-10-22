/**
 * Marca fictícia para os cases de exemplo: forma simples e iniciais do
 * nome. Só existe para posicionar o bloco; case real usa `logo`.
 */
const FORMAS = ["circulo", "quadrado", "hexagono"] as const;

function iniciais(nome: string) {
  const palavras = nome.split(" ").filter(Boolean);
  const uteis = palavras.length > 2 ? palavras.slice(1) : palavras;
  return uteis
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export function LogoExemplo({ nome }: { nome: string }) {
  const soma = [...nome].reduce((t, c) => t + c.charCodeAt(0), 0);
  const forma = FORMAS[soma % FORMAS.length];
  const forte = soma % 2 === 0;
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true" focusable="false">
      {forma === "circulo" ? <circle cx="36" cy="36" r="24" className={forte ? "fill-accent-forte" : "fill-marca-preto"} /> : null}
      {forma === "quadrado" ? <rect x="14" y="14" width="44" height="44" rx="10" className={forte ? "fill-accent-forte" : "fill-marca-preto"} /> : null}
      {forma === "hexagono" ? <path d="M36 11l22 12.5v25L36 61 14 48.5v-25z" className={forte ? "fill-accent-forte" : "fill-marca-preto"} /> : null}
      <text
        x="36"
        y="41"
        textAnchor="middle"
        className="fill-marca-giz"
        style={{ font: "700 16px var(--font-sans)", letterSpacing: "0.5px" }}
      >
        {iniciais(nome)}
      </text>
    </svg>
  );
}
