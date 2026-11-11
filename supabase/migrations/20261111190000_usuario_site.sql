-- Usuário próprio do site (sa_site), com o mínimo para gravar leads.
--
-- O site entra no banco com este usuário, não com o `postgres`: se a
-- DATABASE_URL vazar, quem a tiver só lê e grava as tabelas comerciais,
-- sem apagar nada e sem tocar em Auth, Storage ou outros esquemas.
-- A senha não fica no Git: é definida à parte, com
--   alter role sa_site with password '...';
-- e vai só na DATABASE_URL da Vercel.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'sa_site') then
    create role sa_site login noinherit;
  end if;
end;
$$;

grant usage on schema comercial to sa_site;
grant select, insert, update on comercial.contatos, comercial.diagnosticos, comercial.briefings, comercial.manutencao to sa_site;
-- Os gatilhos de aviso rodam como sa_site e inserem na fila.
grant insert on comercial.avisos to sa_site;

-- O RLS segue ligado: as chaves públicas continuam sem acesso. Estas
-- políticas liberam só o sa_site (DELETE já fica de fora pelos GRANTs).
drop policy if exists site_grava on comercial.contatos;
create policy site_grava on comercial.contatos for all to sa_site using (true) with check (true);
drop policy if exists site_grava on comercial.diagnosticos;
create policy site_grava on comercial.diagnosticos for all to sa_site using (true) with check (true);
drop policy if exists site_grava on comercial.briefings;
create policy site_grava on comercial.briefings for all to sa_site using (true) with check (true);
drop policy if exists site_grava on comercial.manutencao;
create policy site_grava on comercial.manutencao for all to sa_site using (true) with check (true);
drop policy if exists site_avisa on comercial.avisos;
create policy site_avisa on comercial.avisos for insert to sa_site with check (true);
