import Image from "next/image";
import { logoSvg } from "@/content/provisorios";
import { cn } from "@/lib/utils";

/**
 * Até o SVG chegar, a marca aparece como texto, peso 600. Quando `logoSvg`
 * apontar para public/logo-sa.svg, o componente troca sozinho.
 */
export function Logo({ nome, href = "/", className }: { nome: string; href?: string; className?: string }) {
  return (
    <a href={href} className={cn("inline-flex min-h-12 items-center text-text no-underline", className)}>
      {logoSvg ? (
        <Image src={logoSvg} alt={nome} width={40} height={40} />
      ) : (
        <span className="titulo-3 whitespace-nowrap" translate="no">
          {nome}
        </span>
      )}
    </a>
  );
}
