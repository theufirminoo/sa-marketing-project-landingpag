import { comum } from "@/content/site";

/** Primeiro elemento focável da página. */
export function PularConteudo() {
  return (
    <a href="#conteudo" className="sa-pular sa-btn">
      {comum.pularConteudo}
    </a>
  );
}
