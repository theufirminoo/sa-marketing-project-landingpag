# Documentação técnica: SA Marketing

Documentação de manutenção do site da SA Marketing & Business
(`saagencia.com.br`), do briefing, da página da bio e da base comercial.
Atualizada em 18/11/2026.

Comece pela visão geral. Para mexer em algo, leia a especificação da área
antes e atualize este conjunto depois (e o `CHANGELOG`).

| # | Documento | Para quê |
|---|---|---|
| 01 | [Visão geral](01-visao-geral.md) | O que existe, endereços, contas e custos |
| 02 | [Arquitetura](02-arquitetura.md) | Peças, fluxos de dados, regiões, segurança |
| 03 | [Especificação funcional](03-especificacao-funcional.md) | Regras de negócio de cada tela: diagnóstico, briefing, bio, cookies |
| 04 | [Especificação técnica](04-especificacao-tecnica.md) | Código, rotas, contratos das APIs, validação, e-mail |
| 05 | [Banco de dados](05-banco-de-dados.md) | Esquema `comercial`, migrações, permissões, consultas úteis |
| 06 | [Operação e manutenção](06-operacao.md) | Como publicar, variáveis, tarefas comuns, LGPD, problemas e soluções |
| 07 | [Infraestrutura e DNS](07-infraestrutura.md) | Vercel, Supabase, Resend, Registro.br, Google Workspace |
| 08 | [Histórico (CHANGELOG)](08-historico.md) | Tudo o que mudou, por data |

Outros documentos do repositório:

- `CLAUDE.md`: regras fixas do projeto (copy, design system, git). Lido em toda sessão do agente.
- `docs/DECISOES.md`: decisões de arquitetura e de design, por área.
- `docs/ARQUITETURA.md`: proposta de arquitetura de 29/10/2026 (contexto das escolhas).
- `docs/DNS.md`: registros DNS atuais.
- `docs/PROMPT.md`: briefing original do site.
- `docs/VALIDACAO.md` e `docs/RELATORIO.md`: validação e relatório da primeira entrega.
- `docs/agente-sdr/`: prompts da Samia, agente SDR de prospecção no WhatsApp.
- `BACKLOG.md` e `PENDENCIAS.md`: o que falta e o que melhorar.
