# 08. Histórico (CHANGELOG)

Resumo por data. O detalhe de cada mudança está no `git log` (mensagens em
português, sem marcas de IA). Ao mudar algo, acrescente uma linha aqui.

## 19/11/2026
- Briefing: sai a pergunta do impacto (código e coluna). Entram duas telas finais: o **presente** (análise estratégica; botão "Seguir a SA no Instagram" com o toque registrado, e "Continuar") e o **agradecimento** com o WhatsApp do consultor. O e-mail espera a saída da tela do presente (até 2 min) e diz se a pessoa tocou em seguir. Migração `instagram_sem_impacto`; `contatos.segue_instagram` para a equipe marcar.

## 18/11/2026
- **Briefing v3:** conversa em quatro capítulos; perguntas novas (tempo de mercado, produto que mais vende, estratégia de marketing com "quem cuida" condicional, impacto dos problemas); novas listas de canais, problemas e investimento (com "Ainda não sei"); etapas guardadas pelo nome; FIT versão 3. Migração `briefing_v3`.
- **E-mail do briefing ligado:** Resend com `envio.saagencia.com.br` (São Paulo), chave só de envio na Vercel, teste entregue em `contato@`. DMARC criado. Tentativa de passar o DNS para a Vercel não foi possível (o DNS segue no Registro.br). `docs/DNS.md`.
- Documentação técnica completa (`docs/tecnico/`), com modelo de dados (MER, DER, relacional) e integrações.

## 13/11/2026
- **Bio do Instagram** em `bio.saagencia.com.br`: três botões, diagnóstico abre por `?diagnostico`, cliques contados em `comercial.cliques` (migração `cliques`).
- `CLAUDE.md` enxuto; detalhes em `docs/DECISOES.md`.
- Prompts da Samia, agente SDR (`docs/agente-sdr/`, PRs 1 e 2).

## 11/11/2026
- **Briefing** (`briefing.saagencia.com.br`) e **banco comercial no Supabase** (esquema `comercial`, um contato por WhatsApp, FIT só no servidor, fila de avisos).
- Projeto Supabase "SA Marketing" em São Paulo; usuário restrito `sa_site`; funções da Vercel em `gru1`.
- Cron `/api/manter-banco` a cada 6 dias (Supabase grátis não pausa).
- Briefing: aceite LGPD na abertura, desafios múltiplos com frentes indicadas, nome completo, iniciais maiúsculas e "@" automáticos, status do lead (`pendente-conversa` → `abriu-whatsapp` → equipe), `leads_esfriando`, aviso de cookies fora do briefing.
- Faturamento com as mesmas faixas no diagnóstico e no briefing.

## 10/11/2026
- "SA Digital" no lugar de "SA Social"; textos de dúvidas e benefícios; Frentes sem vídeo; tela de resultado redesenhada; mensagens do WhatsApp mais naturais; link pelo `api.whatsapp.com` (emojis).

## 29/10/2026
- Proposta de arquitetura (`docs/ARQUITETURA.md`); domínio `saagencia.com.br`; CNPJ real; Vercel Web Analytics; Frentes em substituição ao rolar; regras de git (sem marcas de IA, `main` em produção).

## 22 a 28/10/2026
- Quem faz com fotos reais; logo da SA; números que contam; hero com cartão do diagnóstico; métricas próprias depois do aceite; validação (Next 16.4.1, zod 4.6.6, CSP básica, 404); laranja #FF751F; Montserrat e Poppins; correções de vídeo no iPhone.

## 08 a 10/10/2026
- Primeira versão da landing page com o diagnóstico de 3 perguntas; vídeos de fundo; carrossel no hero; prova social com exemplos e modo standby.
