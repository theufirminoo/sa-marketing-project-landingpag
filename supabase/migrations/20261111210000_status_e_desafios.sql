-- Acompanhamento do lead e briefing com vários desafios.
--
-- Status do contato (etapas do funil, na ordem):
--   novo               fez só o diagnóstico do site
--   pendente-conversa  concluiu o briefing e ainda não chamou a SA no WhatsApp
--   abriu-whatsapp     tocou em "Chamar um consultor" (abriu o WhatsApp; a SA
--                      confere se a mensagem chegou)
--   em-atendimento     um consultor já está conversando (a SA marca)
--   reuniao-marcada    agenda inicial marcada (a SA marca)
--   proposta, cliente, perdido
-- O site só move de "novo" para "pendente-conversa" e de lá para
-- "abriu-whatsapp"; o resto é da equipe. `status_em` registra quando o status
-- mudou, para achar o lead esfriando (visão `comercial.leads_esfriando`).

-- ------------------------------------------------------------------
-- Status do contato.
-- ------------------------------------------------------------------
alter table comercial.contatos drop constraint if exists contatos_status_check;
update comercial.contatos set status = 'em-atendimento' where status = 'em-contato';
alter table comercial.contatos add constraint contatos_status_check check (status in (
  'novo', 'pendente-conversa', 'abriu-whatsapp', 'em-atendimento',
  'reuniao-marcada', 'proposta', 'cliente', 'perdido'
));
alter table comercial.contatos add column if not exists status_em timestamptz not null default now();
alter table comercial.contatos add column if not exists whatsapp_aberto_em timestamptz;

create or replace function comercial.marcar_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.status_em := now();
  end if;
  return new;
end;
$$;

drop trigger if exists contatos_status on comercial.contatos;
create trigger contatos_status
  before update on comercial.contatos
  for each row execute function comercial.marcar_status();

create index if not exists contatos_esfriando_idx on comercial.contatos (status_em)
  where status in ('pendente-conversa', 'abriu-whatsapp');

-- ------------------------------------------------------------------
-- Briefing: vários desafios, frentes indicadas, aceite e código do clique.
-- ------------------------------------------------------------------
drop view if exists comercial.leads_esfriando;
drop view if exists comercial.leads;

alter table comercial.briefings add column if not exists desafios text[] not null default '{}';
alter table comercial.briefings add column if not exists frentes_indicadas text[] not null default '{}';
-- Briefings gravados antes desta mudança: o desafio único vira lista, com a
-- frente correspondente (mesma regra de src/lib/briefing.ts).
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'comercial' and table_name = 'briefings' and column_name = 'desafio') then
    execute $sql$
      update comercial.briefings set
        desafios = array[desafio],
        frentes_indicadas = array[case
          when desafio in ('atrair-clientes', 'seguidores-nao-compram') then 'social'
          when desafio = 'imagem-da-marca' then 'studio'
          when desafio = 'processos-manuais' then 'tech'
          else 'consultoria' end]
      where cardinality(desafios) = 0
    $sql$;
  end if;
end;
$$;
update comercial.contatos c set status = 'pendente-conversa'
  where c.status = 'novo' and exists (select 1 from comercial.briefings b where b.contato_id = c.id);
alter table comercial.briefings drop column if exists desafio;
alter table comercial.briefings drop constraint if exists briefings_desafios_check;
alter table comercial.briefings add constraint briefings_desafios_check check (
  cardinality(desafios) between 1 and 7
  and desafios <@ array['sem-plano','converter','atrair-clientes','seguidores-nao-compram','imagem-da-marca','processos-manuais','outro']::text[]
);
-- Quando a pessoa marcou o aceite na abertura do briefing (LGPD).
alter table comercial.briefings add column if not exists consentimento_em timestamptz not null default now();
-- Código que a tela final usa para avisar o clique no WhatsApp sem expor o número.
alter table comercial.briefings add column if not exists codigo uuid not null default gen_random_uuid();
create unique index if not exists briefings_codigo_idx on comercial.briefings (codigo);

-- ------------------------------------------------------------------
-- Visões do painel.
-- ------------------------------------------------------------------
create view comercial.leads
with (security_invoker = true)
as
select
  c.id, c.nome, c.whatsapp, c.empresa, c.instagram,
  c.status,
  round(extract(epoch from now() - c.status_em) / 3600)::int as horas_no_status,
  b.fit, b.fit_pontos, b.investimento,
  b.desafios, b.desafio_outro,
  b.frentes_indicadas,
  b.prazo, b.decisao, b.objetivo,
  coalesce(b.faturamento, d.faturamento) as faturamento,
  coalesce(b.segmento_outro, b.segmento) as segmento,
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

-- Quem concluiu o briefing e está há mais de 2 horas sem atendimento.
create or replace view comercial.leads_esfriando
with (security_invoker = true)
as
select * from comercial.leads
where status in ('pendente-conversa', 'abriu-whatsapp') and horas_no_status >= 2
order by horas_no_status desc;
