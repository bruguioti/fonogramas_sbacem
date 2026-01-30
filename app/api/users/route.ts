import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Removemos o import do uuid que estava causando erro no build
// Usaremos o crypto.randomUUID() que já vem no ambiente Node.js/Next.js

export async function GET() {
  try {
    const db = await getDb();
    // Retornamos a lista sem as senhas por segurança
    // Opcional: remover também o campo 'password' se ele existir no seu schema
    const users = db.data.users.map(({ senha, ...u }) => u);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao buscar usuários" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { nome, email, senha, cargo } = body;

    // Validação básica
    if (!nome || !email || !senha || !cargo) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
    }

    if (db.data.users.find(u => u.email === email)) {
      return NextResponse.json({ message: "E-mail já cadastrado" }, { status: 400 });
    }

    const novoUsuario = {
      id: crypto.randomUUID(), // <--- Substituição segura para o uuidv4()
      nome,
      email,
      senha,
      cargo, // 'admin' | 'funcionario'
      createdAt: new Date().toISOString()
    };

    db.data.users.push(novoUsuario);
    await db.write();

    return NextResponse.json({ 
      success: true, 
      user: { nome, email, cargo } 
    });
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    return NextResponse.json({ message: "Erro ao salvar" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID não fornecido" }, { status: 400 });
    }
    
    const db = await getDb();
    
    // Evitar que o admin_01 seja excluído por engano
    if (id === "admin_01") {
      return NextResponse.json({ message: "Não é possível excluir o administrador mestre" }, { status: 403 });
    }

    db.data.users = db.data.users.filter(u => u.id !== id);
    await db.write();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao excluir" }, { status: 500 });
  }
}