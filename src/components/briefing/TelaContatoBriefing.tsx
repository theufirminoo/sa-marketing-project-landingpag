"use client";

import { useRef, useState, type ChangeEvent, type FormEvent, type RefObject } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { briefing, comum, diagnostico } from "@/content/site";
import { contatoBriefingSchema, type ContatoBriefing } from "@/lib/briefing";
import { formatarEmpresa, formatarInstagram, formatarNome } from "@/lib/formatar";
import { mascararWhatsapp } from "@/lib/whatsapp";

const t = briefing.contato;
const campos = diagnostico.telas.contato.campos;

export type ContatoSalvo = Pick<ContatoBriefing, "nome" | "whatsapp" | "empresa" | "instagram">;

type Props = {
  inicial?: ContatoSalvo;
  tituloRef: RefObject<HTMLHeadingElement | null>;
  aoVoltar: () => void;
  /** Envia o briefing. Nunca rejeita: a falha do envio não bloqueia a pessoa. */
  aoEnviar: (contato: ContatoBriefing) => Promise<void>;
};

/**
 * Formata enquanto a pessoa digita sem o cursor pular: o texto formatado vai
 * direto para o campo, com o cursor no lugar, antes do React renderizar.
 * Como o valor do campo já é o novo, o React não o reescreve.
 */
function comFormato(formatar: (texto: string) => string, mudar: (valor: string) => void) {
  return (evento: ChangeEvent<HTMLInputElement>) => {
    const campo = evento.target;
    const antes = campo.value;
    const depois = formatar(antes);
    if (depois !== antes) {
      const posicao = campo.selectionStart ?? antes.length;
      const nova = Math.max(0, Math.min(depois.length, posicao + (depois.length - antes.length)));
      campo.value = depois;
      campo.setSelectionRange(nova, nova);
    }
    mudar(depois);
  };
}

/** Última tela antes do fim. Nome completo obrigatório; valida ao sair do campo e ao enviar. */
export function TelaContatoBriefing({ inicial, tituloRef, aoVoltar, aoEnviar }: Props) {
  const [enviando, setEnviando] = useState(false);
  // Ref, não estado: dois toques seguidos chegam antes da nova renderização.
  const travado = useRef(false);
  const form = useForm<ContatoBriefing>({
    resolver: zodResolver(contatoBriefingSchema),
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

  const enviar = (evento: FormEvent<HTMLFormElement>) =>
    form.handleSubmit(async (dados) => {
      if (travado.current) return;
      travado.current = true;
      setEnviando(true);
      await aoEnviar(dados);
    })(evento);

  return (
    <Form {...form}>
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={enviar} noValidate>
        <div className="sa-diag__corpo">
          <h1 ref={tituloRef} tabIndex={-1} className="titulo-2 sa-diag__titulo">
            {t.pergunta}
          </h1>
          <div className="mt-6 grid gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.nome.rotulo}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={comFormato(formatarNome, field.onChange)}
                      autoComplete="name"
                      autoCapitalize="words"
                      enterKeyHint="next"
                    />
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
                  <FormLabel>{campos.whatsapp.rotulo}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(mascararWhatsapp(e.target.value))}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder={campos.whatsapp.exemplo}
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
                  <FormLabel>{t.empresa.rotulo}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={comFormato(formatarEmpresa, field.onChange)}
                      autoComplete="organization"
                      autoCapitalize="words"
                      enterKeyHint="next"
                    />
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
                  <FormLabel>{t.instagram.rotulo}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={comFormato(formatarInstagram, field.onChange)}
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder={t.instagram.exemplo}
                      enterKeyHint="send"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sa-isca" aria-hidden="true">
              <label htmlFor="briefing-site">{campos.isca.rotulo}</label>
              <input id="briefing-site" type="text" tabIndex={-1} autoComplete="off" {...form.register("site")} />
            </div>
            <p className="pequeno text-text-muted">
              {t.lembrete}
              <a href="/privacidade" target="_blank" rel="noopener" className="sa-link">
                {briefing.abertura.aceite.link}
                <span className="sr-only"> {comum.novaAba}</span>
              </a>
              {briefing.abertura.aceite.depois}
            </p>
          </div>
        </div>
        <div className="sa-diag__acoes">
          <Button variant="secundario" onClick={aoVoltar} disabled={enviando}>
            {briefing.voltar}
          </Button>
          <Button type="submit" aria-disabled={enviando || undefined}>
            {enviando ? t.enviando : t.concluir}
          </Button>
        </div>
      </form>
    </Form>
  );
}
