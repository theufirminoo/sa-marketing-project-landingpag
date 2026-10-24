# Validação do site (24/10/2026)

Legenda:

- ✅ **Feito**: existe e foi conferido.
- 🟡 **Previsto**: depende da publicação na Vercel ou de dado da SA; já está em `PENDENCIAS.md`.
- 📋 **Backlog**: melhoria futura, registrada em `BACKLOG.md`.
- ⚙️ **Da hospedagem/conta**: a Vercel ou o registro do domínio resolvem, ou é configuração de conta da SA, não do código.
- ➖ **Não se aplica**: o site não tem esse componente.

Arquitetura, para entender os itens: página única em Next.js, sem login, sem
painel e sem banco de dados ligado. Há duas rotas de servidor: `POST /api/lead`
(diagnóstico) e `POST /api/eventos` (métricas, só depois do aceite). A prévia
no GitHub Pages é estática e não roda essas rotas.

## 1. Segurança básica

| Item | Situação | Observação |
|---|---|---|
| Certificado SSL/TLS válido | ⚙️ | A Vercel emite o certificado sozinha ao ligar o domínio |
| HTTPS em todas as páginas | ⚙️ | Vercel; o código não tem link `http://` |
| Redirecionamento HTTP → HTTPS | ⚙️ | Automático na Vercel |
| Renovação automática do SSL | ⚙️ | Automática na Vercel |
| Cabeçalhos HTTP seguros | ✅ | `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, sem `X-Powered-By` |
| CSP | ✅ parcial / 📋 | Feita: `frame-ancestors`, `base-uri`, `form-action`, `object-src 'none'`, `upgrade-insecure-requests`. CSP de scripts com nonce está no backlog: exige o ID final do GTM e muda a forma de renderizar |
| Proteção contra clickjacking | ✅ | `X-Frame-Options: SAMEORIGIN` e `frame-ancestors 'self'` |
| HSTS | ⚙️ | A Vercel envia HSTS nos domínios dela. Para pré-carregamento no domínio próprio: backlog, depois de confirmar HTTPS em produção |
| Referrer-Policy | ✅ | `strict-origin-when-cross-origin` |
| Bloqueio de conteúdo misto | ✅ | `upgrade-insecure-requests`, e todo recurso é servido do próprio site |
| CORS | ✅ | As APIs não liberam outras origens; só a própria página chama |
| Proteção contra XSS | ✅ | React escapa todo texto; nenhum `dangerouslySetInnerHTML` com dado de usuário |
| Injeção de comandos/consultas | ✅ | Não há execução de comando; o banco de métricas (quando ligado) usa consultas parametrizadas |
| Validação no servidor | ✅ | zod em `/api/lead` e `/api/eventos`, com o mesmo esquema do formulário |
| Proteção contra spam | ✅ | Campo isca (honeypot) e limite por IP no lead |
| Limitação de requisições | ✅ | 5 leads/min e 120 lotes de métrica/min por IP (memória da instância). Firewall da Vercel no backlog para limite global |
| Listagem de diretórios desativada | ✅ | Next/Vercel não listam diretórios |
| Sem páginas de teste ou backups públicos | ✅ | `/ds` só existe em desenvolvimento; `public/` só tem mídia |
| Sem credenciais no código | ✅ | Segredos só em variáveis de ambiente; `.env*` fora do git |
| Erros sem detalhe interno | ✅ | APIs respondem só o status e o nome do campo; logs sem dado pessoal |
| Dependências atualizadas | ✅ | **Corrigido nesta validação:** o Next 16.4.0 tinha 2 falhas críticas (execução remota de código) e 1 alta, e o zod 1 alta. Atualizados para Next 16.4.1 e zod 4.6.6; `pnpm audit`: 0 vulnerabilidades |
| Painel administrativo protegido | ➖ | Não existe painel. O painel de métricas, se for feito, entra protegido (backlog) |
| Firewall/proteção contra ataques | ⚙️ / 📋 | A Vercel já mitiga DDoS. Regras do Vercel Firewall no backlog |
| Monitoramento de vulnerabilidades | 📋 | Dependabot ou Renovate no GitHub, no backlog |

## 2. Hospedagem, domínio e infraestrutura

| Item | Situação | Observação |
|---|---|---|
| Domínio próprio sob controle da SA | 🟡 | Pendente: samarketing.co.br, .com.br ou agenciasa.com.br |
| MFA no registro do domínio | ⚙️ | Conta da SA no Registro.br |
| Renovação automática do domínio | ⚙️ | Conta da SA no Registro.br |
| DNS correto | 🟡 | Na publicação: apontar para a Vercel |
| Proteção contra alteração de DNS | ⚙️ | MFA e bloqueio de transferência no Registro.br |
| Hospedagem confiável | ✅ | Vercel (previsto no README) |
| Servidor atualizado e seguro | ⚙️ | Serverless gerenciado pela Vercel |
| Firewall | ⚙️ | Vercel |
| Painel da hospedagem com MFA | ⚙️ | Conta da SA na Vercel e no GitHub |
| Permissões de arquivos | ➖ | Não há servidor de arquivos |
| Produção separada de teste | ✅ / ⚙️ | Vercel cria uma prévia por branch; a prévia do GitHub Pages fica separada |
| Segredos fora do acesso público | ✅ | Variáveis de ambiente |
| Testes e backups fora da pasta pública | ✅ | |
| Monitoramento de disponibilidade | 📋 | UptimeRobot ou Better Stack (gratuitos) |
| Alertas de falha | 📋 | Junto com o monitoramento |
| CPU, memória e disco | ➖ | Serverless: não há servidor para monitorar |
| Plano de recuperação | ✅ | O código está no GitHub e a Vercel mantém cada versão publicada |
| Suporte técnico | ⚙️ | M9 Studio Tech e suporte da Vercel |

## 3. Formulário (diagnóstico)

| Item | Situação | Observação |
|---|---|---|
| Validação no navegador e no servidor | ✅ | Mesmo esquema zod nos dois |
| Sanitização | ✅ | Texto aparado e com tamanho máximo; WhatsApp só com dígitos; Instagram normalizado |
| Proteção contra injeção | ✅ | Ver seção 1 |
| Spam e robôs | ✅ | Campo isca e limite |
| Limite de envios | ✅ | 5 por minuto por IP |
| CSRF | ✅ | JSON same-origin, sem cookie de sessão: não há o que forjar |
| Campos obrigatórios identificados | ✅ | Nome e WhatsApp obrigatórios; empresa e Instagram marcados como opcionais |
| Limite de tamanho | ✅ | Todos os campos têm máximo |
| Validação de telefone | ✅ | DDD e número; o formulário não pede e-mail |
| Erros claros, sem detalhe técnico | ✅ | Mensagem diz o que falta, com foco no campo |
| Confirmação de envio | ✅ | Tela de resultado com a frente indicada |
| Falha no envio | ✅ | Se a API falhar, o resultado aparece e o WhatsApp leva as respostas |
| HTTPS | ⚙️ | Vercel |
| Armazenamento seguro | ✅ | O site não guarda o lead: vai ao CRM e ao WhatsApp |
| Acesso restrito aos contatos | ⚙️ | Depende do CRM e do WhatsApp da SA |
| Nada desnecessário para terceiros | ✅ | GTM só depois do aceite, sem dado pessoal; métricas sem dado do lead |
| Dados fora das URLs | ✅ | O lead vai por POST. A mensagem do WhatsApp vai no link `wa.me`, porque é assim que o WhatsApp funciona: é a pessoa que envia |
| Retenção e exclusão | 🟡 | Exclusão por WhatsApp/Instagram já está na política; o prazo do CRM depende da SA |
| Integrações protegidas | ✅ / 🟡 | Token do CRM por variável de ambiente; webhook ainda não definido |
| Segredos no servidor | ✅ | Nenhum segredo no JavaScript do navegador |
| Aviso de privacidade perto do formulário | ✅ | Link da política na tela de contato |
| Consentimento sem caixa pré-marcada | ✅ | Não há caixa pré-marcada; o envio é a própria solicitação de contato |
| Alternativa de contato | ✅ | Link direto do WhatsApp, botão flutuante e rodapé; sem JavaScript, os botões viram links |

## 4. Vazamento de dados

| Item | Situação | Observação |
|---|---|---|
| Sem `.env` ou configuração privada publicada | ✅ | `.gitignore`; só o `.env.example`, sem valores |
| Sem segredo no JavaScript | ✅ | Só variáveis `NEXT_PUBLIC_` não secretas (WhatsApp, URL, GTM) |
| Sem backups ou logs públicos | ✅ | |
| Erros sem detalhe técnico | ✅ | |
| Logs sem dado desnecessário | ✅ | Em produção nenhum log leva dado pessoal; o IP das métricas vira código diário |
| Acesso restrito à hospedagem, e-mail corporativo, MFA, acesso de ex-prestadores, permissões de serviços externos | ⚙️ | Rotina da conta da SA (Vercel, GitHub, Registro.br, CRM) |
| Integrações confiáveis | ✅ | Vercel, Google Fonts (servida pelo próprio site), GTM opcional |
| Cópias de segurança | ✅ | Git e versões da Vercel |
| Prazo para apagar contatos | 🟡 | Definir no CRM |
| Verificação periódica | 📋 | Junto com o Dependabot e o monitoramento |

## 5. Desempenho e estabilidade

| Item | Situação | Observação |
|---|---|---|
| Imagens comprimidas, formatos modernos, carregamento tardio | ✅ | WebP/AVIF pelo `next/image`, com carregamento tardio |
| Vídeos eficientes | ✅ | Sem áudio, até ~1 MB, MP4 e WebM, só depois do carregamento |
| CSS/JS otimizados, sem bibliotecas sobrando | ✅ | ~165 kB gzip de JS inicial; o diálogo e as métricas carregam sob demanda |
| Fontes eficientes | ✅ | `next/font`, servida pelo próprio site, com reserva calibrada |
| Cache, CDN e compressão | ✅ / ⚙️ | Cache nos vídeos; CDN e compressão da Vercel |
| Poucas requisições externas | ✅ | Nenhuma antes do aceite |
| Animações sem excesso | ✅ | Desligam com movimento reduzido, menos vídeos e contador (pedido do cliente) |
| Nada bloqueando a carga | ✅ | |
| Falha de terceiros tratada | ✅ | CRM com tempo limite e GTM opcional |
| Layout estável (CLS) | ✅ | CLS 0 medido no celular e no computador |
| Envio duplicado | ✅ | Botão travado durante o envio |
| Monitoramento de erros | 📋 | Métricas registram erros do navegador quando o banco for ligado; Sentry é opcional |
| Teste no celular e em conexão lenta | ✅ | Lighthouse e emulação; LCP 2,4 s no celular simulado depois do vídeo automático |
| Teste de carga | ➖ / ⚙️ | A Vercel escala sozinha; não é necessário para o tráfego esperado |
| Alertas de indisponibilidade | 📋 | Ver seção 2 |
| Backup e reversão | ✅ | Reverter na Vercel com um clique (instant rollback) ou pelo git |
| Metas LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 | ✅ medido / 📋 | Laboratório dentro das metas; dados de visitas reais pelo Search Console depois de publicar |

## 6. Responsivo, navegação e acessibilidade

| Item | Situação | Observação |
|---|---|---|
| Layout de 320 a 1440 px, menu, logo, textos sem zoom | ✅ | Sem rolagem lateral |
| Alvos de toque de 48 px | ✅ | |
| Contraste AA | ✅ | Calculado para cada par de cores; o laranja forte não é usado em texto pequeno |
| Hierarquia de títulos | ✅ | Um `h1`, sem salto de nível |
| Links, botões de contato e formulário | ✅ | Testados com o fluxo do diagnóstico |
| Imagens sem distorção | ✅ | `object-fit: cover` |
| Elementos sobrepostos | ✅ | Corrigido nesta rodada: vídeo no iPhone, botões repetidos e WhatsApp flutuante |
| Rodapé, link da política | ✅ | |
| Página 404 personalizada | ✅ | **Feita nesta validação**, com status HTTP 404 |
| Teclado e foco visível | ✅ | |
| Texto alternativo | ✅ | |
| Leitor de tela | ✅ parcial | Conferido pela árvore de acessibilidade; falta teste com VoiceOver e TalkBack reais |
| Estados de carregamento e erro | ✅ | |
| Navegadores e aparelhos reais | 🟡 | Testado em Chromium e emulação; falta Safari no iPhone e Samsung Internet reais antes de lançar |

## 7. SEO

| Item | Situação | Observação |
|---|---|---|
| Título, descrição, URL, canonical | ✅ | |
| Sitemap e robots.txt | ✅ | Bloqueiam a indexação de propósito enquanto houver provisório |
| Redirecionamento entre versões do domínio | 🟡 | Na Vercel, ao ligar o domínio (www → raiz) |
| Imagens com texto alternativo, links internos | ✅ | |
| 404 com status certo | ✅ | |
| Dados estruturados | ✅ | JSON-LD de organização e FAQ |
| Experiência no celular | ✅ | |
| Sem bloqueio acidental | 🟡 | O noindex é proposital e sai sozinho quando os provisórios acabarem: CNPJ, política, logo SVG, vídeo do hero e provas de exemplo |
| Search Console e monitoramento de indexação | 📋 | Depois de publicar |
| Ferramenta de métricas conforme a política | ✅ | Só depois do aceite; a política lista o que é coletado |
| Redirecionamentos 301 | ➖ | Não há páginas antigas |

## 8. LGPD, privacidade e cookies

| Item | Situação | Observação |
|---|---|---|
| Política no rodapé, finalidade, dados limitados, canal de solicitação | ✅ | |
| Empresa responsável identificada | 🟡 | Falta o CNPJ e a razão social reais |
| Armazenamento e exclusão | ✅ / 🟡 | Métricas por 13 meses; prazo do CRM a definir |
| Compartilhamento com fornecedores | 🟡 | Citar Vercel e o CRM escolhido na política revisada |
| Aviso no formulário | ✅ | |
| Base legal por tratamento | 🟡 | Entra no texto final da política (pendência 6) |
| Consentimento de cookies, recusa e preferências | ✅ | Aceitar e Recusar com o mesmo peso; nada carrega antes; "Preferências de cookies" no rodapé |
| Rastreamento conforme a escolha | ✅ | GTM e métricas só após o aceite |
| Fornecedores avaliados | ⚙️ | Responsabilidade da SA |
| Atendimento aos titulares e plano de incidentes | 🟡 | O canal existe; procedimento interno e plano de incidente são documentos da SA, fora do código |

## 9. Conteúdo e estrutura

| Item | Situação | Observação |
|---|---|---|
| Identidade visual, proposta de valor, apresentação, serviços, diferenciais, benefícios, CTAs, FAQ, fotos, redes sociais | ✅ | |
| WhatsApp | ✅ | Número real |
| Telefone e e-mail | 🟡 | O e-mail da apresentação (`comercial@sa.com.br`) parece errado; não foi publicado |
| Endereço e mapa | ➖ | Não há atendimento presencial definido (pendência 13) |
| Horário de atendimento | 🟡 | A SA não informou; entra se quiser |
| Depoimentos verdadeiros | 🟡 | Hoje são exemplos marcados; trocar ou deixar em standby antes de lançar |
| Portfólio | 🟡 | Seção "O que a SA publica" espera os três Reels |
| Textos revisados | ✅ | Pelas regras de copy do projeto |
| Termos de uso | ➖ | Não há conta, compra nem conteúdo enviado pelo usuário; a política de privacidade basta |
| Identificação legal | 🟡 | CNPJ real |
| Confirmação após solicitação | ✅ | |
| Sem promessas enganosas | ✅ | Números e casos só reais (os exemplos têm etiqueta e travam a publicação) |

## 10. Testes antes de publicar

| Item | Situação |
|---|---|
| Páginas, links, botões, formulário, mensagens de erro | ✅ |
| Dados chegando ao destinatário | 🟡 Falta o webhook do CRM; o WhatsApp já funciona |
| Console e servidor sem erros críticos | ✅ |
| Sem vulnerabilidade crítica pendente | ✅ (corrigido nesta validação) |
| Sem credenciais expostas | ✅ |
| Certificado HTTPS | ⚙️ Na publicação |
| Celular e computador, imagens, teclado, velocidade, SEO técnico, links legais, banner | ✅ |
| Principais navegadores | 🟡 Safari e Samsung Internet reais |
| Backup e reversão | ✅ git e versões da Vercel |

Antes de publicar: `pnpm check:pendencias --estrito` precisa passar.

## 11. Manutenção

Monitoramento, Dependabot, revisão de acessos, links quebrados e revisão da
política estão no `BACKLOG.md`, seção "Depois de publicar". Responsável a
definir entre a SA e a M9 Studio Tech.

## 12. O que não precisa ser feito

Estes itens não fazem sentido para este site e não foram nem serão feitos:

- Login, cadastro e MFA para visitantes.
- Pagamento e estoque.
- Vários servidores, Kubernetes ou microsserviços.
- SIEM e permissões complexas.
- WAF pago obrigatório.
- CAPTCHA (o campo isca e o limite de envios bastam).
- Banner que bloqueia a navegação.
- Plugins de segurança.

O banco de dados é opcional: existe só para as métricas próprias e está no
backlog. Sem ele, o site funciona igual.

## 13. Checklist final

| Área | Hoje |
|---|---|
| Segurança | ✅ no código. HTTPS e firewall entram com a Vercel |
| Privacidade | 🟡 Falta a política final, o CNPJ e a decisão sobre as provas de exemplo |
| Hospedagem | 🟡 Falta escolher o domínio e configurar a conta da Vercel com MFA |
| Desempenho | ✅ |
| Navegação | ✅ |
| Acessibilidade | ✅ (falta leitor de tela real) |
| SEO | ✅ técnico; indexação liberada quando os provisórios acabarem |
| Formulários | 🟡 Falta o webhook do CRM |
| Monitoramento | 📋 Backlog |
| Recuperação | ✅ git e versões da Vercel |
| Testes | ✅ automatizados e no navegador; falta o iPhone real |
| Manutenção | 📋 Definir o responsável |
