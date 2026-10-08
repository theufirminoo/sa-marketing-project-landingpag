"use client";

import { useState, type RefObject } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { comum, diagnostico } from "@/content/site";
import { contatoSchema, type Contato } from "@/lib/lead";
import { mascararWhatsapp } from "@/lib/whatsapp";
import type { ContatoSalvo } from "./estado";

const tela = diagnostico.telas.contato;

type Props = {
  inicial?: ContatoSalvo;
  tituloRef: RefObject<HTMLHeadingElement | null>;
  aoVoltar: () => void;
  /** Envia o lead. Nunca rejeita: a falha do envio não bloqueia a pessoa. */
  aoEnviar: (contato: Contato) => Promise<void>;
};

/** Tela 4. Valida ao sair do campo e ao enviar, nunca a cada tecla. */
export function TelaContato({ inicial, tituloRef, aoVoltar, aoEnviar }: Props) {
  const [enviando, setEnviando] = useState(false);
  const form = useForm<Contato>({
    resolver: zodResolver(contatoSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: true,
    defaultValues: {
      nome: inicial?.nome ?? "",
      whatsapp: inicial?.whatsapp ?? "",
      empresa: inicial?.empresa ?? "",
      instagram: inicial?.instagram ?? "",
      site: "",
    },
  });

  const enviar = form.handleSubmit(async (dados) => {
    if (enviando) return;
    setEnviando(true);
    await aoEnviar(dados);
  });

  return (
    <Form {...form}>
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={enviar} noValidate>
        <div className="sa-diag__corpo">
          <DialogTitle ref={tituloRef} tabIndex={-1} className="titulo-2">
            {tela.pergunta}
          </DialogTitle>
          <div className="mt-6 grid gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tela.campos.nome.rotulo}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="given-name" autoCapitalize="words" enterKeyHint="next" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tela.campos.whatsapp.rotulo}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(mascararWhatsapp(e.target.value))}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder={tela.campos.whatsapp.exemplo}
                      enterKeyHint="next"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="empresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tela.campos.empresa.rotulo}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="organization" enterKeyHint="next" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tela.campos.instagram.rotulo}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder={tela.campos.instagram.exemplo}
                      enterKeyHint="send"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Campo isca: fora da tela e da ordem de foco. */}
            <div className="sa-isca" aria-hidden="true">
              <label htmlFor="diagnostico-site">{tela.campos.isca.rotulo}</label>
              <input id="diagnostico-site" type="text" tabIndex={-1} autoComplete="off" {...form.register("site")} />
            </div>
            <p className="pequeno text-text-muted">
              {tela.consentimento.antes}
              <a href="/privacidade" target="_blank" rel="noopener" className="sa-link">
                {tela.consentimento.link}
                <span className="sr-only"> {comum.novaAba}</span>
              </a>
              {tela.consentimento.depois}
            </p>
          </div>
        </div>
        <div className="sa-diag__acoes">
          <Button variant="secundario" onClick={aoVoltar} disabled={enviando}>
            {diagnostico.voltar}
          </Button>
          <Button type="submit" aria-disabled={enviando || undefined}>
            {enviando ? tela.enviando : tela.enviar}
          </Button>
        </div>
      </form>
    </Form>
  );
}
