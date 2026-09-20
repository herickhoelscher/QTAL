"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/app/admin/actions/auth";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optional(formData: FormData, key: string): string | null {
  const value = text(formData, key);
  return value === "" ? null : value;
}

/** Latitude/longitude aceitam virgula decimal; vazio ou invalido vira null. */
function coordinate(formData: FormData, key: string): number | null {
  const value = text(formData, key).replace(",", ".");
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function saveSettings(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const cubRaw = text(formData, "cubValue").replace(/\./g, "").replace(",", ".");
  const cubValue = cubRaw === "" ? null : Number(cubRaw);
  if (cubValue !== null && !Number.isFinite(cubValue)) {
    return { error: "Valor do CUB inválido. Use apenas números, por exemplo 2845,71." };
  }

  const current = await prisma.apiSettings.findUnique({ where: { id: "singleton" } });
  const cubChanged = Number(current?.cubValue ?? NaN) !== Number(cubValue ?? NaN);

  const data = {
    siteName: text(formData, "siteName") || "Portal Institucional",
    siteDescription: text(formData, "siteDescription"),
    clientLogoUrl: optional(formData, "clientLogoUrl"),
    weatherCity: text(formData, "weatherCity") || "Toledo,PR,BR",
    weatherLat: coordinate(formData, "weatherLat"),
    weatherLon: coordinate(formData, "weatherLon"),
    currencyApiProvider: text(formData, "currencyApiProvider") || "awesomeapi",
    cubValue,
    cubReference: optional(formData, "cubReference"),
    cubAutoUpdate: formData.get("cubAutoUpdate") === "on",
    // Valor digitado a mao deixa de ser "sinduscon": passa a ser manual.
    cubSource: cubChanged ? "manual" : (current?.cubSource ?? null),
    // A data de referencia so avanca quando o valor muda de fato.
    cubUpdatedAt: cubChanged ? new Date() : current?.cubUpdatedAt,
    gtmContainerId: optional(formData, "gtmContainerId"),
    whatsappNumber: text(formData, "whatsappNumber"),
    whatsappMessage: text(formData, "whatsappMessage"),
    instagramUrl: optional(formData, "instagramUrl"),
    facebookUrl: optional(formData, "facebookUrl"),
    youtubeUrl: optional(formData, "youtubeUrl"),
    contactPhone: optional(formData, "contactPhone"),
    contactEmail: optional(formData, "contactEmail"),
    contactAddress: optional(formData, "contactAddress"),
  };

  await prisma.apiSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  revalidatePath("/", "layout");
  return { success: "Configurações salvas." };
}


/**
 * Busca o CUB agora, sob demanda, pelo botao do painel.
 *
 * Passa force: true porque aqui a acao e explicita — mesmo com a atualizacao
 * automatica desligada, quem clicou quer o numero novo.
 */
export async function refreshCubNow(): Promise<void> {
  await requireAdmin();
  const { refreshCub } = await import("@/lib/cub-source");
  await refreshCub({ force: true });
  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
}
