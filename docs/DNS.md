# DNS de saagencia.com.br

Cópia dos registros em 18/11/2026, antes de passar o DNS do Registro.br
(b.sec.dns.br, c.sec.dns.br) para a Vercel (ns1.vercel-dns.com,
ns2.vercel-dns.com). Com o DNS na Vercel, o site, o `www`, o `briefing` e o
`bio` (domínios do projeto) resolvem sozinhos; os demais registros abaixo
precisam existir na zona da Vercel.

| Tipo | Nome | Valor | Para quê |
|---|---|---|---|
| A | @ | 216.198.79.1 | Site (Vercel); automático com o DNS na Vercel |
| CNAME | www, briefing, bio | 31f8c9f59d8664a0.vercel-dns-017.com. | Subdomínios do site; automáticos com o DNS na Vercel |
| MX | @ | 1 smtp.google.com | Google Workspace: receber e-mail |
| TXT | @ | v=spf1 include:_spf.google.com ~all | Google Workspace: SPF |
| TXT | @ | google-site-verification=Fkgfj0R4vP2yJKCGR9iUWwCyQ85J5OfaYciV20SqYWc | Google: verificação do domínio |
| TXT | google._domainkey | v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8MP2SUtXTzryBOnAiJONdHWsMMMDUjN/YJZk1x57fwV4FcGITxYCDfYw1tnquZJLuGIwgklZ3zmeW5E/6B4vYT5bmTcpX8l4ccGUszWtM0zYllnnxlj4VfIVTDXUUDb9SdK9Z3UDW0d7K9fNc17cyyyAhATrQvIka0YeFY7mQHVs3BrecPZIqU1S+eTnETesBPTKgDCxZwYYW0vJ/bk7Wli4DVY1GeORRxoRCAFd+5aBIVzSa4SCPcVjHs4OuJIbG3WgcnfAXRINKxeQmOsCtIhGTA2y5JLAWx3EGCljnN/023qBVHAHbd4fQxyEAnSMFL0MFr15X3bZz7kGGVO4wwIDAQAB | Google Workspace: DKIM |

A acrescentar com a mudança:

| Tipo | Nome | Valor | Para quê |
|---|---|---|---|
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:contato@saagencia.com.br | DMARC em modo monitoramento |
| (do Resend) | envio | registros mostrados pelo Resend | Envio dos avisos do briefing |
