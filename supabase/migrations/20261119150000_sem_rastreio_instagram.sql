-- Sai o rastreio do toque no Instagram (instagram_clicou_em, instagram_tela_em):
-- no celular, o Instagram abre o aplicativo e a pessoa não volta. O Instagram
-- passou a ser o último botão da tela final, depois do WhatsApp, sem registro.
-- Fica contatos.segue_instagram, que a equipe marca à mão se quiser.

drop view if exists comercial.leads_esfriando;
drop view if exists comercial.leads;

alter table comercial.briefings drop column if exists instagram_clicou_em;
alter table comercial.briefings drop column if exists instagram_tela_em;

create view comercial.leads
with (security_invoker = true)
as
select
  c.id, c.nome, c.whatsapp, c.empresa, c.instagram,
  c.status,
  round(extract(epoch from now() - c.status_em) / 3600)::int as horas_no_status,
  b.fit, b.fit_pontos,
  coalesce(b.segmento_outro, b.segmento) as segmento,
  b.tempo_mercado,
  b.produto_principal,
  coalesce(b.faturamento, d.faturamento) as faturamento,
  coalesce(b.origem_outro, b.origem_clientes) as origem_clientes,
  b.estrategia, b.marketing,
  b.desafios, b.desafio_outro,
  b.frentes_indicadas,
  b.decisao, b.prazo, b.investimento, b.objetivo,
  c.segue_instagram,
  d.trava, d.frentes_recomendadas,
  d.vezes as diagnosticos_feitos,
  b.vezes as briefings_feitos,
  d.atualizado_em as diagnostico_em,
  b.atualizado_em as briefing_em,
  c.whatsapp_aberto_em,
  c.criado_em
from comercial.contatos c
left join comercial.diagnosticos d on d.contato_id = c.id
left join comercial.briefings b on b.contato_id = c.id
order by
  case b.fit when 'alto' then 0 when 'medio' then 1 when 'baixo' then 2 else 3 end,
  greatest(c.atualizado_em, d.atualizado_em, b.atualizado_em) desc;

create view comercial.leads_esfriando
with (security_invoker = true)
as
select * from comercial.leads
where status in ('pendente-conversa', 'abriu-whatsapp') and horas_no_status >= 2
order by horas_no_status desc;
