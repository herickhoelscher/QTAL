"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AdminRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string; success?: string };

export async function login(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  // Mensagem unica para usuario inexistente e senha errada, para nao revelar
  // quais e-mails existem no painel.
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  redirect("/admin/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/admin");
}

export async function saveUser(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "EDITOR") as AdminRole;
  const password = String(formData.get("password") ?? "");
  const active = formData.get("active") === "on";

  if (!name || !email) return { error: "Nome e e-mail são obrigatórios." };

  const duplicated = await prisma.adminUser.findFirst({
    where: { email, ...(id ? { id: { not: id } } : {}) },
  });
  if (duplicated) return { error: "Já existe um usuário com esse e-mail." };

  if (id) {
    await prisma.adminUser.update({
      where: { id },
      data: {
        name,
        email,
        role,
        active,
        ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
      },
    });
  } else {
    if (password.length < 8) {
      return { error: "A senha precisa ter ao menos 8 caracteres." };
    }
    await prisma.adminUser.create({
      data: { name, email, role, active, passwordHash: await bcrypt.hash(password, 10) },
    });
  }

  revalidatePath("/admin/usuarios");
  return { success: "Usuário salvo." };
}

export async function deleteUser(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === session.id) return;
  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
}
