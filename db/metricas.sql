-- Métricas próprias da landing page da SA.
-- Rode uma vez no Postgres (Neon, Supabase ou Vercel Postgres) e ponha a URL
-- de conexão em EVENTOS_DATABASE_URL. Só chegam eventos de quem clicou em
-- "Aceitar". Nada aqui identifica a pessoa: sem nome, WhatsApp, e-mail ou IP.

create table if not exists eventos (
  id            bigint generated always as identity primary key,
  recebido_em   timestamptz not null default now(),
  ocorrido_em   timestamptz not null,
  t_ms          integer not null,           -- ms desde o início da visita à página
  tipo          text not null,              -- visualizacao, secao, rolagem, clique, diagnostico, vital, video, slide, erro, saida
  visitante_id  uuid not null,              -- código aleatório deste navegador
  sessao_id     uuid not null,              -- código aleatório desta aba
  visita_n      integer not null,           -- 1 = primeira visita deste navegador
  pagina        text not null,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  tem_fbclid    boolean not null default false,
  tem_gclid     boolean not null default false,
  dados         jsonb not null default '{}',  -- detalhes do evento
  contexto      jsonb not null default '{}',  -- idioma, fuso, tela, conexão, preferências
  pais          text,
  regiao        text,
  cidade        text,
  ip_hash       text not null,              -- código do IP com sal; muda todo dia
  navegador     text,
  sistema       text,
  dispositivo   text,
  robo          boolean not null default false,
  user_agent    text
);

create index if not exists eventos_recebido_em on eventos (recebido_em);
create index if not exists eventos_tipo_recebido on eventos (tipo, recebido_em);
create index if not exists eventos_sessao on eventos (sessao_id);
create index if not exists eventos_visitante on eventos (visitante_id);

-- Retenção: 13 meses (política de privacidade). Agende diariamente
-- (pg_cron, Supabase Scheduled Function ou Vercel Cron):
--   delete from eventos where recebido_em < now() - interval '13 months';

-- ------------------------------------------------------------------
-- Visões para o painel interno (Metabase, Looker Studio, Grafana...)
-- ------------------------------------------------------------------

-- Visitas, visitantes e novos por dia.
create or replace view metricas_dia as
select
  date_trunc('day', recebido_em at time zone 'America/Sao_Paulo')::date as dia,
  count(distinct sessao_id)                                              as visitas,
  count(distinct visitante_id)                                           as visitantes,
  count(distinct visitante_id) filter (where visita_n = 1)               as novos,
  count(*) filter (where tipo = 'clique' and dados ? 'diagnostico' and dados->>'diagnostico' is not null) as cliques_diagnostico,
  count(*) filter (where tipo = 'clique' and dados->>'whatsapp' is not null) as cliques_whatsapp
from eventos
where not robo
group by 1
order by 1 desc;

-- De onde vêm as visitas.
create or replace view metricas_origem as
select
  coalesce(utm_source, case when referrer is null or referrer = '' then '(direto)' else split_part(split_part(referrer, '://', 2), '/', 1) end) as origem,
  coalesce(utm_medium, '-')   as meio,
  coalesce(utm_campaign, '-') as campanha,
  count(distinct sessao_id)   as visitas
from eventos
where tipo = 'visualizacao' and not robo
group by 1, 2, 3
order by visitas desc;

-- Funil do diagnóstico por sessão.
create or replace view metricas_funil as
select
  count(distinct sessao_id)                                                                          as visitas,
  count(distinct sessao_id) filter (where tipo = 'diagnostico' and dados->>'evento' = 'diagnostico_aberto') as abriu_diagnostico,
  count(distinct sessao_id) filter (where tipo = 'diagnostico' and dados->>'evento' = 'diagnostico_etapa' and (dados->>'etapa')::int >= 1) as respondeu_1,
  count(distinct sessao_id) filter (where tipo = 'diagnostico' and dados->>'evento' = 'diagnostico_etapa' and (dados->>'etapa')::int >= 3) as respondeu_3,
  count(distinct sessao_id) filter (where tipo = 'diagnostico' and dados->>'evento' = 'lead_enviado')       as enviou_lead,
  count(distinct sessao_id) filter (where tipo = 'diagnostico' and dados->>'evento' = 'whatsapp_aberto')    as abriu_whatsapp
from eventos
where not robo;

-- Seções mais vistas e tempo médio em cada uma.
create or replace view metricas_secoes as
select
  dados->>'secao'                                                         as secao,
  count(distinct sessao_id) filter (where dados->>'acao' = 'viu')         as visitas_que_viram,
  round(avg((dados->>'ms')::numeric) filter (where dados->>'acao' = 'tempo') / 1000, 1) as segundos_medios
from eventos
where tipo = 'secao' and not robo
group by 1
order by visitas_que_viram desc;

-- Botões e links mais clicados.
create or replace view metricas_cliques as
select dados->>'secao' as secao, dados->>'texto' as texto, dados->>'destino' as destino, count(*) as cliques
from eventos
where tipo = 'clique' and not robo
group by 1, 2, 3
order by cliques desc;

-- Aparelhos, sistemas e navegadores.
create or replace view metricas_aparelhos as
select dispositivo, sistema, navegador, count(distinct sessao_id) as visitas
from eventos
where tipo = 'visualizacao' and not robo
group by 1, 2, 3
order by visitas desc;

-- Cidades.
create or replace view metricas_local as
select pais, regiao, cidade, count(distinct sessao_id) as visitas
from eventos
where tipo = 'visualizacao' and not robo
group by 1, 2, 3
order by visitas desc;

-- Rolagem e tempo ativo por visita.
create or replace view metricas_engajamento as
select
  date_trunc('day', recebido_em at time zone 'America/Sao_Paulo')::date as dia,
  round(avg((dados->>'ativoMs')::numeric) / 1000, 1)                     as segundos_ativos_medios,
  round(avg((dados->>'rolagemMax')::numeric), 1)                          as rolagem_media_pct
from eventos
where tipo = 'saida' and not robo
group by 1
order by 1 desc;

-- Velocidade real da página (percentil 75, como o Google mede).
create or replace view metricas_velocidade as
select
  dispositivo,
  percentile_cont(0.75) within group (order by (dados->>'lcp')::numeric) as lcp_p75_ms,
  percentile_cont(0.75) within group (order by (dados->>'cls')::numeric) as cls_p75,
  percentile_cont(0.75) within group (order by (dados->>'inp')::numeric) as inp_p75_ms,
  count(*) as amostras
from eventos
where tipo = 'vital' and not robo
group by 1;
