"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, GiftIcon } from "lucide-react";
import { z } from "zod";

import { IconeWhatsapp } from "@/components/diagnostico/TelaResultado";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { briefing, briefingOpcoes, comum, nomeDaFrente, site } from "@/content/site";
import {
  contatoBriefingSchema,
  ETAPAS,
  etapasAtivas,
  indicarFrentes,
  marcouOutro,
  montarMensagemAgendar,
  montarMensagemBriefing,
  outroSchema,
  respostasBriefingSchema,
  temOutro,
  textoSchemas,
  type ContatoBriefing,
  type Etapa,
  type EtapaId,
  type Outros,
  type Respostas,
} from "@/lib/briefing";
import { lerOrigem } from "@/lib/utm";
import { urlWhatsapp } from "@/lib/whatsapp";
import { IconeInstagram } from "./IconeInstagram";
import { TelaContatoBriefing, type ContatoSalvo } from "./TelaContatoBriefing";
import { TelaMultipla, TelaPergunta, TelaTexto } from "./telas";

/**
 * Briefing antes da reunião (briefing.saagencia.com.br), no visual do
 * diagnóstico: abertura com aceite obrigatório, a conversa em quatro
 * capítulos (ETAPAS em src/lib/briefing.ts; escolhas, várias escolhas e
 * perguntas de escrever), contato e a tela final, que leva a pessoa a chamar
 * um consultor no WhatsApp. Este componente só existe nesta rota, por isso
 * pode importar site.ts.
 */

const CHAVE = "sa:briefing";

/** Tela atual: a abertura, uma etapa (pelo nome), o contato, o presente (Instagram) ou o fim. */
type Tela = "abertura" | EtapaId | "contato" | "presente" | "fim";

type Estado = {
  tela: Tela;
  aceite: boolean;
  respostas: Respostas;
  outros: Outros;
  contato?: ContatoSalvo;
  salvo?: boolean;
  /** Código do briefing gravado, para avisar os toques no Instagram e no WhatsApp. */
  codigo?: string;
  /** Tocou em "Seguir a SA no Instagram" na tela do presente. */
  instagram?: boolean;
};

const INICIAL: Estado = { tela: "abertura", aceite: false, respostas: {}, outros: {} };

const contatoSalvoSchema = contatoBriefingSchema.pick({ nome: true, whatsapp: true, empresa: true, instagram: true });
const outrosSalvosSchema = z
  .object({ segmento: z.string().max(80), origem: z.string().max(80), desafio: z.string().max(80) })
  .partial();
const TELAS = new Set<string>(["abertura", "contato", "presente", "fim", ...ETAPAS.map((e) => e.id)]);

/** Lê do sessionStorage só o que for válido; cada resposta é conferida sozinha. */
function lerEstado(): Estado {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE);
    if (!bruto) return INICIAL;
    const salvo = JSON.parse(bruto) as Partial<Estado>;
    const respostas: Respostas = {};
    for (const etapa of ETAPAS) {
      const r = respostasBriefingSchema.shape[etapa.id].safeParse(salvo.respostas?.[etapa.id]);
      if (r.success && r.data !== undefined) respostas[etapa.id] = r.data as string | string[];
    }
    return coerente({
      tela: typeof salvo.tela === "string" && TELAS.has(salvo.tela) ? (salvo.tela as Tela) : "abertura",
      aceite: salvo.aceite === true,
      respostas,
      outros: outrosSalvosSchema.safeParse(salvo.outros ?? {}).data ?? {},
      contato: contatoSalvoSchema.safeParse(salvo.contato).data,
      salvo: salvo.salvo === true,
      codigo: z.uuid().safeParse(salvo.codigo).data,
      instagram: salvo.instagram === true,
    });
  } catch {
    return INICIAL;
  }
}

const respondida = (estado: Estado, etapa: Etapa): boolean => {
  const valor = estado.respostas[etapa.id];
  if (etapa.tipo === "texto") return textoSchemas[etapa.id].safeParse(valor ?? "").success;
  if (!valor || (Array.isArray(valor) && valor.length === 0)) return false;
  if (temOutro(etapa.id) && marcouOutro(valor)) return outroSchema.safeParse(estado.outros[etapa.id] ?? "").success;
  return true;
};

/** Sem aceite, só a abertura. Nunca deixa a pessoa numa tela sem as respostas anteriores. */
function coerente(estado: Estado): Estado {
  if (!estado.aceite) return { ...estado, tela: "abertura" };
  if (estado.tela === "abertura") return estado;
  const ativas = etapasAtivas(estado.respostas);
  const ordem: Tela[] = [...ativas.map((e) => e.id), "contato", "presente", "fim"];
  // Etapa que deixou de valer (ex.: "marketing" depois de trocar a estratégia).
  if (!ordem.includes(estado.tela)) return coerente({ ...estado, tela: ativas[0]?.id ?? "contato" });
  const faltando = ativas.find((e) => e.tipo !== "texto" || e.obrigatoria ? !respondida(estado, e) : false);
  if (faltando && ordem.indexOf(estado.tela) > ordem.indexOf(faltando.id)) return { ...estado, tela: faltando.id };
  if ((estado.tela === "presente" || estado.tela === "fim") && !estado.contato) return { ...estado, tela: "contato" };
  // O presente só existe com o briefing gravado (há código para registrar o toque).
  if (estado.tela === "presente" && !estado.salvo) return { ...estado, tela: "fim" };
  return estado;
}

/** Próxima e anterior na ordem das etapas que valem agora. */
function vizinha(estado: Estado, passo: 1 | -1): Tela {
  const ordem: Tela[] = ["abertura", ...etapasAtivas(estado.respostas).map((e) => e.id), "contato", "presente", "fim"];
  const i = ordem.indexOf(estado.tela);
  return ordem[Math.min(Math.max(i + passo, 0), ordem.length - 1)];
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

/** Avisa o servidor de um toque (WhatsApp, Instagram) sem esperar resposta: a aba nova já abriu. */
function avisar(rota: string, corpo: Record<string, string>) {
  const json = JSON.stringify(corpo);
  try {
    if (navigator.sendBeacon?.(rota, new Blob([json], { type: "application/json" }))) return;
  } catch {
    // Sem sendBeacon, tenta o fetch abaixo.
  }
  void fetch(rota, { method: "POST", headers: { "Content-Type": "application/json" }, body: json, keepalive: true }).catch(() => {});
}
const avisarWhatsappAberto = (codigo?: string) => codigo && avisar("/api/briefing/whatsapp", { codigo });
const avisarInstagram = (codigo: string | undefined, acao: "clicou" | "continuou") =>
  codigo && avisar("/api/briefing/instagram", { codigo, acao });

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

  const irPara = (tela: Tela) => setEstado((e) => coerente({ ...e, tela }));
  const avancar = () => setEstado((e) => coerente({ ...e, tela: vizinha(e, 1) }));
  const voltar = () => setEstado((e) => ({ ...e, tela: vizinha(e, -1) }));
  const responder = (chave: EtapaId, valor: string | string[]) =>
    setEstado((e) => ({ ...e, respostas: { ...e.respostas, [chave]: valor } }));

  const comecar = () => {
    if (!estado.aceite) {
      setErroAceite(true);
      aceiteRef.current?.focus();
      return;
    }
    avancar();
  };

  const concluir = async (contato: ContatoBriefing) => {
    const respostas = respostasBriefingSchema.safeParse(estado.respostas);
    if (!respostas.success) {
      irPara(ETAPAS[0].id);
      return;
    }
    const origem = lerOrigem();
    const { salvo, codigo } = await enviarBriefing({
      ...contato,
      ...respostas.data,
      consentimento: estado.aceite,
      outros: estado.outros,
      utm: origem.utm,
      pagina: origem.pagina,
      referrer: origem.referrer,
    });
    const { nome, whatsapp, empresa, instagram } = contato;
    // Gravado: vai para o presente (Instagram); sem gravar, direto ao fim (WhatsApp com as respostas).
    setEstado((e) => ({ ...e, contato: { nome, whatsapp, empresa, instagram }, salvo, codigo, tela: salvo ? "presente" : "fim" }));
  };

  const { tela } = estado;
  // Progresso: etapas que valem agora mais o contato.
  const passos: Tela[] = [...etapasAtivas(estado.respostas).map((e) => e.id), "contato"];
  const total = passos.length;
  const final = tela === "presente" || tela === "fim";
  const etapa = tela === "abertura" ? 0 : final ? total : passos.indexOf(tela) + 1;
  const anuncio =
    tela === "abertura"
      ? briefing.abertura.rotulo
      : tela === "presente"
        ? briefing.presente.anuncio
        : tela === "fim"
          ? briefing.concluido.anuncio
          : briefing.contador(etapa, total);

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

  const telaEtapa = (etapa: Etapa) => {
    const bloco = briefing.blocos[etapa.bloco];
    if (etapa.tipo === "texto") {
      const valor = estado.respostas[etapa.id];
      return (
        <TelaTexto
          key={etapa.id}
          id={etapa.id}
          bloco={bloco}
          textos={briefing.textos[etapa.id]}
          validar={textoSchemas[etapa.id]}
          longo={etapa.id !== "produto"}
          inicial={typeof valor === "string" ? valor : ""}
          tituloRef={tituloRef}
          aoVoltar={voltar}
          aoAvancar={(texto) => {
            responder(etapa.id, texto);
            avancar();
          }}
        />
      );
    }
    const chave = etapa.id;
    const pergunta = briefing.perguntas[chave];
    const outro = temOutro(chave)
      ? {
          ...briefing.outro[chave],
          valor: estado.outros[chave] ?? "",
          aoMudar: (texto: string) => setEstado((e) => ({ ...e, outros: { ...e.outros, [chave]: texto } })),
        }
      : undefined;
    const base = {
      bloco,
      pergunta: pergunta.pergunta,
      ajuda: "ajuda" in pergunta ? pergunta.ajuda : undefined,
      opcoes: briefingOpcoes[chave],
      outro,
      tituloRef,
      aoAvancar: avancar,
      aoVoltar: voltar,
    };
    const valor = estado.respostas[chave];
    if (etapa.tipo === "multipla") {
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
    return (
      <TelaPergunta
        key={chave}
        {...base}
        valor={typeof valor === "string" ? valor : undefined}
        aoResponder={(v) => responder(chave, v)}
      />
    );
  };

  /** Depois de gravar: o presente. Seguir no Instagram é opcional; "Continuar" sempre avança. */
  const telaPresente = () => {
    if (!estado.contato) return null;
    const p = briefing.presente;
    const respostas = respostasBriefingSchema.safeParse(estado.respostas);
    const frentes = respostas.success ? indicarFrentes(respostas.data.desafio) : [];
    const primeiroNome = estado.contato.nome.trim().split(/\s+/)[0];
    const continuar = () => {
      avisarInstagram(estado.codigo, "continuou");
      irPara("fim");
    };
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="sa-diag__corpo">
          <span className="sa-resultado__selo" aria-hidden="true">
            <GiftIcon size={22} strokeWidth={2.25} />
          </span>
          <p className="sa-resultado__rotulo rotulo">{p.rotulo}</p>
          <h1 ref={tituloRef} tabIndex={-1} className="titulo-2 sa-diag__titulo mt-2">
            {p.titulo(primeiroNome)}
          </h1>
          <p className="corpo mt-4 text-text-muted">{p.texto}</p>
          {frentes.length > 0 ? (
            <>
              <p className="sa-resultado__rotulo rotulo">{p.rotuloFrentes}</p>
              <ul className="sa-resultado__frentes">
                {frentes.map((f) => (
                  <li key={f}>{nomeDaFrente(f)}</li>
                ))}
              </ul>
            </>
          ) : null}
          {estado.instagram ? (
            <p className="pequeno mt-6 text-text-muted" role="status">
              {p.seguido}
            </p>
          ) : null}
        </div>
        <div className="sa-diag__acoes sa-briefing__acoes-presente">
          <Button asChild largura="bloco" variant={estado.instagram ? "secundario" : undefined}>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener"
              onClick={() => {
                avisarInstagram(estado.codigo, "clicou");
                setEstado((e) => ({ ...e, instagram: true }));
              }}
            >
              <IconeInstagram />
              {p.seguir}
              <span className="sr-only"> {comum.novaAba}</span>
            </a>
          </Button>
          <Button largura="bloco" variant={estado.instagram ? undefined : "secundario"} onClick={continuar}>
            {p.continuar}
          </Button>
        </div>
      </div>
    );
  };

  /** Fim: agradecimento e o consultor no WhatsApp (ou o envio das respostas, se não gravou). */
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
          });
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
    if (tela === "abertura") return telaAbertura();
    if (tela === "contato") {
      return <TelaContatoBriefing inicial={estado.contato} tituloRef={tituloRef} aoVoltar={voltar} aoEnviar={concluir} />;
    }
    if (tela === "presente") return telaPresente();
    if (tela === "fim") return telaFim();
    const etapa = ETAPAS.find((e) => e.id === tela);
    return etapa ? telaEtapa(etapa) : null;
  };

  return (
    <div className="sa-briefing__cartao">
      <div className="sa-diag__topo">
        <Progress value={etapa} max={total} aria-label={briefing.progresso} aria-valuetext={anuncio} />
        {tela !== "abertura" && !final ? (
          <span className="rotulo sa-num text-text-muted" aria-hidden="true">
            {briefing.contador(etapa, total)}
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
