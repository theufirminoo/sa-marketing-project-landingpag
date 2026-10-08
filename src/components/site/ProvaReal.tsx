import { cases, depoimentos, numeros } from "@/content/site";

/**
 * Seções prontas para quando houver dado real. Com as listas vazias, nada
 * é renderizado. Nunca preencha com exemplo.
 */
export function Cases() {
  if (cases.itens.length === 0) return null;
  return (
    <section data-theme="dark" aria-labelledby="cases-titulo" className="sa-grao sa-secao">
      <div className="sa-container">
        <h2 id="cases-titulo" className="titulo-1">
          {cases.titulo}
        </h2>
        <ul className="mt-12 grid list-none gap-6 p-0 md:grid-cols-2">
          {cases.itens.map((item) => (
            <li key={item.cliente} className="border-t border-border pt-6">
              <h3 className="titulo-3">{item.cliente}</h3>
              <p className="corpo mt-2 text-text-muted">{item.resumo}</p>
              <p className="pequeno mt-2 text-text-muted">{item.fonte}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Depoimentos() {
  if (depoimentos.itens.length === 0) return null;
  return (
    <section data-theme="dark" aria-labelledby="depoimentos-titulo" className="sa-grao sa-secao">
      <div className="sa-container">
        <h2 id="depoimentos-titulo" className="titulo-1">
          {depoimentos.titulo}
        </h2>
        <ul className="mt-12 grid list-none gap-6 p-0 md:grid-cols-2">
          {depoimentos.itens.map((item) => (
            <li key={item.nome} className="border-t border-border pt-6">
              <figure className="m-0">
                <blockquote className="lead m-0">{item.texto}</blockquote>
                <figcaption className="pequeno mt-4 text-text-muted">
                  {item.nome}, {item.empresa}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Numeros() {
  if (numeros.itens.length === 0) return null;
  return (
    <section data-theme="dark" aria-labelledby="numeros-titulo" className="sa-grao sa-secao">
      <div className="sa-container">
        <h2 id="numeros-titulo" className="titulo-1">
          {numeros.titulo}
        </h2>
        <dl className="mt-12 grid gap-6 md:grid-cols-3">
          {numeros.itens.map((item) => (
            <div key={item.descricao} className="border-t border-border pt-6">
              <dt className="corpo text-text-muted">{item.descricao}</dt>
              <dd className="titulo-1 sa-num m-0 mt-2">{item.valor}</dd>
              <dd className="pequeno m-0 mt-2 text-text-muted">{item.fonte}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
