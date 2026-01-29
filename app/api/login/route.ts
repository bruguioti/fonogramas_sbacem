import { NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    // Busca no banco do Docker usando o SQL que geramos no seed
    const query = "SELECT id, nome, email FROM usuarios WHERE email = $1 AND senha = $2 LIMIT 1";
    const result = await client.query(query, [email, senha]);

    await client.end();

    if (result.rows.length > 0) {
      return NextResponse.json({ 
        success: true, 
        user: result.rows[0] 
      });
    } else {
      return NextResponse.json(
        { message: "Usuário ou senha incorretos." },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Erro no SQL:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor SQL." },
      { status: 500 }
    );
  }
}