import "server-only";
import { getSettings } from "@/lib/settings";

export type WeatherData = {
  city: string;
  temp: number;
  min: number;
  max: number;
  condition: string;
  /** Codigo WMO devolvido pelo Open-Meteo; vira icone no <WeatherIcon />. */
  code: number;
};

export type CurrencyData = {
  code: string;
  value: number;
  changePercent: number;
};

export type CubData = {
  value: number | null;
  reference: string | null;
  updatedAt: string | null;
  changePercent: number | null;
  /** "manual" = valor digitado no painel; "sinapi" = custo medio m2 do IBGE. */
  source: "manual" | "sinapi" | null;
};

/**
 * Cache em memoria do ultimo valor bom de cada fonte. Se a API externa cair,
 * a barra continua exibindo o ultimo valor obtido em vez de quebrar o layout
 * (requisito 6.7 da especificacao).
 */
const lastGood = new Map<string, unknown>();

async function withFallback<T>(key: string, loader: () => Promise<T | null>): Promise<T | null> {
  try {
    const value = await loader();
    if (value !== null && value !== undefined) {
      lastGood.set(key, value);
      return value;
    }
  } catch (error) {
    console.error(`[data-sources] falha ao carregar "${key}":`, error);
  }
  return (lastGood.get(key) as T | undefined) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Clima                                                                      */
/* -------------------------------------------------------------------------- */

/** Descricao dos codigos WMO usados pelo Open-Meteo. */
const WMO_LABEL: Record<number, string> = {
  0: "Céu limpo",
  1: "Predomínio de sol",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Nevoeiro",
  48: "Nevoeiro com geada",
  51: "Garoa fraca",
  53: "Garoa",
  55: "Garoa forte",
  56: "Garoa congelante",
  57: "Garoa congelante forte",
  61: "Chuva fraca",
  63: "Chuva",
  65: "Chuva forte",
  66: "Chuva congelante",
  67: "Chuva congelante forte",
  71: "Neve fraca",
  73: "Neve",
  75: "Neve forte",
  77: "Grãos de neve",
  80: "Pancadas de chuva",
  81: "Pancadas de chuva",
  82: "Pancadas fortes de chuva",
  85: "Pancadas de neve",
  86: "Pancadas fortes de neve",
  95: "Tempestade",
  96: "Tempestade com granizo",
  99: "Tempestade com granizo",
};

type Coordinates = { lat: number; lon: number; label: string };

/**
 * Geocodificacao do campo "cidade" do painel ("Toledo,PR,BR") pela API
 * gratuita do Open-Meteo. Fica em cache por 24h: nome de cidade nao muda.
 */
async function geocode(city: string): Promise<Coordinates | null> {
  const [name, uf] = city.split(",").map((part) => part.trim());
  if (!name) return null;

  const params = new URLSearchParams({
    name,
    count: "10",
    language: "pt",
    format: "json",
  });

  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    results?: { latitude: number; longitude: number; name: string; admin1?: string; country_code?: string }[];
  };
  const results = json.results ?? [];
  if (!results.length) return null;

  // Prefere a cidade brasileira do estado informado; senao, o primeiro resultado.
  const brazilian = results.filter((item) => item.country_code === "BR");
  const pool = brazilian.length ? brazilian : results;
  const match =
    (uf && pool.find((item) => item.admin1?.toLowerCase().includes(uf.toLowerCase()))) || pool[0];

  return { lat: match.latitude, lon: match.longitude, label: match.name };
}

/**
 * Open-Meteo: gratuita, sem chave e sem cadastro (ate 10 mil chamadas/dia em
 * uso nao comercial). Substituiu o OpenWeatherMap justamente para tirar do
 * cliente a tarefa de criar e renovar uma chave de API.
 *
 * Revalidado a cada 30 minutos, conforme secao 9.1 da especificacao.
 */
export async function getWeather(): Promise<WeatherData | null> {
  const settings = await getSettings();

  return withFallback<WeatherData>("weather", async () => {
    let lat = settings.weatherLat;
    let lon = settings.weatherLon;
    let label = settings.weatherCity.split(",")[0]?.trim() ?? "";

    if (lat == null || lon == null) {
      const found = await geocode(settings.weatherCity);
      if (!found) return null;
      lat = found.lat;
      lon = found.lon;
      label = found.label;
    }

    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: "temperature_2m,weather_code",
      daily: "temperature_2m_max,temperature_2m_min",
      timezone: "America/Sao_Paulo",
      forecast_days: "1",
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      current?: { temperature_2m: number; weather_code: number };
      daily?: { temperature_2m_max: number[]; temperature_2m_min: number[] };
    };
    if (!json.current || !json.daily) return null;

    const code = json.current.weather_code;
    return {
      city: label,
      temp: Math.round(json.current.temperature_2m),
      min: Math.round(json.daily.temperature_2m_min[0]),
      max: Math.round(json.daily.temperature_2m_max[0]),
      condition: WMO_LABEL[code] ?? "Tempo estável",
      code,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Dolar                                                                      */
/* -------------------------------------------------------------------------- */

/** AwesomeAPI: gratuita e sem chave, revalidada a cada 15 min. */
export async function getDollar(): Promise<CurrencyData | null> {
  return withFallback<CurrencyData>("usd", async () => {
    const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL", {
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Record<string, { bid: string; pctChange: string }>;
    const quote = json["USDBRL"];
    if (!quote) return null;
    return {
      code: "USD",
      value: Number(quote.bid),
      changePercent: Number(quote.pctChange),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* CUB / custo do m2                                                          */
/* -------------------------------------------------------------------------- */

/** Codigo IBGE de cada UF, usado no nivel territorial da API do SIDRA. */
const UF_CODE: Record<string, string> = {
  RO: "11", AC: "12", AM: "13", RR: "14", PA: "15", AP: "16", TO: "17",
  MA: "21", PI: "22", CE: "23", RN: "24", PB: "25", PE: "26", AL: "27",
  SE: "28", BA: "29", MG: "31", ES: "32", RJ: "33", SP: "35", PR: "41",
  SC: "42", RS: "43", MS: "50", MT: "51", GO: "52", DF: "53",
};

/**
 * Custo medio do m2 da construcao civil pela API publica do IBGE (SIDRA),
 * tabela 2296 / SINAPI: variavel 48 (moeda corrente) e 1196 (variacao no mes).
 * Gratuita, sem chave, atualizada mensalmente. Revalidada a cada 24h.
 *
 * ATENCAO: SINAPI nao e CUB. O CUB e apurado pelos Sinduscons estaduais com
 * outra metodologia e os valores nao coincidem — por isso este numero so entra
 * quando o campo manual do painel esta vazio, e a barra o rotula como SINAPI.
 */
async function getSinapi(uf: string): Promise<CubData | null> {
  const code = UF_CODE[uf.toUpperCase()];
  if (!code) return null;

  return withFallback<CubData>("sinapi", async () => {
    const res = await fetch(
      `https://apisidra.ibge.gov.br/values/t/2296/n3/${code}/v/48,1196/p/last%201`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;

    // A primeira linha da resposta e o cabecalho com os nomes das colunas.
    const rows = (await res.json()) as { V: string; D2C: string; D3N: string }[];
    const data = rows.slice(1);
    const value = data.find((row) => row.D2C === "48");
    if (!value) return null;
    const change = data.find((row) => row.D2C === "1196");

    return {
      value: Number(value.V),
      reference: value.D3N,
      updatedAt: null,
      changePercent: change ? Number(change.V) : null,
      source: "sinapi",
    };
  });
}

/**
 * CUB (Custo Unitario Basico da construcao civil).
 *
 * LIMITACAO CONHECIDA: nao existe API publica, gratuita e estavel para o CUB.
 * O valor e apurado mensalmente pelos Sinduscons estaduais (ex.: Sinduscon-PR)
 * e publicado em PDF/planilha, sem endpoint de consumo.
 *
 * Por isso a ordem e: (1) valor digitado em /admin/configuracoes, que continua
 * sendo o CUB de verdade; (2) se estiver vazio, o custo medio do m2 do SINAPI
 * pela API do IBGE, devidamente rotulado — assim a barra nunca fica com "--"
 * so porque ninguem atualizou o indice no mes.
 */
export async function getCub(): Promise<CubData> {
  const settings = await getSettings();

  if (settings.cubValue) {
    return {
      value: Number(settings.cubValue),
      reference: settings.cubReference,
      updatedAt: settings.cubUpdatedAt ? settings.cubUpdatedAt.toISOString() : null,
      changePercent: null,
      source: "manual",
    };
  }

  const uf = settings.weatherCity.split(",")[1]?.trim() ?? "PR";
  const sinapi = await getSinapi(uf);
  return (
    sinapi ?? { value: null, reference: null, updatedAt: null, changePercent: null, source: null }
  );
}
