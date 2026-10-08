"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/** Trilha de 4 px. A barra cresce por transform, nunca por largura. */
function Progress({
  className,
  value,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const fracao = Math.min(Math.max((value ?? 0) / max, 0), 1);
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      className={cn("sa-diag__trilha", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="sa-diag__barra"
        style={{ transform: `scaleX(${fracao})` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
