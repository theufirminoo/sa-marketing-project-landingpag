import { casesExemplo, depoimentosExemplo, numerosExemplo } from "@/content/provas-exemplo";
import { provasExemplo } from "@/content/provisorios";
import { provaSocial } from "@/content/site";

/**
 * Bloco independente de prova social: números, depoimentos e cases.
 * Usa a prova real de `provaSocial` quando existir. Sem prova real, mostra
 * os exemplos (marcados como "Exemplo") se `provasExemplo` estiver ligado;
 * desligado, a seção não aparece (standby).
 */
function escolher<T>(reais: readonly T[], exemplos: readonly T[]) {
  if (reais.length > 0) return { itens: reais, exemplo: false };
  return provasExemplo ? { itens: exemplos, exemplo: true } : { itens: [] as readonly T[], exemplo: false };
}

function Etiqueta({ ativa }: { ativa: boolean }) {
  if (!ativa) return null;
  return <span className="sa-etiqueta-exemplo pequeno">{provaSocial.etiquetaExemplo}</span>;
}

const iniciais = (nome: string) =>
  nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

export function ProvaSocial() {
  const numeros = escolher(provaSocial.numeros, numerosExemplo);
  const depoimentos = escolher(provaSocial.depoimentos, depoimentosExemplo);
  const cases = escolher(provaSocial.cases, casesExemplo);
  if (numeros.itens.length + depoimentos.itens.length + cases.itens.length === 0) return null;

  return (
    <section id="prova" data-theme="dark" aria-labelledby="prova-titulo" className="sa-grao sa-secao">
      <div className="sa-container">
        <div className="sa-texto sa-revela">
          <h2 id="prova-titulo" className="titulo-1">
            {provaSocial.titulo}
          </h2>
          <p className="lead mt-6 text-text-muted">{provaSocial.abertura}</p>
        </div>

        {numeros.itens.length > 0 ? (
          <dl className="sa-prova-numeros sa-revela" aria-label={provaSocial.rotuloNumeros}>
            {numeros.itens.map((n) => (
              <div key={n.descricao}>
                <dt className="corpo mt-2">{n.descricao}</dt>
                <dd className="display sa-num m-0">{n.valor}</dd>
                <dd className="pequeno m-0 mt-1 text-text-muted">
                  {n.fonte} <Etiqueta ativa={numeros.exemplo} />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {depoimentos.itens.length > 0 ? (
          <ul className="sa-prova-depoimentos" aria-label={provaSocial.rotuloDepoimentos}>
            {depoimentos.itens.map((d) => (
              <li key={d.nome} className="sa-vidro sa-revela">
                <figure className="m-0">
                  <blockquote className="corpo m-0">{d.texto}</blockquote>
                  <figcaption className="sa-prova-autor">
                    <span className="sa-prova-avatar" aria-hidden="true">
                      {iniciais(d.nome)}
                    </span>
                    <span>
                      <span className="titulo-3 block">{d.nome}</span>
                      <span className="pequeno text-text-muted">
                        {d.empresa} <Etiqueta ativa={depoimentos.exemplo} />
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : null}

        {cases.itens.length > 0 ? (
          <ul className="sa-prova-cases" aria-label={provaSocial.rotuloCases}>
            {cases.itens.map((c) => (
              <li key={c.cliente} className="sa-revela">
                <p className="rotulo text-accent-text">{c.segmento}</p>
                <h3 className="titulo-2 mt-2">
                  {c.cliente} <Etiqueta ativa={cases.exemplo} />
                </h3>
                <dl className="sa-prova-antes-depois">
                  <div>
                    <dt className="pequeno text-text-muted">{provaSocial.antes}</dt>
                    <dd className="corpo m-0 mt-1">{c.antes}</dd>
                  </div>
                  <div>
                    <dt className="pequeno text-accent-text">{provaSocial.depois}</dt>
                    <dd className="corpo m-0 mt-1">{c.depois}</dd>
                  </div>
                </dl>
                <p className="pequeno mt-4 text-text-muted">{c.fonte}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
