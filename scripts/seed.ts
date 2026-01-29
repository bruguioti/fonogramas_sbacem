// scripts/seed.ts
const { Client } = require('pg');

const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'sbacem_pro',
  password: 'admin123',
  port: 5432,
});

async function seed() {
  try {
    await client.connect();
    console.log("🚀 Conectado ao Postgres no Docker...");

    // 1. Criar Tabela
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        cargo VARCHAR(50) DEFAULT 'Gestor'
      );
    `);
    console.log("✅ Tabela 'usuarios' verificada.");

    // 2. Limpar e Inserir Usuários (Exemplo de script de geração)
    const usuarios = [
      ['Administrador', 'admin@sbacem.org.br', 'admin123', 'Admin'],
      ['Victor', 'victor@sbacem.org.br', 'sbacem2026', 'Gestor']
    ];

    for (const user of usuarios) {
      await client.query(
        `INSERT INTO usuarios (nome, email, senha, cargo) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) DO NOTHING`,
        user
      );
    }

    console.log("👥 Usuários gerados com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao rodar o script:", err);
  } finally {
    await client.end();
  }
}

seed();