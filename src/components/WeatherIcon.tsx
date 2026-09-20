/**
 * Icone do clima a partir do codigo WMO do Open-Meteo.
 *
 * Desenhado inline em vez de baixado do provedor: sao 16 linhas de SVG que
 * herdam currentColor, acompanham o tema da barra e nao custam uma requisicao
 * de rede por pageview — o icone PNG do provedor anterior custava.
 */
type Shape = "sun" | "partly" | "cloud" | "fog" | "rain" | "snow" | "storm";

function shapeFor(code: number): Shape {
  if (code === 0) return "sun";
  if (code === 1 || code === 2) return "partly";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  return "cloud";
}

const CLOUD = "M7 18h9.5a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A3.4 3.4 0 0 0 7 18z";

export function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const shape = shapeFor(code);

  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {shape === "sun" ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
        </>
      ) : null}

      {shape === "partly" ? (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M9 2v1.5M3 8h1.5M4.8 3.8l1 1M13.2 3.8l-1 1" />
          <path d={CLOUD} />
        </>
      ) : null}

      {shape === "cloud" ? <path d={CLOUD} /> : null}

      {shape === "fog" ? (
        <>
          <path d="M7 14h9.5a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A3.4 3.4 0 0 0 7 14z" />
          <path d="M4 18h16M6 21h12" />
        </>
      ) : null}

      {shape === "rain" ? (
        <>
          <path d="M7 15h9.5a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A3.4 3.4 0 0 0 7 15z" />
          <path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" />
        </>
      ) : null}

      {shape === "snow" ? (
        <>
          <path d="M7 15h9.5a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A3.4 3.4 0 0 0 7 15z" />
          <path d="M9 19h.01M12.5 21h.01M16 19h.01" />
        </>
      ) : null}

      {shape === "storm" ? (
        <>
          <path d="M7 14h9.5a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A3.4 3.4 0 0 0 7 14z" />
          <path d="M13 16l-3 4h4l-3 4" />
        </>
      ) : null}
    </svg>
  );
}
