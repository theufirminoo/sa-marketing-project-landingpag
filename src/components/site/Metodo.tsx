import { metodo, nomeDaFrente } from "@/content/site";
import { Funil } from "./Funil";
import { MetodoMarcador } from "./MetodoMarcador";

/** A ordem é informação: o número de cada etapa vem do contador da lista. */
export function Metodo() {
  return (
    <section id="metodo" data-theme="light" aria-labelledby="metodo-titulo" className="sa-secao">
      <div className="sa-container lg:grid lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--space-8))]">
            <h2 id="metodo-titulo" className="titulo-1">
              {metodo.titulo}
            </h2>
            <p className="lead mt-6 text-text-muted">{metodo.abertura}</p>
            <Funil etapas={metodo.etapas.map((e) => e.nome)} />
          </div>
        </div>
        <ol className="sa-etapas mt-12 lg:col-span-6 lg:col-start-7 lg:mt-0" data-metodo="">
          {metodo.etapas.map((etapa) => (
            <li key={etapa.id} className="sa-etapa sa-revela" data-etapa={etapa.id}>
              <h3 className="titulo-2">{etapa.nome}</h3>
              <div>
                <p className="corpo">{etapa.acontece}</p>
                <p className="pequeno sa-etapa__falha">
                  {metodo.rotuloFalha} {etapa.falha}
                </p>
                <ul className="sa-etiquetas" aria-label={metodo.rotuloFrentes}>
                  {etapa.frentes.map((frente) => (
                    <li key={frente} className="sa-etiqueta rotulo">
                      {nomeDaFrente(frente)}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <MetodoMarcador />
    </section>
  );
}
