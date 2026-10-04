"use client";

import { useEffect, useState } from "react";
import { Field, Select, TextInput } from "@/components/admin/form";
import { BRAZIL_STATES, DEFAULT_UF, neighborhoodKey } from "@/lib/location";

const OTHER = "__outro__";

type Loaded = { key: string; json: Record<string, unknown> | null } | null;

/** Busca a lista uma vez por chave; a resposta de uma chave antiga e descartada. */
function useList(key: string, url: string | null) {
  const [loaded, setLoaded] = useState<Loaded>(null);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setLoaded({ key, json }))
      .catch(() => {
        if (!controller.signal.aborted) setLoaded({ key, json: null });
      });
    return () => controller.abort();
  }, [key, url]);

  const ready = loaded?.key === key;
  return { loading: Boolean(url) && !ready, json: ready ? loaded.json : null, failed: ready && !loaded.json };
}

function names(json: Record<string, unknown> | null, field: string): string[] {
  const value = json?.[field];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/**
 * Estado, cidade e bairro em listas encadeadas. As cidades vem do IBGE; os
 * bairros sao os ja usados naquela cidade, mais "Outro bairro…" para digitar
 * um novo. Os valores vao no formulario como state, city e neighborhood.
 */
export function LocationFields({
  state,
  city,
  neighborhood,
  cityRequired,
  hint,
}: {
  state?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  cityRequired?: boolean;
  hint?: string;
}) {
  // Conteudo novo ja abre no Parana; o que foi salvo sem estado continua sem.
  const isNew = state === undefined && city === undefined;
  const [uf, setUf] = useState(state ?? (isNew ? DEFAULT_UF : ""));
  const [cityName, setCityName] = useState(city ?? "");
  const [bairro, setBairro] = useState(neighborhood ?? "");
  const [typing, setTyping] = useState(false);

  const cities = useList(uf, uf ? "/api/admin/localidades?uf=" + uf : null);
  const neighborhoods = useList(
    uf + "|" + cityName,
    uf && cityName
      ? "/api/admin/localidades?" + new URLSearchParams({ uf, cidade: cityName }).toString()
      : null,
  );

  // O valor salvo aparece mesmo que nao esteja na lista (grafia antiga, IBGE fora).
  const cityOptions = names(cities.json, "cities");
  if (cityName && !cityOptions.includes(cityName)) cityOptions.unshift(cityName);

  const bairroOptions = names(neighborhoods.json, "neighborhoods");
  if (bairro && !bairroOptions.some((item) => neighborhoodKey(item) === neighborhoodKey(bairro))) {
    bairroOptions.unshift(bairro);
  }
  const bairroSelected =
    bairroOptions.find((item) => neighborhoodKey(item) === neighborhoodKey(bairro)) ?? "";

  function changeUf(next: string) {
    setUf(next);
    setCityName("");
    setBairro("");
    setTyping(false);
  }

  function changeCity(next: string) {
    setCityName(next);
    setBairro("");
    setTyping(false);
  }

  function changeBairro(next: string) {
    if (next === OTHER) {
      setTyping(true);
      setBairro("");
      return;
    }
    setBairro(next);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3 md:col-span-2">
      <input type="hidden" name="state" value={uf} />
      <input type="hidden" name="city" value={cityName} />
      <input type="hidden" name="neighborhood" value={bairro} />

      <Field label="Estado" htmlFor="location-state" hint={hint}>
        <Select id="location-state" value={uf} onChange={(event) => changeUf(event.target.value)}>
          <option value="">Selecione</option>
          {BRAZIL_STATES.map((item) => (
            <option key={item.uf} value={item.uf}>
              {item.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Cidade"
        htmlFor="location-city"
        required={cityRequired}
        hint={cities.failed ? "A lista do IBGE não carregou. Digite o nome da cidade." : undefined}
      >
        {cities.failed ? (
          <TextInput
            id="location-city"
            value={cityName}
            onChange={(event) => changeCity(event.target.value)}
            required={cityRequired}
            disabled={!uf}
          />
        ) : (
          <Select
            id="location-city"
            value={cityName}
            onChange={(event) => changeCity(event.target.value)}
            required={cityRequired}
            disabled={!uf}
          >
            <option value="">
              {!uf ? "Escolha o estado" : cities.loading ? "Carregando cidades…" : "Selecione"}
            </option>
            {cityOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        label="Bairro"
        htmlFor="location-neighborhood"
        hint={typing ? "Bairro novo: passa a aparecer na lista desta cidade." : undefined}
      >
        {typing ? (
          <div className="flex gap-2">
            <TextInput
              id="location-neighborhood"
              value={bairro}
              onChange={(event) => setBairro(event.target.value)}
              placeholder="Nome do bairro"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setTyping(false);
                setBairro("");
              }}
              className="shrink-0 text-xs font-semibold text-muted underline hover:text-ink"
            >
              Lista
            </button>
          </div>
        ) : (
          <Select
            id="location-neighborhood"
            value={bairroSelected}
            onChange={(event) => changeBairro(event.target.value)}
            disabled={!cityName}
          >
            <option value="">
              {!cityName
                ? "Escolha a cidade"
                : neighborhoods.loading
                  ? "Carregando bairros…"
                  : "Sem bairro"}
            </option>
            {bairroOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            {cityName ? <option value={OTHER}>Outro bairro…</option> : null}
          </Select>
        )}
      </Field>
    </div>
  );
}
