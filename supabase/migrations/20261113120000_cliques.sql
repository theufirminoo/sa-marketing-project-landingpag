-- Cliques da página da bio (bio.saagencia.com.br), por dia, origem e destino.
-- Só contagem: nada sobre quem clicou. A rota /ir/<destino> soma 1 e
-- redireciona. Leads que vêm desses cliques chegam com utm_medium = 'bio'.

create table if not exists comercial.cliques (
  dia     date not null,
  origem  text not null check (char_length(origem) <= 40),
  destino text not null check (destino in ('diagnostico', 'whatsapp', 'site')),
  total   integer not null default 0 check (total >= 0),
  primary key (dia, origem, destino)
);

alter table comercial.cliques enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on comercial.cliques from anon, authenticated';
  end if;
end;
$$;

grant select, insert, update on comercial.cliques to sa_site;
drop policy if exists site_conta on comercial.cliques;
create policy site_conta on comercial.cliques for all to sa_site using (true) with check (true);

-- Resumo para o painel: cliques dos últimos 30 dias por destino.
create or replace view comercial.cliques_30_dias
with (security_invoker = true)
as
select origem, destino, sum(total)::int as cliques
from comercial.cliques
where dia >= (now() at time zone 'America/Sao_Paulo')::date - 30
group by origem, destino
order by cliques desc;
