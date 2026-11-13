# Samia: agente SDR de prospecção da SA

A Samia pesquisa empresas locais, aborda quem decide pelo WhatsApp e marca uma videochamada inicial com o time da SA. Ela é dividida em dois prompts, para que cada um fique menor, mais barato por mensagem e com menos chance de errar.

| Arquivo | O que faz | Quando roda |
|---|---|---|
| `samia-pesquisa.md` | Encontra empresas, analisa Google, Instagram, site e anúncios, monta o dossiê, calcula a janela de envio e a prioridade. Não fala com leads. | Em lote, antes das abordagens (por exemplo, de manhã cedo). |
| `samia-conversa.md` | Conversa com o lead no WhatsApp a partir do dossiê, qualifica, contorna objeções, marca a videochamada e faz o relatório das 23h. | A cada mensagem, e às 23h para o relatório. |

## Como os dois se ligam

1. A pesquisa grava o dossiê no cadastro (`registrar_lead`) com status `na_fila` ou `prioridade_baixa`, e manda o resumo no grupo "relatorios".
2. A plataforma pega os leads `na_fila`, por ordem de prioridade, e chama o módulo de conversa para a abertura quando a `janela_envio` do dossiê permitir e o limite diário de mensagens frias não tiver sido atingido.
3. Daí em diante, cada resposta do lead aciona o módulo de conversa, com o dossiê e o histórico da conversa.

Os códigos de problema (P1 a P27) são os mesmos nos dois arquivos. Ao incluir ou mudar um problema, atualize os dois.

## Grupos de WhatsApp

- **aprovacoes**: pedidos de horário, pendências de resposta, transferências para humano e videochamadas confirmadas. É o grupo que precisa de resposta rápida dos sócios.
- **relatorios**: dossiês e relatório diário das 23h. Só leitura, sem urgência.

## O que a plataforma precisa garantir (não depende do prompt)

- Contador de mensagens frias por dia (00:00 a 23:59, America/Sao_Paulo).
- Envio da abertura só dentro da `janela_envio` do dossiê.
- Disparo do relatório às 23:00.
- Espera do lead terminar de mandar mensagens antes de responder, e o "digitando" entre balões.
- Transcrição de áudio.
- Reserva provisória de horário com duração maior que a espera do grupo mais uma hora.
