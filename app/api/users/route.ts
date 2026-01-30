import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid"; // Caso não tenha, use Math.random().toString()

export async function GET() {
  const db = await getDb();
  // Retornamos a lista sem as senhas por segurança
  const users = db.data.users.map(({ senha, ...u }) => u);
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { nome, email, senha, cargo } = body; // cargo: 'admin' | 'funcionario'

    if (db.data.users.find(u => u.email === email)) {
      return NextResponse.json({ message: "E-mail já cadastrado" }, { status: 400 });
    }

    const novoUsuario = {
      id: uuidv4(),
      nome,
      email,
      senha,
      cargo,
      createdAt: new Date().toISOString()
    };

    db.data.users.push(novoUsuario);
    await db.write();

    return NextResponse.json({ success: true, user: { nome, email, cargo } });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao salvar" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  const db = await getDb();
  db.data.users = db.data.users.filter(u => u.id !== id);
  await db.write();
  
  return NextResponse.json({ success: true });
}