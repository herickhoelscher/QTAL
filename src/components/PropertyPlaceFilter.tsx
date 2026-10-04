"use client";

import { useState } from "react";
import { neighborhoodKey } from "@/lib/location";

const SELECT = "w-full border border-line bg-surface px-4 py-2.5 text-sm";

/**
 * Cidade e bairro do filtro de imoveis. O bairro so lista os da cidade
 * escolhida e volta para "Todos" quando a cidade muda.
 */
export function PropertyPlaceFilter({
  neighborhoodsByCity,
  city,
  neighborhood,
  labels,
}: {
  neighborhoodsByCity: Record<string, string[]>;
  city: string;
  neighborhood: string;
  labels: { city: string; allCities: string; neighborhood: string; allNeighborhoods: string };
}) {
  const [selectedCity, setSelectedCity] = useState(city);
  // "?bairro=centro" marca "Centro": o filtro do servidor tambem ignora maiusculas.
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(
    () =>
      (neighborhoodsByCity[city] ?? []).find(
        (name) => neighborhoodKey(name) === neighborhoodKey(neighborhood),
      ) ?? "",
  );
  const neighborhoods = neighborhoodsByCity[selectedCity] ?? [];

  return (
    <>
      <div>
        <label htmlFor="cidade" className="sr-only">
          {labels.city}
        </label>
        <select
          id="cidade"
          name="cidade"
          value={selectedCity}
          onChange={(event) => {
            setSelectedCity(event.target.value);
            setSelectedNeighborhood("");
          }}
          className={SELECT}
        >
          <option value="">{labels.allCities}</option>
          {Object.keys(neighborhoodsByCity).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="bairro" className="sr-only">
          {labels.neighborhood}
        </label>
        <select
          id="bairro"
          name="bairro"
          value={selectedNeighborhood}
          onChange={(event) => setSelectedNeighborhood(event.target.value)}
          disabled={!neighborhoods.length}
          className={SELECT + " disabled:text-muted"}
        >
          <option value="">{labels.allNeighborhoods}</option>
          {neighborhoods.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
