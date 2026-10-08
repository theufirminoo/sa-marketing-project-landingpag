import { mostrarEtiquetaProvisorio } from "@/content/provisorios";
import { comum } from "@/content/site";
import { cn } from "@/lib/utils";

/** Etiqueta discreta, só em desenvolvimento, em todo item provisório visível. */
export function Provisorio({ className }: { className?: string }) {
  if (!mostrarEtiquetaProvisorio) return null;
  return <span className={cn("sa-provisorio rotulo", className)}>{comum.etiquetaProvisorio}</span>;
}
