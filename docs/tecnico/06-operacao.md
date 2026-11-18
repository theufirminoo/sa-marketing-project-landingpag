# 06. Operação e manutenção

## Publicar

1. Mudar o código e rodar `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build`.
2. Commit na `main` (sem marcas de IA) e push. A Vercel publica sozinha em 1 a 2 minutos.
3. Se a Vercel não publicar (já aconteceu uma vez), disparar o deploy do commit pelo painel (Deployments → Redeploy) ou pelo conector.
4. Mudou o banco? Aplicar a migração **antes** de publicar o código.
5. Mudou uma variável na Vercel? Ela só vale no próximo deploy: fazer Redeploy.

## Variáveis de ambiente (Vercel → Settings → Environment Variables, Production)

| Variável | Tipo | Para quê |
|---|---|---|
| `DATABASE_URL` | Sensível | Banco comercial (usuário `sa_site`, pooler 6543) |
| `CRON_SECRET` | Sensível | Senha do cron `/api/manter-banco` |
| `RESEND_API_KEY` | Sensível | Chave "site-sa (Vercel produção)": só envio, só pelo domínio `envio` |
| `AVISO_EMAIL_PARA` | Texto | `contato@saagencia.com.br` |
| `AVISO_EMAIL_DE` | Texto | `SA Marketing <avisos@envio.saagencia.com.br>` |
| `SUPABASE_DB_PASSWORD` | Criptografada, só Development | Guardada do projeto antigo dos EUA; pode ser apagada |
| `NEXT_PUBLIC_SITE_URL` | Texto (opcional) | Padrão `https://saagencia.com.br` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Texto (opcional) | Padrão `5538998934902` |
| `CRM_WEBHOOK_URL`, `CRM_WEBHOOK_TOKEN` | (vazias) | CRM futuro |
| `EVENTOS_DATABASE_URL`, `EVENTOS_SAL` | (vazias) | Métricas próprias (no backlog) |
| `NEXT_PUBLIC_GTM_ID` | (vazia) | Google Tag Manager, se um dia usar |

Modelo em `.env.example`.

## Tarefas comuns

| Quero… | Onde e como |
|---|---|
| Mudar um texto | `src/content/site.ts` |
| Mudar opções ou perguntas do briefing | Ver "acrescentar uma pergunta" em 04; banco por migração |
| Mudar a regra do FIT | `src/lib/fit.ts`, subir `FIT_VERSAO`, ajustar testes e a tabela em 03 |
| Mudar qual frente cada problema indica | `briefingOpcoes.desafio` (campo `frente`) em `site.ts` |
| Mudar quem recebe o e-mail | `AVISO_EMAIL_PARA` na Vercel + Redeploy |
| Ver os leads | Supabase → Table Editor → esquema `comercial` → `leads` |
| Marcar andamento de um lead | Editar `status` em `contatos` (ou SQL em 05) |
| Novo subdomínio | Página em `src/app/<nome>/page.tsx`; host em `SUBDOMINIOS` (`src/proxy.ts`); domínio no projeto Vercel; CNAME `<nome>` → `31f8c9f59d8664a0.vercel-dns-017.com.` no Registro.br; atualizar `docs/DNS.md` |
| Novo botão na bio | `bio.botoes` (site.ts), destino em `DESTINOS_LINK` (opcoes.ts) e `urlDestino` (ir.ts), CHECK de `cliques.destino` por migração |
| Trocar a chave do Resend | Resend → API Keys → criar "Sending access" restrita a `envio.saagencia.com.br`; trocar `RESEND_API_KEY`; Redeploy; apagar a antiga |
| Trocar a senha do banco do site | No SQL Editor: `alter role sa_site with password '...'`; atualizar `DATABASE_URL`; Redeploy |

## LGPD: pedido de exclusão

1. Confirmar a identidade pelo próprio WhatsApp da pessoa.
2. No SQL Editor: `delete from comercial.contatos where whatsapp = '55DDDNUMERO';` (apaga diagnóstico, briefing e avisos junto).
3. Apagar o e-mail do briefing na caixa `contato@` e a conversa no CRM, se houver.

## Rotina

| Quando | O quê |
|---|---|
| Diário | Olhar `leads_esfriando` e responder quem está esperando |
| Semanal | Conferir `avisos` com `processado_em` vazio (e-mail que não saiu) |
| Mensal | `comercial.manutencao.ultimo_sinal` com menos de 6 dias (cron vivo); uso do Resend (limite 3.000/mês) |
| Trimestral | Revisar acessos (Vercel, Supabase, Resend, Registro.br, GitHub), trocar chaves, revisar a política |

## Problemas e soluções

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Briefing termina em "falta só enviar suas respostas" | Banco fora, pausado ou `DATABASE_URL` errada | Supabase → projeto pausado? "Restore". Conferir `ultimo_sinal` e os logs da Vercel (`[briefing] Falha ao gravar`) |
| Briefing gravado, sem e-mail | `RESEND_API_KEY` ausente/errada, domínio não verificado, limite | Logs da Vercel (`[email]`); Resend → Emails/Logs; domínio "verified" |
| E-mail no spam | Reputação inicial | Marcar "Não é spam"; DMARC já está ativo |
| Site fora em um subdomínio | DNS ou domínio na Vercel | Vercel → Domains (Valid?); `docs/DNS.md` |
| Supabase pausou | Cron parado ou `CRON_SECRET` errado | Restaurar o projeto; conferir o cron em Vercel → Settings → Cron Jobs |
| Push não publicou | Integração Git da Vercel | Redeploy manual; Vercel → Settings → Git |
| Erro "violates check constraint" | Valor novo sem migração | Criar migração que aceite o valor |
