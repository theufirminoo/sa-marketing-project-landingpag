/**
 * Lista os valores provisórios (src/content/provisorios.ts) e as pendências
 * (PENDENCIAS.md). Com --estrito, termina com erro se sobrar algum valor
 * provisório ou pendência que trava o lançamento.
 *
 *   pnpm check:pendencias
 *   pnpm check:pendencias --estrito
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { provisorios } from "../src/content/provisorios";

type Pendencia = { secao: string; texto: string; feita: boolean };

const SECAO_QUE_TRAVA = "Travam o lançamento";

function lerPendencias(): Pendencia[] {
  const arquivo = readFileSync(join(process.cwd(), "PENDENCIAS.md"), "utf8");
  const itens: Pendencia[] = [];
  let secao = "";
  for (const linha of arquivo.split("\n")) {
    const titulo = linha.match(/^##\s+(.+)$/);
    if (titulo) {
      secao = titulo[1].trim();
      continue;
    }
    const item = linha.match(/^- \[( |x|X)\]\s+(.+)$/);
    if (item && secao) itens.push({ secao, texto: item[2].trim(), feita: item[1] !== " " });
  }
  return itens;
}

const estrito = process.argv.includes("--estrito");
const ativos = provisorios.filter((p) => p.ativo);
const pendencias = lerPendencias();
const abertas = pendencias.filter((p) => !p.feita);
const travam = abertas.filter((p) => p.secao === SECAO_QUE_TRAVA);

console.log("\nValores provisórios (src/content/provisorios.ts)");
if (ativos.length === 0) console.log("  Nenhum. O noindex sai sozinho.");
for (const p of provisorios) {
  console.log(`  ${p.ativo ? "[ ]" : "[x]"} ${p.item}: ${p.valorAtual}  ->  ${p.trocaPor}`);
}

for (const secao of [...new Set(pendencias.map((p) => p.secao))]) {
  console.log(`\n${secao} (PENDENCIAS.md)`);
  for (const p of pendencias.filter((i) => i.secao === secao)) {
    console.log(`  ${p.feita ? "[x]" : "[ ]"} ${p.texto}`);
  }
}

console.log(
  `\nResumo: ${ativos.length} provisório(s), ${travam.length} pendência(s) que travam, ${abertas.length - travam.length} que não travam.`,
);

if (estrito && (ativos.length > 0 || travam.length > 0)) {
  console.error("\n--estrito: ainda há valor provisório ou pendência que trava o lançamento.");
  process.exit(1);
}
