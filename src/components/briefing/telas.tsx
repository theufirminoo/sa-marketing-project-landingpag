"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { CheckIcon } from "lucide-react";

import { OpcaoChip } from "@/components/diagnostico/OpcaoChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { briefing } from "@/content/site";
import { objetivoSchema, outroSchema } from "@/lib/briefing";

type Opcoes = readonly { id: string; rotulo: string }[];
type Titulo = RefObject<HTMLHeadingElement | null>;

/** Campo para escrever quando a escolha é "outro". */
export type CampoOutroProps = { rotulo: string; exemplo: string; valor: string; aoMudar: (texto: string) => void };

function CampoOutro({
  outro,
  erro,
  campo,
  aoLimparErro,
}: {
  outro: CampoOutroProps;
  erro: string | null;
  campo: RefObject<HTMLInputElement | null>;
  aoLimparErro: () => void;
}) {
  return (
    <div className="mt-4 grid gap-2">
      <label htmlFor="briefing-outro" className="rotulo">
        {outro.rotulo}
      </label>
      <Input
        ref={campo}
        id="briefing-outro"
        value={outro.valor}
        onChange={(e) => {
          outro.aoMudar(e.target.value);
          if (erro) aoLimparErro();
        }}
        maxLength={80}
        placeholder={outro.exemplo}
        enterKeyHint="next"
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? "briefing-outro-erro" : undefined}
      />
      {erro ? (
        <p id="briefing-outro-erro" className="sa-erro pequeno" role="alert">
          {erro}
        </p>
      ) : null}
    </div>
  );
}

function Acoes({ aoVoltar, desativado }: { aoVoltar: () => void; desativado?: boolean }) {
  return (
    <div className="sa-diag__acoes">
      <Button variant="secundario" onClick={aoVoltar}>
        {briefing.voltar}
      </Button>
      <Button type="submit" aria-disabled={desativado || undefined}>
        {briefing.continuar}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

type PropsPergunta = {
  pergunta: string;
  ajuda?: string;
  opcoes: Opcoes;
  valor?: string;
  outro?: CampoOutroProps;
  tituloRef: Titulo;
  aoResponder: (valor: string) => void;
  aoAvancar: () => void;
  aoVoltar: () => void;
};

/**
 * Escolha única. Um toque responde e avança depois de 200 ms, como no
 * diagnóstico. "Outro" não avança: abre o campo para escrever.
 */
export function TelaPergunta({ pergunta, ajuda, opcoes, valor, outro, tituloRef, aoResponder, aoAvancar, aoVoltar }: PropsPergunta) {
  const espera = useRef<number | undefined>(undefined);
  const campoOutro = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => () => window.clearTimeout(espera.current), []);

  const avancar = (escolha: string | undefined) => {
    if (!escolha) return;
    if (outro && escolha === "outro") {
      const resultado = outroSchema.safeParse(outro.valor);
      if (!resultado.success) {
        setErro(resultado.error.issues[0]?.message ?? null);
        campoOutro.current?.focus();
        return;
      }
    }
    aoAvancar();
  };

  const aoTocar = (novo: string) => {
    aoResponder(novo);
    window.clearTimeout(espera.current);
    if (outro && novo === "outro") {
      espera.current = window.setTimeout(() => campoOutro.current?.focus(), 50);
      return;
    }
    espera.current = window.setTimeout(aoAvancar, 200);
  };
  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    avancar(valor);
  };
  const teclado = (evento: KeyboardEvent) => {
    if (evento.key === "Enter" && valor) {
      evento.preventDefault();
      avancar(valor);
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
        {outro && valor === "outro" ? (
          <CampoOutro outro={outro} erro={erro} campo={campoOutro} aoLimparErro={() => setErro(null)} />
        ) : null}
      </div>
      <Acoes aoVoltar={aoVoltar} desativado={!valor} />
    </form>
  );
}

/* ------------------------------------------------------------------ */

type PropsMultipla = {
  pergunta: string;
  ajuda?: string;
  erroVazio: string;
  opcoes: Opcoes;
  valor: readonly string[];
  outro?: CampoOutroProps;
  tituloRef: Titulo;
  aoResponder: (valor: string[]) => void;
  aoAvancar: () => void;
  aoVoltar: () => void;
};

/** Várias escolhas: cada toque marca ou desmarca; avança no Continuar. */
export function TelaMultipla({ pergunta, ajuda, erroVazio, opcoes, valor, outro, tituloRef, aoResponder, aoAvancar, aoVoltar }: PropsMultipla) {
  const campoOutro = useRef<HTMLInputElement>(null);
  const espera = useRef<number | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);
  const [erroOutro, setErroOutro] = useState<string | null>(null);
  useEffect(() => () => window.clearTimeout(espera.current), []);

  const alternar = (id: string) => {
    const marcado = valor.includes(id);
    aoResponder(marcado ? valor.filter((v) => v !== id) : [...valor, id]);
    if (erro) setErro(null);
    if (!marcado && id === "outro" && outro) {
      window.clearTimeout(espera.current);
      espera.current = window.setTimeout(() => campoOutro.current?.focus(), 50);
    }
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (valor.length === 0) {
      setErro(erroVazio);
      return;
    }
    if (outro && valor.includes("outro")) {
      const resultado = outroSchema.safeParse(outro.valor);
      if (!resultado.success) {
        setErroOutro(resultado.error.issues[0]?.message ?? null);
        campoOutro.current?.focus();
        return;
      }
    }
    aoAvancar();
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={enviar} noValidate>
      <div className="sa-diag__corpo">
        <h1 ref={tituloRef} tabIndex={-1} className="titulo-2 sa-diag__titulo">
          {pergunta}
        </h1>
        {ajuda ? <p className="pequeno mt-2 text-text-muted">{ajuda}</p> : null}
        <div role="group" aria-label={pergunta} className="sa-chips sa-chips--coluna mt-6">
          {opcoes.map((opcao) => {
            const marcado = valor.includes(opcao.id);
            return (
              <button
                key={opcao.id}
                type="button"
                role="checkbox"
                aria-checked={marcado}
                data-state={marcado ? "checked" : "unchecked"}
                className="sa-chip"
                onClick={() => alternar(opcao.id)}
              >
                {marcado ? <CheckIcon className="sa-chip__visto" aria-hidden="true" size={20} strokeWidth={1.5} /> : null}
                <span>{opcao.rotulo}</span>
              </button>
            );
          })}
        </div>
        {outro && valor.includes("outro") ? (
          <CampoOutro outro={outro} erro={erroOutro} campo={campoOutro} aoLimparErro={() => setErroOutro(null)} />
        ) : null}
        {erro ? (
          <p className="sa-erro pequeno mt-4" role="alert">
            {erro}
          </p>
        ) : null}
      </div>
      <Acoes aoVoltar={aoVoltar} desativado={valor.length === 0} />
    </form>
  );
}

/* ------------------------------------------------------------------ */

type PropsObjetivo = {
  inicial: string;
  tituloRef: Titulo;
  aoVoltar: () => void;
  aoAvancar: (objetivo: string) => void;
};

export function TelaObjetivo({ inicial, tituloRef, aoVoltar, aoAvancar }: PropsObjetivo) {
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
      <Acoes aoVoltar={aoVoltar} />
    </form>
  );
}
