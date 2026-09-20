import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** A configuracao e um singleton; criada na primeira leitura se ainda nao existir. */
export const getSettings = cache(async () => {
  const existing = await prisma.apiSettings.findUnique({ where: { id: "singleton" } });
  if (existing) return existing;
  return prisma.apiSettings.create({ data: { id: "singleton" } });
});

export function whatsappLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
