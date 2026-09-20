import { getCub, getDollar, getWeather } from "@/lib/data-sources";
import { LiveClock } from "@/components/LiveClock";
import { WeatherIcon } from "@/components/WeatherIcon";

const NUMBER = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Barra de dados automaticos (secao 6.7): data/hora, clima, dolar e CUB.
 * Quando uma fonte falha, o valor aparece como "--": o layout nunca quebra e
 * nenhum erro tecnico chega ao usuario final.
 */
export async function DataBar() {
  const [weather, dollar, cub] = await Promise.all([getWeather(), getDollar(), getCub()]);
  const up = dollar ? dollar.changePercent >= 0 : true;

  return (
    <div className="databar border-b border-line bg-surface-alt">
      <div className="databar-scroller container-portal flex items-center gap-x-6 overflow-x-auto py-2 text-[0.8125rem] whitespace-nowrap">
        <LiveClock />

        <span className="databar-divider h-3 w-px shrink-0 bg-line" aria-hidden />

        <span className="flex shrink-0 items-center gap-2">
          <span className="eyebrow databar-label">Clima</span>
          {weather ? (
            <>
              <WeatherIcon code={weather.code} className="text-muted" />
              <span className="sr-only">{weather.condition}. </span>
              <span className="font-semibold">{weather.temp}&deg;</span>
              <span className="databar-label normal-case">
                {weather.min}&deg; / {weather.max}&deg; &middot; {weather.city}
              </span>
            </>
          ) : (
            <span className="databar-label">--</span>
          )}
        </span>

        <span className="databar-divider h-3 w-px shrink-0 bg-line" aria-hidden />

        <span className="flex shrink-0 items-center gap-2">
          <span className="eyebrow databar-label">D&oacute;lar</span>
          {dollar ? (
            <>
              <span className="font-semibold tabular-nums">R$ {NUMBER.format(dollar.value)}</span>
              <span className={up ? "text-emerald-700" : "text-brand"}>
                {up ? "▲" : "▼"} {NUMBER.format(Math.abs(dollar.changePercent))}%
              </span>
            </>
          ) : (
            <span className="databar-label">--</span>
          )}
        </span>

        <span className="databar-divider h-3 w-px shrink-0 bg-line" aria-hidden />

        <span className="flex shrink-0 items-center gap-2">
          {/* O rotulo acompanha a fonte: CUB e o indice do Sinduscon digitado no
              painel; sem ele, entra o custo medio m2 do SINAPI/IBGE, que tem
              outra metodologia e por isso nao pode se chamar CUB. */}
          <span className="eyebrow databar-label">
            {cub.source === "sinapi" ? "Custo m²" : "CUB"}
          </span>
          {cub.value ? (
            <>
              <span className="font-semibold tabular-nums">
                R$ {NUMBER.format(cub.value)}/m&sup2;
              </span>
              {cub.changePercent !== null ? (
                <span className={cub.changePercent >= 0 ? "text-emerald-700" : "text-brand"}>
                  {cub.changePercent >= 0 ? "▲" : "▼"}{" "}
                  {NUMBER.format(Math.abs(cub.changePercent))}%
                </span>
              ) : null}
              {cub.reference ? (
                <span className="databar-label normal-case">{cub.reference}</span>
              ) : null}
              {cub.source === "sinapi" ? (
                <span className="databar-label normal-case">SINAPI/IBGE</span>
              ) : null}
            </>
          ) : (
            <span className="databar-label">--</span>
          )}
        </span>
      </div>
    </div>
  );
}
