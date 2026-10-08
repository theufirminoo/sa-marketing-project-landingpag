/**
 * Funil animado em SVG, decorativo: pontos entram por cima e só uma parte
 * chega ao fim, como os clientes passando pelas cinco etapas. Só CSS.
 */
export function Funil({ etapas }: { etapas: readonly string[] }) {
  const altura = 44;
  const pontos = Array.from({ length: 14 }, (_, i) => i);
  return (
    <svg className="sa-funil" viewBox={`0 0 320 ${etapas.length * altura + 8}`} aria-hidden="true" focusable="false">
      {etapas.map((nome, i) => {
        const recuo = i * 24;
        const y = i * altura;
        return (
          <g key={nome} className="sa-funil__faixa" style={{ animationDelay: `${i * 0.9}s` }}>
            <path d={`M${recuo} ${y} H${320 - recuo} L${320 - recuo - 24} ${y + altura - 6} H${recuo + 24} Z`} />
            <text x="160" y={y + altura / 2 + 2}>
              {nome}
            </text>
          </g>
        );
      })}
      {pontos.map((i) => (
        <circle
          key={i}
          className="sa-funil__ponto"
          cx={60 + ((i * 47) % 200)}
          cy="-8"
          r="4"
          style={{ animationDelay: `${(i * 0.37).toFixed(2)}s`, ["--fim" as string]: `${120 + (i % 5) * 40}px` }}
        />
      ))}
    </svg>
  );
}
