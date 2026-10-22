/**
 * Leitura simples do User-Agent: navegador, sistema e tipo de aparelho.
 * Sem biblioteca: só os casos que importam para a página.
 */
export type Agente = { navegador: string; sistema: string; dispositivo: "celular" | "tablet" | "computador"; robo: boolean };

const ROBO = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|lighthouse|pingdom|monitor/i;

export function lerAgente(ua: string): Agente {
  const navegador =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\//.test(ua) ? "Opera"
    : /SamsungBrowser/.test(ua) ? "Samsung Internet"
    : /Instagram/.test(ua) ? "Instagram"
    : /FBAN|FBAV/.test(ua) ? "Facebook"
    : /CriOS|Chrome\//.test(ua) ? "Chrome"
    : /FxiOS|Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari"
    : "outro";
  const sistema =
    /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Android/.test(ua) ? "Android"
    : /Windows/.test(ua) ? "Windows"
    : /Mac OS X|Macintosh/.test(ua) ? "macOS"
    : /CrOS/.test(ua) ? "ChromeOS"
    : /Linux/.test(ua) ? "Linux"
    : "outro";
  const dispositivo = /iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua)) ? "tablet" : /Mobi|iPhone|Android/.test(ua) ? "celular" : "computador";
  return { navegador, sistema, dispositivo, robo: ROBO.test(ua) };
}
