"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("sa-diag-fundo", className)}
      {...props}
    />
  );
}

/**
 * Abaixo de 768 px ocupa a tela inteira; a partir daí é um diálogo de 560 px
 * centralizado. O foco fica preso dentro dele enquanto estiver aberto.
 */
function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn("sa-diag", className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/** Botão de fechar, 48 px, com o ícone de fechar e nome acessível. */
function DialogFechar({ rotulo, className, ...props }: React.ComponentProps<typeof DialogPrimitive.Close> & { rotulo: string }) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      aria-label={rotulo}
      className={cn("sa-btn-icone", className)}
      {...props}
    >
      <XIcon aria-hidden="true" size={20} strokeWidth={1.5} />
    </DialogPrimitive.Close>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("sa-diag__titulo", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("pequeno text-text-muted", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFechar,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
};
