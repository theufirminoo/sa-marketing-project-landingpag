import type { Metadata } from "next";

import Link from "next/link";

import { naoEncontrada } from "@/content/site";

export const metadata: Metadata = { title: naoEncontrada.titulo, robots: { index: false } };

/** 404 com a cara do site: responde com status 404 e leva de volta ao início. */
export default function NaoEncontrada() {
  return (
    <main id="conteudo" data-theme="dark" className="sa-grao sa-secao flex min-h-dvh items-center">
      <div className="sa-container sa-texto">
        <h1 className="titulo-1">{naoEncontrada.titulo}</h1>
        <p className="lead mt-6 text-text-muted">{naoEncontrada.texto}</p>
        <Link href="/" className="sa-btn mt-8">
          {naoEncontrada.voltar}
        </Link>
      </div>
    </main>
  );
}
