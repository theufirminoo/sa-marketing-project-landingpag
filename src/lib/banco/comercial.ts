import { indicarFrentes, marcouOutro, type Briefing, type PerguntaComOutro } from "@/lib/briefing";
import type { Fit } from "@/lib/fit";
import { normalizarInstagram, type Lead } from "@/lib/lead";
import { recomendarFrentes } from "@/lib/recomendacao";
import { whatsappInternacional } from "@/lib/whatsapp";
import type { Sql } from "./conexao";

/**
 * Gravação no esquema `comercial` (supabase/migrations). O WhatsApp é o
 * identificador único: quem refaz o diagnóstico ou o briefing atualiza a
 * própria linha e soma 1 em `vezes`. Nada aqui registra dado pessoal em log.
 */

type Contato = Pick<Lead, "nome" | "whatsapp" | "empresa" | "instagram" | "utm" | "pagina" | "referrer">;

const ouNulo = (texto: string | undefined) => {
  const limpo = texto?.trim();
  return limpo ? limpo : null;
};

/**
 * A transação desiste no próprio banco antes do tempo limite da rota (6 s),
 * para não gravar depois de a pessoa já ter visto "não chegou". `set local`
 * vale só nesta transação, então funciona atrás do pooler.
 */
async function limitarTempo(tx: Sql): Promise<void> {
  await tx`set local statement_timeout = 4000`;
}

async function salvarContato(tx: Sql, contato: Contato): Promise<number> {
  const [linha] = await tx<{ id: number }[]>`
    insert into comercial.contatos (whatsapp, nome, empresa, instagram, primeira_origem)
    values (
      ${whatsappInternacional(contato.whatsapp)},
      ${contato.nome.trim()},
      ${ouNulo(contato.empresa)},
      ${ouNulo(normalizarInstagram(contato.instagram))},
      ${tx.json({ utm: contato.utm, pagina: contato.pagina ?? null, referrer: contato.referrer ?? null })}
    )
    on conflict (whatsapp) do update set
      nome = excluded.nome,
      empresa = coalesce(excluded.empresa, comercial.contatos.empresa),
      instagram = coalesce(excluded.instagram, comercial.contatos.instagram)
    returning id
  `;
  return linha.id;
}

export async function gravarDiagnostico(sql: Sql, lead: Lead): Promise<void> {
  await sql.begin(async (tx) => {
    await limitarTempo(tx as unknown as Sql);
    const contatoId = await salvarContato(tx as unknown as Sql, lead);
    await tx`
      insert into comercial.diagnosticos
        (contato_id, trava, fase, faturamento, frente_de_interesse, frentes_recomendadas, utm, pagina, referrer)
      values (
        ${contatoId},
        ${lead.trava},
        ${lead.fase},
        ${lead.faturamento},
        ${lead.frenteDeInteresse ?? null},
        ${recomendarFrentes(lead.trava, lead.frenteDeInteresse)},
        ${tx.json(lead.utm)},
        ${ouNulo(lead.pagina)},
        ${ouNulo(lead.referrer)}
      )
      on conflict (contato_id) do update set
        trava = excluded.trava,
        fase = excluded.fase,
        faturamento = excluded.faturamento,
        frente_de_interesse = excluded.frente_de_interesse,
        frentes_recomendadas = excluded.frentes_recomendadas,
        utm = excluded.utm,
        pagina = excluded.pagina,
        referrer = excluded.referrer,
        vezes = comercial.diagnosticos.vezes + 1
    `;
  });
}

/**
 * Grava o briefing e devolve o código que a tela final usa para avisar o
 * clique no WhatsApp. O contato passa de "novo" para "pendente-conversa"
 * (se já estiver adiante no funil, fica onde está).
 */
export async function gravarBriefing(sql: Sql, dados: Briefing, fit: Fit): Promise<string> {
  // O texto do "Outro" só vale quando "outro" foi marcado.
  const outro = (chave: PerguntaComOutro) => (marcouOutro(dados[chave]) ? ouNulo(dados.outros[chave]) : null);
  return sql.begin(async (tx) => {
    await limitarTempo(tx as unknown as Sql);
    const contatoId = await salvarContato(tx as unknown as Sql, dados);
    const [linha] = await tx<{ codigo: string }[]>`
      insert into comercial.briefings
        (contato_id, segmento, segmento_outro, faturamento, origem_clientes, origem_outro, desafios, desafio_outro,
         frentes_indicadas, marketing, decisao, prazo, investimento, objetivo, fit, fit_pontos, fit_versao,
         consentimento_em, utm, pagina, referrer)
      values (
        ${contatoId},
        ${dados.segmento},
        ${outro("segmento")},
        ${dados.faturamento},
        ${dados.origem},
        ${outro("origem")},
        ${dados.desafio},
        ${outro("desafio")},
        ${indicarFrentes(dados.desafio)},
        ${dados.marketing},
        ${dados.decisao},
        ${dados.prazo},
        ${dados.investimento},
        ${ouNulo(dados.objetivo)},
        ${fit.fit},
        ${fit.pontos},
        ${fit.versao},
        now(),
        ${tx.json(dados.utm)},
        ${ouNulo(dados.pagina)},
        ${ouNulo(dados.referrer)}
      )
      on conflict (contato_id) do update set
        segmento = excluded.segmento,
        segmento_outro = excluded.segmento_outro,
        faturamento = excluded.faturamento,
        origem_clientes = excluded.origem_clientes,
        origem_outro = excluded.origem_outro,
        desafios = excluded.desafios,
        desafio_outro = excluded.desafio_outro,
        frentes_indicadas = excluded.frentes_indicadas,
        marketing = excluded.marketing,
        decisao = excluded.decisao,
        prazo = excluded.prazo,
        investimento = excluded.investimento,
        objetivo = coalesce(excluded.objetivo, comercial.briefings.objetivo),
        fit = excluded.fit,
        fit_pontos = excluded.fit_pontos,
        fit_versao = excluded.fit_versao,
        consentimento_em = excluded.consentimento_em,
        utm = excluded.utm,
        pagina = excluded.pagina,
        referrer = excluded.referrer,
        vezes = comercial.briefings.vezes + 1
      returning codigo
    `;
    await tx`update comercial.contatos set status = 'pendente-conversa' where id = ${contatoId} and status = 'novo'`;
    return linha.codigo;
  });
}

/**
 * Registra que a pessoa tocou em "Chamar um consultor no WhatsApp". Move
 * para "abriu-whatsapp" só quem ainda não foi atendido. Devolve se achou o código.
 */
export async function registrarWhatsappAberto(sql: Sql, codigo: string): Promise<boolean> {
  const linhas = await sql`
    update comercial.contatos c set
      whatsapp_aberto_em = now(),
      status = case when c.status in ('novo', 'pendente-conversa') then 'abriu-whatsapp' else c.status end
    from comercial.briefings b
    where b.codigo = ${codigo} and b.contato_id = c.id
    returning c.id
  `;
  return linhas.length > 0;
}
