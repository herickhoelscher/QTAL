import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type UploadResult = { url: string };

/**
 * Armazenamento de midia.
 *
 * Em producao o destino e o Cloudflare (conta paga ja confirmada pelo cliente):
 * basta definir CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_IMAGES_TOKEN que o upload
 * passa a usar o Cloudflare Images, com otimizacao e CDN automaticas.
 * Sem essas variaveis, o arquivo e gravado em public/uploads — suficiente para
 * desenvolvimento e para uma primeira publicacao sem dependencia externa.
 */
export async function storeUpload(file: File): Promise<UploadResult> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Formato não suportado. Envie JPG, PNG, WEBP ou AVIF.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Arquivo acima de 5MB. Comprima a imagem antes de enviar.");
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_IMAGES_TOKEN;

  if (accountId && token) {
    const body = new FormData();
    body.append("file", file);

    const response = await fetch(
      "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/images/v1",
      { method: "POST", headers: { Authorization: "Bearer " + token }, body },
    );

    const json = (await response.json()) as {
      success: boolean;
      result?: { variants?: string[] };
      errors?: { message: string }[];
    };

    if (!json.success || !json.result?.variants?.length) {
      throw new Error(json.errors?.[0]?.message ?? "Falha no upload para o Cloudflare.");
    }
    return { url: json.result.variants[0] };
  }

  const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const fileName = randomUUID() + "." + extension;
  const directory = path.join(process.cwd(), "public", "uploads");

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), Buffer.from(await file.arrayBuffer()));

  return { url: "/uploads/" + fileName };
}
