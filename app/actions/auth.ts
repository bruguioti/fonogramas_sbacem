"use server";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { crypto } from "crypto"; // Para gerar IDs únicos

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const db = await getDb();
  
  // Busca na coleção de usuários
  const user = db.data.users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    throw new Error("Credenciais inválidas");
  }

  // O redirecionamento agora deve funcionar sem erros de "engine"
  redirect("/dashboard");
}

export async function cadastrarUsuario(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  const db = await getDb();

  // Verifica se o usuário já existe na coleção
  if (db.data.users.some(u => u.email === email)) {
    throw new Error("Usuário já cadastrado");
  }

  // Adiciona o novo usuário ao array
  db.data.users.push({
    id: Math.random().toString(36).substring(2, 9), // ID simples para teste
    email,
    name,
    password,
    role: "USER"
  });

  // Salva a alteração no arquivo db.json físico
  await db.write();

  redirect("/login");
}