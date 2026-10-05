import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];

export type UploadResult = { url: string };

/** Pasta (bucket) publica do Supabase Storage onde ficam as imagens do painel. */
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

/**
 * Endereco do projeto no Supabase. Sem SUPABASE_URL, sai do usuario do banco
 * (postgres.<projeto>), que ja esta no DATABASE_URL.
 */
export function supabaseUrl(): string | null {
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL.replace(/\/$/, "");
  try {
    const user = new URL(process.env.DATABASE_URL ?? "").username;
    const ref = user.startsWith("postgres.") ? user.slice("postgres.".length) : "";
    return ref ? `https://${ref}.supabase.co` : null;
  } catch {
    return null;
  }
}

/**
 * Cabecalhos de acesso. Chave antiga (service_role, um JWT): apikey e Bearer.
 * Chave nova (sb_secret_...): so apikey; ela nao e JWT e o Bearer seria recusado.
 */
function authHeaders(key: string): Record<string, string> {
  return key.startsWith("sb_") ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };
}

function extensionOf(file: File): string {
  return file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
}

/** Cria a pasta publica na primeira vez; se ja existir, segue. */
async function ensureBucket(base: string, key: string): Promise<void> {
  await fetch(`${base}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...authHeaders(key), "Content-Type": "application/json" },
    body: JSON.stringify({ id: SUPABASE_BUCKET, name: SUPABASE_BUCKET, public: true }),
  });
}

/** Envia ao Supabase Storage e devolve o endereco publico da imagem. */
export async function uploadToSupabase(
  base: string,
  key: string,
  body: Blob,
  contentType: string,
  name: string,
): Promise<string> {
  const objectPath = `${new Date().toISOString().slice(0, 7)}/${name}`;
  const send = () =>
    fetch(`${base}/storage/v1/object/${SUPABASE_BUCKET}/${objectPath}`, {
      method: "POST",
      headers: {
        ...authHeaders(key),
        "Content-Type": contentType,
        "Cache-Control": "31536000",
        "x-upsert": "false",
      },
      body,
    });

  let response = await send();
  if (response.status === 404 || response.status === 400) {
    const text = await response.text();
    if (/bucket not found/i.test(text)) {
      await ensureBucket(base, key);
      response = await send();
    } else {
      throw new Error("Falha no upload para o Supabase: " + text.slice(0, 200));
    }
  }
  if (!response.ok) {
    throw new Error("Falha no upload para o Supabase: " + (await response.text()).slice(0, 200));
  }
  return `${base}/storage/v1/object/public/${SUPABASE_BUCKET}/${objectPath}`;
}

/**
 * Armazenamento de midia, nesta ordem:
 *
 * 1. Supabase Storage (o mesmo projeto do banco): basta definir
 *    SUPABASE_SERVICE_ROLE_KEY. E o que o site no ar usa.
 * 2. Cloudflare Images: CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_IMAGES_TOKEN.
 * 3. Sem nenhum dos dois, a pasta public/uploads, que so serve para testar no
 *    computador: na Vercel o disco e somente leitura e o envio e recusado.
 */
export async function storeUpload(file: File): Promise<UploadResult> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Formato não suportado. Envie JPG, PNG, GIF, WEBP ou AVIF.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Arquivo acima de 5MB. Comprima a imagem antes de enviar.");
  }

  const fileName = randomUUID() + "." + extensionOf(file);

  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const base = supabaseUrl();
  if (supabaseKey && base) {
    return { url: await uploadToSupabase(base, supabaseKey, file, file.type, fileName) };
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

  if (process.env.VERCEL) {
    throw new Error(
      "O armazenamento de imagens não está configurado no servidor. Avise o responsável pelo site.",
    );
  }

  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), Buffer.from(await file.arrayBuffer()));

  return { url: "/uploads/" + fileName };
}
