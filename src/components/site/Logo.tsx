import Image from "next/image";
import { logoCompleta, logoSvg } from "@/content/provisorios";
import { cn } from "@/lib/utils";

/**
 * Até o SVG chegar, a marca aparece como texto, peso 600. Quando `logoSvg`
 * apontar para public/logo-sa.svg, o componente troca sozinho.
 */
type Props = { nome: string; href?: string; className?: string; completa?: boolean };

export function Logo({ nome, href = "/", className, completa = false }: Props) {
  return (
    <a href={href} className={cn("inline-flex min-h-12 items-center text-text no-underline", className)}>
      {logoSvg && completa ? (
        <Image src={logoCompleta} alt={nome} width={220} height={96} className="h-auto w-[220px]" />
      ) : logoSvg ? (
        <Image src={logoSvg} alt={nome} width={240} height={103} className="h-8 w-auto" priority />
      ) : (
        <span className="titulo-3 whitespace-nowrap" translate="no">
          {nome}
        </span>
      )}
    </a>
  );
}
