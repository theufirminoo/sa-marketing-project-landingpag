# Backlog do site

Melhorias futuras, fora do escopo atual. **Ao revisar o site inteiro, leia
este arquivo primeiro e execute o que estiver pronto para entrar.** Marque
`[x]` ao concluir e anote a data.

## Métricas próprias (gravação)

O coletor já existe e só roda depois do "Aceitar" (`src/lib/metricas/`,
`POST /api/eventos`). Hoje os eventos chegam e são descartados, porque não há
banco ligado. Para ativar:

- [ ] Criar um Postgres (Neon, Supabase ou Vercel Postgres).
- [ ] Rodar `db/metricas.sql` (tabela `eventos` e 9 visões de métricas).
- [ ] Pôr `EVENTOS_DATABASE_URL` e `EVENTOS_SAL` nas variáveis da Vercel.
- [ ] Agendar a limpeza de 13 meses (comando no topo de `db/metricas.sql`).
- [ ] Painel interno das métricas: página protegida `/painel` ou Metabase/Looker Studio ligado às visões.
- [ ] Conferir se a política de privacidade continua batendo com o que é coletado.
