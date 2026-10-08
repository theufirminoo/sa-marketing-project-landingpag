import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Retângulo de canto 4 px é ação. As classes vêm do design system
 * (globals.css); o visual padrão do shadcn não entra aqui.
 */
const buttonVariants = cva("", {
  variants: {
    variant: {
      principal: "sa-btn",
      secundario: "sa-btn sa-btn--secundario",
      preto: "sa-btn sa-btn--preto",
      link: "sa-link",
    },
    largura: {
      auto: "",
      bloco: "sa-btn--bloco",
    },
  },
  defaultVariants: {
    variant: "principal",
    largura: "auto",
  },
});

function Button({
  className,
  variant,
  largura,
  asChild = false,
  type,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, largura }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
