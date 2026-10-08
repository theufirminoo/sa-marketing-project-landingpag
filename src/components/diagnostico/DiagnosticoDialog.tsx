"use client";

import { useEffect, useReducer, useRef, type RefObject } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

import { Dialog, DialogContent, DialogFechar } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { diagnostico, faturamentos, fases, travas } from "@/content/site";
import { registrarEvento } from "@/lib/analytics";
import type { Contato } from "@/lib/lead";
import { formatarFrentes, recomendarFrentes } from "@/lib/recomendacao";
import { lerOrigem } from "@/lib/utm";
import { montarMensagemDiagnostico, urlWhatsapp } from "@/lib/whatsapp";
import { aplicarPedido, lerEstado, reduzir, salvarEstado, type Pedido } from "./estado";
import { TelaContato } from "./TelaContato";
import { TelaOpcoes } from "./TelaOpcoes";
import { TelaResultado } from "./TelaResultado";

type Props = {
  aberto: boolean;
  pedido: Pedido | null;
  aoMudarAberto: (aberto: boolean) => void;
};

const EASE_SAIDA = [0.2, 0, 0, 1] as const;

/** Leva o foco ao título da tela que acabou de entrar. */
function FocoNoTitulo({ alvo }: { alvo: RefObject<HTMLHeadingElement | null> }) {
  useEffect(() => {
    alvo.current?.focus({ preventScroll: true });
  }, [alvo]);
  return null;
}

async function enviarLead(corpo: Record<string, unknown>) {
  try {
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      keepalive: true,
      signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(8000) : undefined,
    });
  } catch {
    // A falha do envio nunca bloqueia: o WhatsApp leva os dados na mensagem.
  }
}

export default function DiagnosticoDialog({ aberto, pedido, aoMudarAberto }: Props) {
  const [estado, despachar] = useReducer(reduzir, pedido, (p) => aplicarPedido(lerEstado(), p));
  const ultimoPedido = useRef(pedido?.id ?? 0);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const reduzido = useReducedMotion();

  useEffect(() => {
    if (pedido && pedido.id !== ultimoPedido.current) {
      ultimoPedido.current = pedido.id;
      despachar({ tipo: "pedido", pedido });
    }
  }, [pedido]);

  useEffect(() => {
    salvarEstado(estado);
  }, [estado]);

  const { tela, trava, fase, faturamento, frenteDeInteresse, contato } = estado;

  const avancar = (etapa: number, resposta: string) => {
    registrarEvento("diagnostico_etapa", { etapa, resposta });
    despachar({ tipo: "avancar" });
  };

  const concluir = async (dados: Contato) => {
    if (!trava || !fase || !faturamento) return;
    const origem = lerOrigem();
    await enviarLead({
      ...dados,
      trava,
      fase,
      faturamento,
      frenteDeInteresse,
      utm: origem.utm,
      pagina: origem.pagina,
      referrer: origem.referrer,
    });
    registrarEvento("diagnostico_etapa", { etapa: 4, resposta: "contato" });
    registrarEvento("lead_enviado", {
      frentes_recomendadas: recomendarFrentes(trava, frenteDeInteresse).join(","),
    });
    despachar({
      tipo: "concluir",
      contato: { nome: dados.nome, whatsapp: dados.whatsapp, empresa: dados.empresa, instagram: dados.instagram },
    });
  };

  const duracao = (s: number) => (reduzido ? 0 : s);
  const variantes = {
    entra: (direcao: number) => ({ opacity: 0, x: 16 * direcao }),
    centro: { opacity: 1, x: 0, transition: { duration: duracao(0.2), ease: EASE_SAIDA } },
    sai: (direcao: number) => ({
      opacity: 0,
      x: -16 * direcao,
      transition: { duration: duracao(0.12), ease: EASE_SAIDA },
    }),
  };

  const anuncio = tela <= 4 ? diagnostico.contador(tela) : diagnostico.telas.resultado.anuncio;

  const conteudo = () => {
    const comum = {
      tituloRef,
      aoVoltar: () => despachar({ tipo: "voltar" }),
    };
    switch (tela) {
      case 1:
        return (
          <TelaOpcoes
            {...comum}
            pergunta={diagnostico.telas.trava.pergunta}
            opcoes={travas}
            valor={trava}
            podeVoltar={false}
            aoResponder={(valor) => despachar({ tipo: "responder", campo: "trava", valor })}
            aoAvancar={(valor) => avancar(1, valor)}
          />
        );
      case 2:
        return (
          <TelaOpcoes
            {...comum}
            pergunta={diagnostico.telas.fase.pergunta}
            opcoes={fases}
            valor={fase}
            podeVoltar
            aoResponder={(valor) => despachar({ tipo: "responder", campo: "fase", valor })}
            aoAvancar={(valor) => avancar(2, valor)}
          />
        );
      case 3:
        return (
          <TelaOpcoes
            {...comum}
            pergunta={diagnostico.telas.faturamento.pergunta}
            opcoes={faturamentos}
            valor={faturamento}
            podeVoltar
            aoResponder={(valor) => despachar({ tipo: "responder", campo: "faturamento", valor })}
            aoAvancar={(valor) => avancar(3, valor)}
          />
        );
      case 4:
        return <TelaContato {...comum} inicial={contato} aoEnviar={concluir} />;
      case 5: {
        if (!trava || !fase || !faturamento || !contato) return null;
        const mensagem = montarMensagemDiagnostico({
          nome: contato.nome,
          empresa: contato.empresa,
          trava,
          fase,
          faturamento,
        });
        return (
          <TelaResultado
            tituloRef={tituloRef}
            frentes={formatarFrentes(recomendarFrentes(trava, frenteDeInteresse))}
            urlWhatsapp={urlWhatsapp(mensagem)}
            aoRefazer={() => despachar({ tipo: "refazer" })}
          />
        );
      }
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent
        aria-describedby={undefined}
        onOpenAutoFocus={(evento) => {
          evento.preventDefault();
          tituloRef.current?.focus({ preventScroll: true });
        }}
        onCloseAutoFocus={(evento) => {
          const abridor = pedido?.abridor;
          if (abridor?.isConnected) {
            evento.preventDefault();
            abridor.focus();
          }
        }}
      >
        <div className="sa-diag__topo">
          <Progress
            value={Math.min(tela, diagnostico.totalEtapas)}
            max={diagnostico.totalEtapas}
            aria-label={diagnostico.progresso}
            aria-valuetext={anuncio}
          />
          {tela <= 4 ? (
            <span className="rotulo sa-num text-text-muted" aria-hidden="true">
              {diagnostico.contador(tela)}
            </span>
          ) : null}
          <DialogFechar rotulo={diagnostico.fechar} />
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {anuncio}
        </p>
        <LazyMotion features={domAnimation} strict>
          <AnimatePresence mode="wait" initial={false} custom={estado.direcao}>
            <m.div
              key={tela}
              custom={estado.direcao}
              variants={variantes}
              initial="entra"
              animate="centro"
              exit="sai"
              className="flex min-h-0 flex-1 flex-col"
            >
              {conteudo()}
              <FocoNoTitulo alvo={tituloRef} />
            </m.div>
          </AnimatePresence>
        </LazyMotion>
      </DialogContent>
    </Dialog>
  );
}
