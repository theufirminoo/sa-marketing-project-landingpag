-- Base comercial da SA: contatos, diagnósticos e briefings.
--
-- Fica no esquema `comercial`, fora do `public`, para não aparecer na API
-- automática do Supabase (Data API). Só o servidor do site grava, pela
-- conexão Postgres em DATABASE_URL. O RLS fica ligado e sem política:
-- as chaves públicas (anon e authenticated) não leem nem gravam nada.
-- Quando o sistema da SA nascer, ele cria as políticas para a equipe
-- (Supabase Auth) sem mexer nestas tabelas.
--
-- Identificador único: o WhatsApp em formato internacional (55 + DDD +
-- número). A mesma pessoa que refaz o diagnóstico ou o briefing atualiza a
-- linha que já existe e soma 1 em `vezes`, sem criar duplicata.

create schema if not exists comercial;
revoke all on schema comercial from public;

-- ------------------------------------------------------------------
-- Atualiza `atualizado_em` em toda alteração.
-- ------------------------------------------------------------------
create or replace function comercial.marcar_atualizacao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- ------------------------------------------------------------------
-- Contatos: uma linha por WhatsApp.
-- ------------------------------------------------------------------
create table if not exists comercial.contatos (
  id             bigint generated always as identity primary key,
  whatsapp       text not null unique
                 check (whatsapp ~ '^55[1-9][0-9][0-9]{8,9}$'),
  nome           text not null check (char_length(nome) between 2 and 80),
  empresa        text check (char_length(empresa) <= 120),
  instagram      text check (char_length(instagram) <= 81), -- @ + até 80
  -- Etapa no funil comercial. O sistema futuro move o contato entre elas.
  status         text not null default 'novo'
                 check (status in ('novo', 'em-contato', 'reuniao-marcada', 'proposta', 'cliente', 'perdido')),
  -- Quem da SA cuida do contato (futuro: id do Supabase Auth).
  responsavel_id uuid,
  observacoes    text,
  -- De onde a pessoa veio na primeira vez (utm, página, referrer).
  primeira_origem jsonb not null default '{}',
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create index if not exists contatos_status_idx on comercial.contatos (status, criado_em desc);

drop trigger if exists contatos_atualizacao on comercial.contatos;
create trigger contatos_atualizacao
  before update on comercial.contatos
  for each row execute function comercial.marcar_atualizacao();

-- ------------------------------------------------------------------
-- Diagnóstico do site: um por contato, a última resposta vale.
-- ------------------------------------------------------------------
create table if not exists comercial.diagnosticos (
  id                   bigint generated always as identity primary key,
  contato_id           bigint not null unique references comercial.contatos (id) on delete cascade,
  trava                text not null,
  fase                 text not null,
  faturamento          text not null check (faturamento in ('ate-10', '10-20', '20-50', '50-200', 'acima-200')),
  frente_de_interesse  text,
  frentes_recomendadas text[] not null default '{}',
  utm                  jsonb not null default '{}',
  pagina               text,
  referrer             text,
  vezes                integer not null default 1 check (vezes >= 1),
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now()
);

drop trigger if exists diagnosticos_atualizacao on comercial.diagnosticos;
create trigger diagnosticos_atualizacao
  before update on comercial.diagnosticos
  for each row execute function comercial.marcar_atualizacao();

-- ------------------------------------------------------------------
-- Briefing antes da reunião: um por contato, a última resposta vale.
-- O FIT é calculado no servidor e nunca aparece para o cliente.
-- ------------------------------------------------------------------
create table if not exists comercial.briefings (
  id             bigint generated always as identity primary key,
  contato_id     bigint not null unique references comercial.contatos (id) on delete cascade,
  segmento text not null check (segmento in ('servicos','comercio','saude-estetica','alimentacao','educacao','industria','outro')),
  segmento_outro text check (char_length(segmento_outro) <= 80),
  faturamento    text not null check (faturamento in ('ate-10', '10-20', '20-50', '50-200', 'acima-200')),
  origem_clientes text not null check (origem_clientes in ('indicacao','redes-sociais','google','anuncios','loja-fisica','outro')),
  origem_outro text check (char_length(origem_outro) <= 80),
  desafio text not null check (desafio in ('sem-plano','converter','atrair-clientes','seguidores-nao-compram','imagem-da-marca','processos-manuais','outro')),
  desafio_outro text check (char_length(desafio_outro) <= 80),
  marketing text not null check (marketing in ('ninguem','eu-mesmo','agencia-ou-freela','equipe-interna')),
  decisao text not null check (decisao in ('eu','com-socio','outra-pessoa')),
  prazo text not null check (prazo in ('agora','tres-meses','pesquisando')),
  investimento text not null check (investimento in ('ate-1500','1500-3000','3000-6000','acima-6000')),
  objetivo       text check (char_length(objetivo) <= 500),
  fit            text not null check (fit in ('alto', 'medio', 'baixo')),
  fit_pontos     smallint not null check (fit_pontos >= 0),
  -- Versão da regra de pontuação (src/lib/fit.ts). Permite recalcular depois.
  fit_versao     smallint not null default 1,
  utm            jsonb not null default '{}',
  pagina         text,
  referrer       text,
  vezes          integer not null default 1 check (vezes >= 1),
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create index if not exists briefings_fit_idx on comercial.briefings (fit, criado_em desc);

drop trigger if exists briefings_atualizacao on comercial.briefings;
create trigger briefings_atualizacao
  before update on comercial.briefings
  for each row execute function comercial.marcar_atualizacao();

-- ------------------------------------------------------------------
-- Fila de avisos: cada diagnóstico ou briefing gravado entra aqui.
-- Hoje ninguém consome. Depois, o Resend (e-mail para a SA) e o sistema
-- leem as linhas com `processado_em` nulo e marcam ao terminar.
-- ------------------------------------------------------------------
create table if not exists comercial.avisos (
  id            bigint generated always as identity primary key,
  tipo          text not null check (tipo in ('diagnostico', 'briefing')),
  contato_id    bigint not null references comercial.contatos (id) on delete cascade,
  repetido      boolean not null default false,
  criado_em     timestamptz not null default now(),
  processado_em timestamptz
);

create index if not exists avisos_pendentes_idx on comercial.avisos (criado_em) where processado_em is null;
create index if not exists avisos_contato_idx on comercial.avisos (contato_id);

create or replace function comercial.registrar_aviso()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into comercial.avisos (tipo, contato_id, repetido)
  values (tg_argv[0], new.contato_id, tg_op = 'UPDATE');
  return new;
end;
$$;

-- Só envio novo gera aviso: a primeira gravação e cada refação (vezes muda).
-- Edição da equipe ou recálculo do FIT não avisam ninguém.
drop trigger if exists diagnosticos_aviso on comercial.diagnosticos;
drop trigger if exists diagnosticos_aviso_novo on comercial.diagnosticos;
create trigger diagnosticos_aviso_novo
  after insert on comercial.diagnosticos
  for each row execute function comercial.registrar_aviso('diagnostico');
drop trigger if exists diagnosticos_aviso_refeito on comercial.diagnosticos;
create trigger diagnosticos_aviso_refeito
  after update on comercial.diagnosticos
  for each row when (old.vezes is distinct from new.vezes)
  execute function comercial.registrar_aviso('diagnostico');

drop trigger if exists briefings_aviso on comercial.briefings;
drop trigger if exists briefings_aviso_novo on comercial.briefings;
create trigger briefings_aviso_novo
  after insert on comercial.briefings
  for each row execute function comercial.registrar_aviso('briefing');
drop trigger if exists briefings_aviso_refeito on comercial.briefings;
create trigger briefings_aviso_refeito
  after update on comercial.briefings
  for each row when (old.vezes is distinct from new.vezes)
  execute function comercial.registrar_aviso('briefing');

-- ------------------------------------------------------------------
-- Sinal de vida: o Cron da Vercel grava aqui a cada 6 dias para o plano
-- grátis do Supabase não pausar o projeto (pausa com 7 dias sem uso).
-- Uma linha só; `ultimo_sinal` mostra se o Cron está funcionando.
-- ------------------------------------------------------------------
create table if not exists comercial.manutencao (
  id           smallint primary key check (id = 1),
  ultimo_sinal timestamptz not null default now(),
  sinais       integer not null default 1
);

-- ------------------------------------------------------------------
-- Visão para o painel do Supabase: um contato por linha, com o que ele
-- respondeu. Mais quentes primeiro.
-- ------------------------------------------------------------------
create or replace view comercial.leads
with (security_invoker = true)
as
select
  c.id,
  c.nome,
  c.whatsapp,
  c.empresa,
  c.instagram,
  c.status,
  b.fit,
  b.fit_pontos,
  b.investimento,
  coalesce(b.desafio_outro, b.desafio) as desafio,
  b.prazo,
  b.decisao,
  b.objetivo,
  coalesce(b.faturamento, d.faturamento) as faturamento,
  coalesce(b.segmento_outro, b.segmento) as segmento,
  d.trava,
  d.frentes_recomendadas,
  d.vezes as diagnosticos_feitos,
  b.vezes as briefings_feitos,
  d.atualizado_em as diagnostico_em,
  b.atualizado_em as briefing_em,
  c.criado_em
from comercial.contatos c
left join comercial.diagnosticos d on d.contato_id = c.id
left join comercial.briefings b on b.contato_id = c.id
order by
  case b.fit when 'alto' then 0 when 'medio' then 1 when 'baixo' then 2 else 3 end,
  greatest(c.atualizado_em, d.atualizado_em, b.atualizado_em) desc;

-- ------------------------------------------------------------------
-- Segurança: RLS ligado em tudo e nenhum acesso para as chaves públicas.
-- ------------------------------------------------------------------
alter table comercial.contatos enable row level security;
alter table comercial.diagnosticos enable row level security;
alter table comercial.briefings enable row level security;
alter table comercial.avisos enable row level security;
alter table comercial.manutencao enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all tables in schema comercial from anon, authenticated';
    execute 'revoke all on schema comercial from anon, authenticated';
  end if;
end;
$$;
