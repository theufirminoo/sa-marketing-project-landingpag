import { nomeDaFrente, travas, type FrenteId, type Trava } from "@/content/site";

/**
 * Frentes recomendadas pela resposta da tela 1. Se o diagnóstico foi aberto
 * por "Começar por esta frente", essa frente entra em primeiro lugar.
 */
export function recomendarFrentes(trava: Trava, frenteDeInteresse?: FrenteId): FrenteId[] {
  const base = travas.find((t) => t.id === trava)?.frentes ?? ["consultoria"];
  const lista = frenteDeInteresse ? [frenteDeInteresse, ...base] : [...base];
  return [...new Set(lista)];
}

/** "SA Consultoria", "SA Consultoria e SA Social", "SA Tech, SA Consultoria e SA Social". */
export function formatarFrentes(ids: readonly FrenteId[]): string {
  const nomes = ids.map(nomeDaFrente);
  if (nomes.length <= 1) return nomes[0] ?? "";
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}
