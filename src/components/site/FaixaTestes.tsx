import { temProvisorios } from "@/content/provisorios";
import { comum } from "@/content/site";

/** Some sozinha quando o último valor provisório for trocado. */
export function FaixaTestes() {
  if (!temProvisorios) return null;
  return (
    <div className="sa-faixa-testes pequeno" role="note">
      <p className="sa-container">{comum.faixaTestes}</p>
    </div>
  );
}
