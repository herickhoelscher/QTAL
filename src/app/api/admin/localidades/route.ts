import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isUf } from "@/lib/location";
import { fetchCities, listNeighborhoods } from "@/lib/location-db";

/**
 * Listas do campo de localizacao do painel.
 * ?uf=PR              -> cidades do estado, pelo IBGE
 * ?uf=PR&cidade=Toledo -> bairros ja cadastrados naquela cidade
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const uf = request.nextUrl.searchParams.get("uf") ?? "";
  const city = (request.nextUrl.searchParams.get("cidade") ?? "").trim();
  if (!isUf(uf)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  if (city) {
    return NextResponse.json({ neighborhoods: await listNeighborhoods(uf, city) });
  }

  const cities = await fetchCities(uf);
  if (!cities) {
    return NextResponse.json({ error: "Lista de cidades do IBGE indisponível." }, { status: 502 });
  }
  return NextResponse.json({ cities });
}
