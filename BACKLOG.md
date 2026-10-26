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

## Segurança (da validação de 24/10/2026, `docs/VALIDACAO.md`)

- [ ] CSP de scripts com nonce (`script-src`), depois de definir o ID do GTM. Hoje a CSP cobre moldura, base, form, object e conteúdo misto.
- [ ] HSTS com `includeSubDomains; preload` no domínio próprio, depois de confirmar HTTPS em produção.
- [ ] Regras do Vercel Firewall para limite global em `/api/lead` e `/api/eventos` (o limite atual vale por instância).
- [ ] Dependabot ou Renovate no GitHub para atualizar dependências com falha de segurança.

## Depois de publicar

- [ ] Monitoramento de disponibilidade com alerta (UptimeRobot ou Better Stack).
- [ ] Google Search Console: verificar o domínio, enviar o sitemap e acompanhar Core Web Vitals reais (LCP, INP, CLS no p75).
- [ ] Monitoramento de erros (as métricas próprias já registram os erros do navegador; Sentry é opcional).
- [ ] Teste em iPhone (Safari), Samsung Internet e com VoiceOver/TalkBack.
- [ ] Revisão trimestral: links quebrados, acessos à Vercel/GitHub/Registro.br/CRM, ex-prestadores, política de privacidade e dados comerciais.
- [ ] Definir o responsável pela manutenção (SA ou M9 Studio Tech).

## Diagnóstico: receber os leads no site

Hoje `POST /api/lead` valida e só encaminha para `CRM_WEBHOOK_URL`, que ainda
não existe: sem ela, o lead é descartado. O que chega de fato é a mensagem que
a pessoa envia no WhatsApp (se ela enviar). Por isso a tela de resultado diz
que as respostas vão na mensagem, e não que a SA já recebeu.

- [ ] Banco de dados para os leads (tabela `leads` no mesmo Postgres das métricas, ou um CRM com webhook).
- [ ] Gravar em `/api/lead` com `after()`: nome, WhatsApp, empresa, Instagram, respostas, frentes recomendadas, origem (utm) e data.
- [ ] Aviso para a SA a cada lead novo (e-mail ou WhatsApp interno).
- [ ] Acesso restrito aos leads (painel protegido ou o próprio CRM) e prazo de retenção na política de privacidade.
- [ ] Depois de ligado, voltar o texto do resultado para "A SA já recebeu suas respostas".
