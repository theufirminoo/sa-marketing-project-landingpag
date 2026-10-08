import { metodo } from "@/content/site";

/** Faixa que corre com as cinco etapas. Decorativa: o conteúdo está no Método. */
export function FaixaEtapas() {
  const itens = [...metodo.etapas, ...metodo.etapas, ...metodo.etapas, ...metodo.etapas];
  return (
    <div className="sa-faixa-etapas" aria-hidden="true">
      <div className="sa-faixa-etapas__trilho">
        {[0, 1].map((copia) => (
          <ul key={copia}>
            {itens.map((etapa, i) => (
              <li key={`${etapa.id}-${i}`} className="titulo-2">
                {etapa.nome}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
