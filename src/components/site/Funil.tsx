/** Funil do método em SVG, estático e decorativo. */
export function Funil({ etapas }: { etapas: readonly string[] }) {
  const altura = 44;
  return (
    <svg className="sa-funil" viewBox={`0 0 320 ${etapas.length * altura}`} aria-hidden="true" focusable="false">
      {etapas.map((nome, i) => {
        const recuo = i * 24;
        const y = i * altura;
        return (
          <g key={nome} className="sa-funil__faixa">
            <path d={`M${recuo} ${y} H${320 - recuo} L${320 - recuo - 24} ${y + altura - 6} H${recuo + 24} Z`} />
            <text x="160" y={y + altura / 2 + 2}>
              {nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
