"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckIcon } from "lucide-react";

import { OpcaoChip } from "@/components/diagnostico/OpcaoChip";
import { IconeWhatsapp } from "@/components/diagnostico/TelaResultado";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup } from "@/components/ui/radio-group";
import { briefing, briefingOpcoes, comum, diagnostico } from "@/content/site";
import {
  montarMensagemBriefing,
  objetivoSchema,
  PERGUNTAS_BRIEFING,
  respostasBriefingSchema,
  type RespostasBriefing,
} from "@/lib/briefing";
import { contatoSchema, type Contato } from "@/lib/lead";
import { lerOrigem } from "@/lib/utm";
import { mascararWhatsapp, urlWhatsapp } from "@/lib/whatsapp";

/**
 * Briefing antes da reunião. Página própria (briefing.saagencia.com.br), no
 * visual do diagnóstico: abertura, 7 perguntas de um toque, objetivo
 * opcional e contato. Este componente só existe nesta rota, por isso pode
 * importar site.ts sem pesar na página principal.
 */

const TOTAL_PERGUNTAS = PERGUNTAS_BRIEFING.length;
/** Telas: 0 abertura, 1 a 7 perguntas, 8 objetivo, 9 contato, 10 fim. */
const TELA_OBJETIVO = TOTAL_PERGUNTAS + 1;
const TELA_CONTATO = TOTAL_PERGUNTAS + 2;
const TELA_FIM = TOTAL_PERGUNTAS + 3;
const TOTAL_ETAPAS = TOTAL_PERGUNTAS + 2;

const CHAVE = "sa:briefing";

type Estado = {
  tela: number;
  respostas: Partial<RespostasBriefing>;
  objetivo: string;
  contato?: Pick<Contato, "nome" | "whatsapp" | "empresa" | "instagram">;
  salvo?: boolean;
};

const contatoSalvoSchema = contatoSchema.pick({ nome: true, whatsapp: true, empresa: true, instagram: true });

const INICIAL: Estado = { tela: 0, respostas: {}, objetivo: "" };

function lerEstado(): Estado {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE);
    if (!bruto) return INICIAL;
    const salvo = JSON.parse(bruto) as Partial<Estado>;
    const respostas = respostasBriefingSchema.partial().safeParse(salvo.respostas ?? {});
    const objetivo = objetivoSchema.safeParse(salvo.objetivo ?? "");
    const estado: Estado = {
      tela: Number.isInteger(salvo.tela) ? Math.min(Math.max(Number(salvo.tela), 0), TELA_FIM) : 0,
      respostas: respostas.success ? respostas.data : {},
      objetivo: objetivo.success ? objetivo.data : "",
      contato: contatoSalvoSchema.safeParse(salvo.contato).data,
      salvo: salvo.salvo === true,
    };
    return coerente(estado);
  } catch {
    return INICIAL;
  }
}

/** Nunca deixa a pessoa numa tela sem as respostas anteriores. */
function coerente(estado: Estado): Estado {
  const faltando = PERGUNTAS_BRIEFING.findIndex((chave) => !estado.respostas[chave]);
  if (faltando >= 0 && estado.tela > faltando + 1) return { ...estado, tela: faltando + 1 };
  if (estado.tela === TELA_FIM && !estado.contato) return { ...estado, tela: TELA_CONTATO };
  return estado;
}

async function enviarBriefing(corpo: Record<string, unknown>): Promise<boolean> {
  try {
    const resposta = await fetch("/api/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(10_000) : undefined,
    });
    if (!resposta.ok) return false;
    const dados = (await resposta.json()) as { salvo?: boolean };
    return dados.salvo === true;
  } catch {
    return false;
  }
}

export function BriefingFormulario() {
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [carregado, setCarregado] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const primeiraTela = useRef(true);

  // Retoma de onde parou. Só depois da hidratação: o servidor não conhece o
  // sessionStorage, e ler antes faria o HTML do servidor divergir do cliente.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única de armazenamento do navegador
    setEstado(lerEstado());
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      window.sessionStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      // Sem sessionStorage, o briefing funciona, só não retoma.
    }
  }, [estado, carregado]);

  // Foco no título de cada tela nova, menos na primeira carga.
  useEffect(() => {
    if (!carregado) return;
    if (primeiraTela.current) {
      primeiraTela.current = false;
      return;
    }
    tituloRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [estado.tela, carregado]);

  const irPara = (tela: number) => setEstado((e) => coerente({ ...e, tela }));
  const voltar = () => irPara(Math.max(estado.tela - 1, 0));

  const responder = (chave: keyof RespostasBriefing, valor: string) =>
    setEstado((e) => ({ ...e, respostas: { ...e.respostas, [chave]: valor } }));

  const concluir = async (contato: Contato) => {
    const respostas = respostasBriefingSchema.safeParse(estado.respostas);
    if (!respostas.success) {
      irPara(1);
      return;
    }
    const origem = lerOrigem();
    const salvo = await enviarBriefing({
      ...contato,
      ...respostas.data,
      objetivo: estado.objetivo,
      utm: origem.utm,
      pagina: origem.pagina,
      referrer: origem.referrer,
    });
    const { nome, whatsapp, empresa, instagram } = contato;
    setEstado((e) => ({ ...e, contato: { nome, whatsapp, empresa, instagram }, salvo, tela: TELA_FIM }));
  };

  const { tela } = estado;
  const etapa = Math.min(tela, TOTAL_ETAPAS);
  const anuncio =
    tela === 0
      ? briefing.abertura.rotulo
      : tela === TELA_FIM
        ? briefing.concluido.anuncio
        : briefing.contador(etapa, TOTAL_ETAPAS);

  const conteudo = () => {
    if (tela === 0) {
      return (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="sa-diag__corpo">
            <p className="sa-resultado__rotulo rotulo mt-0">{briefing.abertura.rotulo}</p>
            <h1 ref={tituloRef} tabIndex={-1} className="titulo-2 sa-diag__titulo mt-3">
              {briefing.abertura.titulo}
            </h1>
            <p className="corpo mt-4 text-text-muted">{briefing.abertura.texto}</p>
          </div>
          <div className="sa-diag__acoes">
            <span />
            <Button onClick={() => irPara(1)}>{briefing.abertura.comecar}</Button>
          </div>
        </div>
      );
    }
    if (tela >= 1 && tela <= TOTAL_PERGUNTAS) {
      const chave = PERGUNTAS_BRIEFING[tela - 1];
      const pergunta = briefing.perguntas[chave];
      return (
        <TelaPergunta
          key={chave}
          pergunta={pergunta.pergunta}
          ajuda={"ajuda" in pergunta ? pergunta.ajuda : undefined}
          opcoes={briefingOpcoes[chave]}
          valor={estado.respostas[chave]}
          tituloRef={tituloRef}
          aoResponder={(valor) => responder(chave, valor)}
          aoAvancar={(valor) => {
            responder(chave, valor);
            irPara(tela + 1);
          }}
          aoVoltar={voltar}
        />
      );
    }
    if (tela === TELA_OBJETIVO) {
      return (
        <TelaObjetivo
          inicial={estado.objetivo}
          tituloRef={tituloRef}
          aoVoltar={voltar}
          aoAvancar={(objetivo) => {
            setEstado((e) => ({ ...e, objetivo }));
            irPara(TELA_CONTATO);
          }}
        />
      );
    }
    if (tela === TELA_CONTATO) {
      return <TelaContatoBriefing inicial={estado.contato} tituloRef={tituloRef} aoVoltar={voltar} aoEnviar={concluir} />;
    }
    if (!estado.contato) return null;
    const respostas = respostasBriefingSchema.safeParse(estado.respostas);
    const primeiroNome = estado.contato.nome.trim().split(/\s+/)[0];
    const textos = estado.salvo ? briefing.concluido : briefing.falhou;
    const mensagem = respostas.success
      ? montarMensagemBriefing({
          nome: estado.contato.nome,
          empresa: estado.contato.empresa,
          respostas: respostas.data,
          objetivo: estado.objetivo,
        })
      : comum.mensagemWhatsappDireta;
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="sa-diag__corpo">
          {estado.salvo ? (
            <span className="sa-resultado__selo" aria-hidden="true">
              <CheckIcon size={22} strokeWidth={2.5} />
            </span>
          ) : null}
          <p className="sa-resultado__rotulo rotulo">{textos.rotulo}</p>
          <h1 ref={tituloRef} tabIndex={-1} className="titulo-2 sa-diag__titulo mt-2">
            {textos.titulo(primeiroNome)}
          </h1>
          <p className="corpo mt-4 text-text-muted">{textos.texto}</p>
        </div>
        <div className="sa-diag__acoes">
          <span />
          <Button asChild variant={estado.salvo ? "secundario" : undefined}>
            <a
              href={urlWhatsapp(estado.salvo ? comum.mensagemWhatsappDireta : mensagem)}
              target="_blank"
              rel="noopener"
            >
              <IconeWhatsapp />
              {textos.whatsapp}
              <span className="sr-only"> {comum.novaAba}</span>
            </a>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="sa-briefing__cartao">
      <div className="sa-diag__topo">
        <Progress
          value={etapa}
          max={TOTAL_ETAPAS}
          aria-label={briefing.progresso}
          aria-valuetext={anuncio}
        />
        {tela >= 1 && tela < TELA_FIM ? (
          <span className="rotulo sa-num text-text-muted" aria-hidden="true">
            {briefing.contador(etapa, TOTAL_ETAPAS)}
          </span>
        ) : null}
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {carregado ? anuncio : ""}
      </p>
      <div key={tela} className="sa-briefing__tela">
        {conteudo()}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

type PropsPergunta = {
  pergunta: string;
  ajuda?: string;
  opcoes: readonly { id: string; rotulo: string }[];
  valor?: string;
  tituloRef: RefObject<HTMLHeadingElement | null>;
  aoResponder: (valor: string) => void;
  aoAvancar: (valor: string) => void;
  aoVoltar: () => void;
};

/** Um toque responde e avança depois de 200 ms, como no diagnóstico. */
function TelaPergunta({ pergunta, ajuda, opcoes, valor, tituloRef, aoResponder, aoAvancar, aoVoltar }: PropsPergunta) {
  const espera = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(espera.current), []);

  const aoTocar = (novo: string) => {
    aoResponder(novo);
    window.clearTimeout(espera.current);
    espera.current = window.setTimeout(() => aoAvancar(novo), 200);
  };
  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (valor) aoAvancar(valor);
  };
  const teclado = (evento: KeyboardEvent) => {
    if (evento.key === "Enter" && valor) {
      evento.preventDefault();
      aoAvancar(valor);
    }
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={enviar} noValidate>
      <div className="sa-diag__corpo">
        <h1 ref={tituloRef} tabIndex={-1} className="titulo-2 sa-diag__titulo">
          {pergunta}
        </h1>
        {ajuda ? <p className="pequeno mt-2 text-text-muted">{ajuda}</p> : null}
        <RadioGroup
          className="mt-6"
          value={valor ?? ""}
          onValueChange={aoResponder}
          onKeyDown={teclado}
          aria-label={pergunta}
          loop={false}
        >
          {opcoes.map((opcao) => (
            <OpcaoChip key={opcao.id} valor={opcao.id} rotulo={opcao.rotulo} aoTocar={aoTocar} />
          ))}
        </RadioGroup>
      </div>
      <div className="sa-diag__acoes">
        <Button variant="secundario" onClick={aoVoltar}>
          {briefing.voltar}
        </Button>
        <Button type="submit" aria-disabled={valor ? undefined : true}>
          {briefing.continuar}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

type PropsObjetivo = {
  inicial: string;
  tituloRef: RefObject<HTMLHeadingElement | null>;
  aoVoltar: () => void;
  aoAvancar: (objetivo: string) => void;
};

function TelaObjetivo({ inicial, tituloRef, aoVoltar, aoAvancar }: PropsObjetivo) {
  const [texto, setTexto] = useState(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const t = briefing.objetivo;

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const resultado = objetivoSchema.safeParse(texto);
    if (!resultado.success) {
      setErro(resultado.error.issues[0]?.message ?? t.erro);
      return;
    }
    aoAvancar(resultado.data);
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={enviar} noValidate>
      <div className="sa-diag__corpo">
        <h1 ref={tituloRef} tabIndex={-1} className="titulo-2 sa-diag__titulo">
          <label htmlFor="briefing-objetivo">{t.pergunta}</label>
        </h1>
        <p id="briefing-objetivo-ajuda" className="pequeno mt-2 text-text-muted">
          {t.rotulo}
        </p>
        <textarea
          id="briefing-objetivo"
          className="sa-input sa-input--area mt-6"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            if (erro) setErro(null);
          }}
          rows={4}
          maxLength={600}
          placeholder={t.exemplo}
          aria-describedby={erro ? "briefing-objetivo-ajuda briefing-objetivo-erro" : "briefing-objetivo-ajuda"}
          aria-invalid={erro ? true : undefined}
        />
        {erro ? (
          <p id="briefing-objetivo-erro" className="sa-erro pequeno mt-2" role="alert">
            {erro}
          </p>
        ) : null}
        <button type="button" className="sa-link pequeno mt-4" onClick={() => aoAvancar("")}>
          {t.pular}
        </button>
      </div>
      <div className="sa-diag__acoes">
        <Button variant="secundario" onClick={aoVoltar}>
          {briefing.voltar}
        </Button>
        <Button type="submit">{briefing.continuar}</Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

type PropsContato = {
  inicial?: Estado["contato"];
  tituloRef: RefObject<HTMLHeadingElement | null>;
  aoVoltar: () => void;
  aoEnviar: (contato: Contato) => Promise<void>;
};

const campos = diagnostico.telas.contato.campos;
const consentimento = diagnostico.telas.contato.consentimento;

function TelaContatoBriefing({ inicial, tituloRef, aoVoltar, aoEnviar }: PropsContato) {
  const [enviando, setEnviando] = useState(false);
  // Ref, não estado: dois toques seguidos chegam antes da nova renderização.
  const travado = useRef(false);
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
            {briefing.contato.pergunta}
          </h1>
          <div className="mt-6 grid gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{campos.nome.rotulo}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="name" autoCapitalize="words" enterKeyHint="next" />
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
                  <FormLabel>{campos.empresa.rotulo}</FormLabel>
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
                  <FormLabel>{campos.instagram.rotulo}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder={campos.instagram.exemplo}
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
              {consentimento.antes}
              <a href="/privacidade" target="_blank" rel="noopener" className="sa-link">
                {consentimento.link}
                <span className="sr-only"> {comum.novaAba}</span>
              </a>
              {consentimento.depois}
            </p>
          </div>
        </div>
        <div className="sa-diag__acoes">
          <Button variant="secundario" onClick={aoVoltar} disabled={enviando}>
            {briefing.voltar}
          </Button>
          <Button type="submit" aria-disabled={enviando || undefined}>
            {enviando ? briefing.contato.enviando : briefing.contato.concluir}
          </Button>
        </div>
      </form>
    </Form>
  );
}
