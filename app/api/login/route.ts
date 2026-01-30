import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    const db = await getDb();

    // 1. Se o banco estiver vazio, cria o admin com o campo CARGO
    if (db.data.users.length === 0) {
      db.data.users.push({
        id: "admin_01",
        email: "admin@admin.com",
        senha: "123456",
        nome: "Admin Inicial",
        cargo: "admin" // <--- ADICIONADO AQUI
      });
      await db.write();
    }

    // 2. Busca o usuário
    const user = db.data.users.find(
      (u) => u.email === email && (u.senha === senha || u.password === senha)
    );

    if (user) {
      // 3. RETORNA O CARGO PARA O FRONT-END
      return NextResponse.json({ 
        success: true,
        user: { 
          id: user.id, 
          name: user.nome, 
          email: user.email,
          cargo: user.cargo || "funcionario" // <--- ENVIANDO PARA O FRONT
        } 
      });
    }

    return NextResponse.json(
      { success: false, message: "E-mail ou senha incorretos." },
      { status: 401 }
    );

  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao acessar o banco de dados." },
      { status: 500 }
    );
  }
}