"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "lucide-react";
import { z } from "zod";

import { IconeWhatsapp } from "@/components/diagnostico/TelaResultado";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { briefing, briefingOpcoes, comum, nomeDaFrente } from "@/content/site";
import {
  contatoBriefingSchema,
  indicarFrentes,
  marcouOutro,
  montarMensagemAgendar,
  montarMensagemBriefing,
  objetivoSchema,
  outroSchema,
  PERGUNTAS_BRIEFING,
  PERGUNTAS_MULTIPLAS,
  respostasBriefingSchema,
  temOutro,
  type ContatoBriefing,
  type Outros,
  type PerguntaBriefingId,
} from "@/lib/briefing";
import { lerOrigem } from "@/lib/utm";
import { urlWhatsapp } from "@/lib/whatsapp";
import { TelaContatoBriefing, type ContatoSalvo } from "./TelaContatoBriefing";
import { TelaMultipla, TelaObjetivo, TelaPergunta } from "./telas";

/**
 * Briefing antes da reunião (briefing.saagencia.com.br), no visual do
 * diagnóstico: abertura com aceite obrigatório, 8 perguntas (desafios com
 * várias escolhas; "Outro" abre um campo), objetivo opcional, contato e a
 * tela final, que leva a pessoa a chamar um consultor no WhatsApp. Este
 * componente só existe nesta rota, por isso pode importar site.ts.
 */

const TOTAL_PERGUNTAS = PERGUNTAS_BRIEFING.length;
/** Telas: 0 abertura, 1 a 8 perguntas, 9 objetivo, 10 contato, 11 fim. */
const TELA_OBJETIVO = TOTAL_PERGUNTAS + 1;
const TELA_CONTATO = TOTAL_PERGUNTAS + 2;
const TELA_FIM = TOTAL_PERGUNTAS + 3;
const TOTAL_ETAPAS = TOTAL_PERGUNTAS + 2;

const CHAVE = "sa:briefing";

type Respostas = Partial<Record<PerguntaBriefingId, string | string[]>>;

type Estado = {
  tela: number;
  aceite: boolean;
  respostas: Respostas;
  outros: Outros;
  objetivo: string;
  contato?: ContatoSalvo;
  salvo?: boolean;
  /** Código do briefing gravado, para avisar o clique no WhatsApp. */
  codigo?: string;
};

const INICIAL: Estado = { tela: 0, aceite: false, respostas: {}, outros: {}, objetivo: "" };

const contatoSalvoSchema = contatoBriefingSchema.pick({ nome: true, whatsapp: true, empresa: true, instagram: true });
const outrosSalvosSchema = z
  .object({ segmento: z.string().max(80), origem: z.string().max(80), desafio: z.string().max(80) })
  .partial();

/** Lê do sessionStorage só o que for válido; cada resposta é conferida sozinha. */
function lerEstado(): Estado {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE);
    if (!bruto) return INICIAL;
    const salvo = JSON.parse(bruto) as Partial<Estado>;
    const respostas: Respostas = {};
    for (const chave of PERGUNTAS_BRIEFING) {
      const r = respostasBriefingSchema.shape[chave].safeParse(salvo.respostas?.[chave]);
      if (r.success) respostas[chave] = r.data as string | string[];
    }
    const objetivo = objetivoSchema.safeParse(salvo.objetivo ?? "");
    return coerente({
      tela: Number.isInteger(salvo.tela) ? Math.min(Math.max(Number(salvo.tela), 0), TELA_FIM) : 0,
      aceite: salvo.aceite === true,
      respostas,
      outros: outrosSalvosSchema.safeParse(salvo.outros ?? {}).data ?? {},
      objetivo: objetivo.success ? objetivo.data : "",
      contato: contatoSalvoSchema.safeParse(salvo.contato).data,
      salvo: salvo.salvo === true,
      codigo: z.uuid().safeParse(salvo.codigo).data,
    });
  } catch {
    return INICIAL;
  }
}

const respondida = (estado: Estado, chave: PerguntaBriefingId): boolean => {
  const valor = estado.respostas[chave];
  if (!valor || (Array.isArray(valor) && valor.length === 0)) return false;
  if (temOutro(chave) && marcouOutro(valor)) return outroSchema.safeParse(estado.outros[chave] ?? "").success;
  return true;
};

/** Sem aceite, só a abertura. Nunca deixa a pessoa numa tela sem as respostas anteriores. */
function coerente(estado: Estado): Estado {
  if (!estado.aceite) return { ...estado, tela: 0 };
  const faltando = PERGUNTAS_BRIEFING.findIndex((chave) => !respondida(estado, chave));
  if (faltando >= 0 && estado.tela > faltando + 1) return { ...estado, tela: faltando + 1 };
  if (estado.tela === TELA_FIM && !estado.contato) return { ...estado, tela: TELA_CONTATO };
  return estado;
}

async function enviarBriefing(corpo: Record<string, unknown>): Promise<{ salvo: boolean; codigo?: string }> {
  try {
    const resposta = await fetch("/api/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(10_000) : undefined,
    });
    if (!resposta.ok) return { salvo: false };
    const dados = (await resposta.json()) as { salvo?: boolean; codigo?: string };
    return { salvo: dados.salvo === true, codigo: dados.codigo };
  } catch {
    return { salvo: false };
  }
}

/** Avisa que a pessoa abriu o WhatsApp. Sem esperar resposta: a aba nova já abriu. */
function avisarWhatsappAberto(codigo: string | undefined) {
  if (!codigo) return;
  const corpo = JSON.stringify({ codigo });
  try {
    if (navigator.sendBeacon?.("/api/briefing/whatsapp", new Blob([corpo], { type: "application/json" }))) return;
  } catch {
    // Sem sendBeacon, tenta o fetch abaixo.
  }
  void fetch("/api/briefing/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: corpo, keepalive: true }).catch(() => {});
}

export function BriefingFormulario() {
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [carregado, setCarregado] = useState(false);
  const [erroAceite, setErroAceite] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const aceiteRef = useRef<HTMLInputElement>(null);
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
  const responder = (chave: PerguntaBriefingId, valor: string | string[]) =>
    setEstado((e) => ({ ...e, respostas: { ...e.respostas, [chave]: valor } }));

  const comecar = () => {
    if (!estado.aceite) {
      setErroAceite(true);
      aceiteRef.current?.focus();
      return;
    }
    irPara(1);
  };

  const concluir = async (contato: ContatoBriefing) => {
    const respostas = respostasBriefingSchema.safeParse(estado.respostas);
    if (!respostas.success) {
      irPara(1);
      return;
    }
    const origem = lerOrigem();
    const { salvo, codigo } = await enviarBriefing({
      ...contato,
      ...respostas.data,
      consentimento: estado.aceite,
      outros: estado.outros,
      objetivo: estado.objetivo,
      utm: origem.utm,
      pagina: origem.pagina,
      referrer: origem.referrer,
    });
    const { nome, whatsapp, empresa, instagram } = contato;
    setEstado((e) => ({ ...e, contato: { nome, whatsapp, empresa, instagram }, salvo, codigo, tela: TELA_FIM }));
  };

  const { tela } = estado;
  const etapa = Math.min(tela, TOTAL_ETAPAS);
  const anuncio =
    tela === 0 ? briefing.abertura.rotulo : tela === TELA_FIM ? briefing.concluido.anuncio : briefing.contador(etapa, TOTAL_ETAPAS);

  const telaAbertura = () => {
    const a = briefing.abertura;
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="sa-diag__corpo">
          <p className="sa-resultado__rotulo rotulo mt-0">{a.rotulo}</p>
          <h1 ref={tituloRef} tabIndex={-1} className="titulo-2 sa-diag__titulo mt-3">
            {a.titulo}
          </h1>
          <p className="corpo mt-4 text-text-muted">{a.texto}</p>
          <div className="sa-aceite mt-6">
            <input
              ref={aceiteRef}
              id="briefing-aceite"
              type="checkbox"
              checked={estado.aceite}
              onChange={(e) => {
                const aceite = e.target.checked;
                setEstado((s) => ({ ...s, aceite }));
                if (aceite) setErroAceite(false);
              }}
              aria-invalid={erroAceite || undefined}
              aria-describedby={erroAceite ? "briefing-aceite-erro" : undefined}
            />
            <label htmlFor="briefing-aceite" className="pequeno">
              {a.aceite.antes}
              <a href="/privacidade" target="_blank" rel="noopener" className="sa-link">
                {a.aceite.link}
                <span className="sr-only"> {comum.novaAba}</span>
              </a>
              {a.aceite.depois}
            </label>
          </div>
          {erroAceite ? (
            <p id="briefing-aceite-erro" className="sa-erro pequeno mt-2" role="alert">
              {a.aceiteErro}
            </p>
          ) : null}
        </div>
        <div className="sa-diag__acoes">
          <span />
          <Button onClick={comecar} aria-disabled={estado.aceite ? undefined : true}>
            {a.comecar}
          </Button>
        </div>
      </div>
    );
  };

  const telaPergunta = (chave: PerguntaBriefingId) => {
    const pergunta = briefing.perguntas[chave];
    const outro = temOutro(chave)
      ? {
          ...briefing.outro[chave],
          valor: estado.outros[chave] ?? "",
          aoMudar: (texto: string) => setEstado((e) => ({ ...e, outros: { ...e.outros, [chave]: texto } })),
        }
      : undefined;
    const base = {
      pergunta: pergunta.pergunta,
      ajuda: "ajuda" in pergunta ? pergunta.ajuda : undefined,
      opcoes: briefingOpcoes[chave],
      outro,
      tituloRef,
      aoAvancar: () => irPara(tela + 1),
      aoVoltar: voltar,
    };
    if (PERGUNTAS_MULTIPLAS.includes(chave)) {
      const valor = estado.respostas[chave];
      return (
        <TelaMultipla
          key={chave}
          {...base}
          erroVazio={"erro" in pergunta ? pergunta.erro : ""}
          valor={Array.isArray(valor) ? valor : []}
          aoResponder={(lista) => responder(chave, lista)}
        />
      );
    }
    const valor = estado.respostas[chave];
    return (
      <TelaPergunta
        key={chave}
        {...base}
        valor={typeof valor === "string" ? valor : undefined}
        aoResponder={(v) => responder(chave, v)}
      />
    );
  };

  const telaFim = () => {
    if (!estado.contato) return null;
    const respostas = respostasBriefingSchema.safeParse(estado.respostas);
    const primeiroNome = estado.contato.nome.trim().split(/\s+/)[0];
    const textos = estado.salvo ? briefing.concluido : briefing.falhou;
    const mensagem =
      estado.salvo || !respostas.success
        ? montarMensagemAgendar(estado.contato)
        : montarMensagemBriefing({
            nome: estado.contato.nome,
            empresa: estado.contato.empresa,
            respostas: respostas.data,
            outros: estado.outros,
            objetivo: estado.objetivo,
          });
    const frentes = respostas.success ? indicarFrentes(respostas.data.desafio) : [];
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
          {frentes.length > 0 ? (
            <>
              <p className="sa-resultado__rotulo rotulo">{briefing.concluido.rotuloFrentes}</p>
              <ul className="sa-resultado__frentes">
                {frentes.map((f) => (
                  <li key={f}>{nomeDaFrente(f)}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
        <div className="sa-diag__acoes sa-briefing__acao-final">
          <Button asChild largura="bloco">
            <a
              href={urlWhatsapp(mensagem)}
              target="_blank"
              rel="noopener"
              onClick={() => avisarWhatsappAberto(estado.codigo)}
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

  const conteudo = () => {
    if (tela === 0) return telaAbertura();
    if (tela >= 1 && tela <= TOTAL_PERGUNTAS) return telaPergunta(PERGUNTAS_BRIEFING[tela - 1]);
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
    return telaFim();
  };

  return (
    <div className="sa-briefing__cartao">
      <div className="sa-diag__topo">
        <Progress value={etapa} max={TOTAL_ETAPAS} aria-label={briefing.progresso} aria-valuetext={anuncio} />
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
