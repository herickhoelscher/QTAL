import { NextResponse, type NextRequest } from "next/server";
import { refreshCub } from "@/lib/cub-source";

export const dynamic = "force-dynamic";

/**
 * Atualizacao mensal do CUB.
 *
 * Chamada pelo cron da Vercel (ver vercel.json). A Vercel assina a requisicao
 * com o header Authorization: Bearer $CRON_SECRET; sem o segredo configurado,
 * a rota so aceita chamadas em desenvolvimento, para ninguem conseguir
 * disparar a leitura em producao por engano.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorized = secret
    ? request.headers.get("authorization") === `Bearer ${secret}`
    : process.env.NODE_ENV !== "production";

  if (!authorized) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const result = await refreshCub();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
