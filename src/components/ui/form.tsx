"use client";

import * as React from "react";
import { CircleAlertIcon } from "lucide-react";
import type { Label as LabelPrimitive } from "radix-ui";
import { Slot } from "radix-ui";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

type FormItemContextValue = { id: string; temAjuda: boolean };

const FormItemContext = React.createContext<FormItemContextValue>({ id: "", temAjuda: false });

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  if (!fieldContext) {
    throw new Error("useFormField deve ser usado dentro de <FormField>");
  }
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  const { id, temAjuda } = itemContext;

  return {
    id,
    name: fieldContext.name,
    temAjuda,
    formItemId: `${id}-campo`,
    formDescriptionId: `${id}-ajuda`,
    formMessageId: `${id}-erro`,
    ...fieldState,
  };
};

function FormItem({
  className,
  temAjuda = false,
  ...props
}: React.ComponentProps<"div"> & { temAjuda?: boolean }) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id, temAjuda }}>
      <div data-slot="form-item" className={cn("sa-campo", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { formItemId } = useFormField();
  return <Label data-slot="form-label" className={className} htmlFor={formItemId} {...props} />;
}

/** Liga o erro ao campo por aria-describedby e marca aria-invalid. */
function FormControl(props: React.ComponentProps<typeof Slot.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId, temAjuda } = useFormField();
  const descritoPor = [temAjuda ? formDescriptionId : null, error ? formMessageId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={descritoPor || undefined}
      aria-invalid={error ? true : undefined}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("pequeno text-text-muted", className)}
      {...props}
    />
  );
}

/** Erro em texto, com o ícone de erro: o estado nunca depende só da cor. */
function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : props.children;

  if (!body) return null;

  return (
    <p data-slot="form-message" id={formMessageId} className={cn("pequeno sa-erro", className)} {...props}>
      <CircleAlertIcon aria-hidden="true" size={20} strokeWidth={1.5} />
      <span>{body}</span>
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
