# DNS de saagencia.com.br

O DNS fica no **Registro.br** (b.sec.dns.br, c.sec.dns.br), modo avançado.
Passar para a Vercel não deu certo: o Registro.br só aceita servidores que já
respondam pelo domínio, e a Vercel só cria a zona depois da troca. Registro
novo é colado à mão no Registro.br (Configurar zona DNS → Nova entrada; MX
com a prioridade dentro de "Dados", ex.: `10 servidor`). Atualize esta lista
quando mudar algo.

| Tipo | Nome | Valor | Para quê |
|---|---|---|---|
| A | @ | 216.198.79.1 | Site (Vercel); automático com o DNS na Vercel |
| CNAME | www, briefing, bio | 31f8c9f59d8664a0.vercel-dns-017.com. | Subdomínios do site; automáticos com o DNS na Vercel |
| MX | @ | 1 smtp.google.com | Google Workspace: receber e-mail |
| TXT | @ | v=spf1 include:_spf.google.com ~all | Google Workspace: SPF |
| TXT | @ | google-site-verification=Fkgfj0R4vP2yJKCGR9iUWwCyQ85J5OfaYciV20SqYWc | Google: verificação do domínio |
| TXT | google._domainkey | v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8MP2SUtXTzryBOnAiJONdHWsMMMDUjN/YJZk1x57fwV4FcGITxYCDfYw1tnquZJLuGIwgklZ3zmeW5E/6B4vYT5bmTcpX8l4ccGUszWtM0zYllnnxlj4VfIVTDXUUDb9SdK9Z3UDW0d7K9fNc17cyyyAhATrQvIka0YeFY7mQHVs3BrecPZIqU1S+eTnETesBPTKgDCxZwYYW0vJ/bk7Wli4DVY1GeORRxoRCAFd+5aBIVzSa4SCPcVjHs4OuJIbG3WgcnfAXRINKxeQmOsCtIhGTA2y5JLAWx3EGCljnN/023qBVHAHbd4fQxyEAnSMFL0MFr15X3bZz7kGGVO4wwIDAQAB | Google Workspace: DKIM |

E-mail de aviso do briefing (Resend) e DMARC, criados em 18/11/2026:

| Tipo | Nome | Valor | Para quê |
|---|---|---|---|
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:contato@saagencia.com.br | DMARC em modo monitoramento |
| TXT | resend._domainkey.envio | chave DKIM mostrada no Resend (Domains → envio.saagencia.com.br) | Resend: DKIM |
| MX | send.envio | 10 feedback-smtp.sa-east-1.amazonses.com | Resend: retorno (SPF) |
| TXT | send.envio | v=spf1 include:amazonses.com ~all | Resend: SPF |
| CNAME | rsend.envio | send.forge.rmta.net | Resend |
