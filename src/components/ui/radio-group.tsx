"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("sa-chips sa-chips--coluna", className)}
      {...props}
    />
  );
}

/** Opção em pílula. Selecionada, ganha fundo âmbar e o visto. */
function RadioGroupItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn("sa-chip", className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="sa-chip__visto">
        <CheckIcon aria-hidden="true" size={20} strokeWidth={1.5} />
      </RadioGroupPrimitive.Indicator>
      <span>{children}</span>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
