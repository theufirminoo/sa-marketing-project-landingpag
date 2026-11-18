# 07. Infraestrutura e DNS

## Domínio e DNS

- Registro e DNS no **Registro.br** (servidores `b.sec.dns.br`, `c.sec.dns.br`), modo avançado.
- Passar o DNS para a Vercel foi tentado em 18/11/2026 e não é possível pelo
  fluxo atual: o Registro.br só aceita servidores que já respondam pelo
  domínio, e a Vercel só cria a zona depois da troca.
- Lista completa e atual dos registros: `docs/DNS.md`.
- No Registro.br, o MX leva a prioridade dentro de "Dados" (`10 servidor`).

## Vercel

- Equipe "Matheus' projects" (`m9-studio`), projeto `sa-marketing-project-landingpag` (`prj_B4o9sq6FhRFgcEzKmXKpfSz3fjSu`).
- Domínios: `saagencia.com.br`, `www`, `briefing`, `bio`.
- Git: `theufirminoo/sa-marketing-project-landingpag`, branch de produção `main`.
- Funções em `gru1`; cron em `vercel.json`. Plano Hobby (assinar o Pro antes de uso comercial em escala).

## Supabase

- Organização "SA Marketing", projeto "SA Marketing" (`yzarinssfqttxiqmkveo`), `sa-east-1`, Free.
- O plano grátis pausa com 7 dias sem uso: o cron `/api/manter-banco` impede.
- Sem backup no Free: assinar o Pro com volume de leads reais.
- Projeto antigo "theufirminoo's Project" (EUA, pausado, vazio): pode ser apagado.

## Resend

- Domínio `envio.saagencia.com.br`, região `sa-east-1`, verificado (DKIM, SPF, MX de retorno). Rastreio de abertura e clique desligado.
- Chave "site-sa (Vercel produção)": só envio, só por esse domínio.
- Free: 3.000 e-mails por mês, 100 por dia.

## Google Workspace

- Domínio `saagencia.com.br`, caixa `contato@saagencia.com.br`. MX, SPF e DKIM do Google no Registro.br; não foram alterados.
- DMARC (`_dmarc`): `p=none` (só monitora), relatórios para `contato@`. Passo seguinte, depois de algumas semanas sem problemas: `p=quarantine`.

## Conectores do agente (Claude)

Vercel, Supabase e Resend conectados em claude.ai, o que permite ao agente
criar variáveis, domínios, migrações, chaves e testes. O DNS do Registro.br
continua manual.
