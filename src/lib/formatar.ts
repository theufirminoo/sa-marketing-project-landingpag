/**
 * Formatação enquanto a pessoa digita. Só muda letras para maiúscula ou
 * acrescenta o "@": o tamanho do texto muda no máximo 1 caractere, então o
 * cursor pode ser reposicionado sem pular.
 */

/** Palavras que ficam minúsculas no meio do nome: "Ana da Silva". */
const CONECTORES = new Set(["da", "das", "de", "di", "do", "dos", "du", "e"]);

/** Primeira letra de cada palavra em maiúscula; o resto fica como foi digitado. */
export function iniciaisMaiusculas(texto: string, { conectores = false } = {}): string {
  let palavra = 0;
  return texto.replace(/\S+/g, (trecho) => {
    const indice = palavra++;
    // "Da" vira "da" no meio do nome, mesmo digitado letra por letra.
    if (conectores && indice > 0 && CONECTORES.has(trecho.toLocaleLowerCase("pt-BR"))) return trecho.toLocaleLowerCase("pt-BR");
    return trecho.charAt(0).toLocaleUpperCase("pt-BR") + trecho.slice(1);
  });
}

/** Nome de pessoa: "matheus firmino da silva" vira "Matheus Firmino da Silva". */
export const formatarNome = (texto: string) => iniciaisMaiusculas(texto, { conectores: true });

/** Empresa: "sa marketing" vira "Sa Marketing"; siglas digitadas em maiúscula ficam ("SA Marketing"). */
export const formatarEmpresa = (texto: string) => iniciaisMaiusculas(texto);

/** Instagram: o "@" aparece sozinho no começo e não se repete. */
export function formatarInstagram(texto: string): string {
  const usuario = texto.replace(/@/g, "").replace(/\s/g, "");
  return usuario ? `@${usuario}` : "";
}

/** Pelo menos duas palavras com 2 letras ou mais: nome e sobrenome. */
export function temNomeCompleto(texto: string): boolean {
  return texto.trim().split(/\s+/).filter((p) => p.replace(/[^\p{L}]/gu, "").length >= 2).length >= 2;
}
