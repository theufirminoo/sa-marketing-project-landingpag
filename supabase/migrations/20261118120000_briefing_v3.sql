-- Briefing v3: tempo de mercado, produto que mais vende, estratégia de
-- marketing, impacto dos problemas, novas faixas de investimento e nova lista
-- de problemas e de canais. As respostas antigas continuam válidas (os
-- valores de antes seguem aceitos; `fit_versao` diz qual regra valia).
-- Também deixa o site marcar o aviso por e-mail como enviado.

alter table comercial.briefings add column if not exists tempo_mercado text
  check (tempo_mercado in ('menos-1', '1-3', '3-5', 'mais-5'));
alter table comercial.briefings add column if not exists produto_principal text
  check (char_length(produto_principal) <= 120);
alter table comercial.briefings add column if not exists estrategia text
  check (estrategia in ('sim', 'nao', 'nao-mas-pretendo'));
alter table comercial.briefings add column if not exists impacto text
  check (char_length(impacto) <= 500);

-- "Quem cuida do marketing" só existe quando há estratégia.
alter table comercial.briefings alter column marketing drop not null;

alter table comercial.briefings drop constraint if exists briefings_origem_clientes_check;
alter table comercial.briefings add constraint briefings_origem_clientes_check check (origem_clientes in (
  'indicacao', 'redes-sociais', 'google', 'trafego-pago', 'prospeccao', 'vendedores', 'loja-fisica', 'outro',
  'anuncios' -- versão anterior
));

alter table comercial.briefings drop constraint if exists briefings_desafios_check;
alter table comercial.briefings add constraint briefings_desafios_check check (
  cardinality(desafios) between 1 and 11
  and desafios <@ array[
    'poucas-vendas', 'poucos-clientes', 'gerar-leads', 'instagram-sem-resultado', 'presenca-digital',
    'posicionamento', 'trafego-sem-resultado', 'site-inadequado', 'processo-comercial', 'falta-estrategia', 'outro',
    -- versão anterior
    'sem-plano', 'converter', 'atrair-clientes', 'seguidores-nao-compram', 'imagem-da-marca', 'processos-manuais'
  ]::text[]
);

alter table comercial.briefings drop constraint if exists briefings_investimento_check;
alter table comercial.briefings add constraint briefings_investimento_check check (investimento in (
  'ate-1000', '1000-2500', '2500-5000', '5000-10000', 'acima-10000', 'nao-sei',
  'ate-1500', '1500-3000', '3000-6000', 'acima-6000' -- versão anterior
));

-- Aviso por e-mail: o site lê e marca a fila depois de enviar.
grant select, update (processado_em) on comercial.avisos to sa_site;
drop policy if exists site_marca_aviso on comercial.avisos;
create policy site_marca_aviso on comercial.avisos for select to sa_site using (true);
drop policy if exists site_atualiza_aviso on comercial.avisos;
create policy site_atualiza_aviso on comercial.avisos for update to sa_site using (true) with check (true);

-- Visões com os campos novos.
drop view if exists comercial.leads_esfriando;
drop view if exists comercial.leads;

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
  b.desafios, b.desafio_outro, b.impacto,
  b.frentes_indicadas,
  b.decisao, b.prazo, b.investimento, b.objetivo,
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
