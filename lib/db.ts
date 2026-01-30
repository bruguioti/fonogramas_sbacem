// lib/db.ts
import { JSONFilePreset } from 'lowdb/node';

export type User = {
  id: string;
  email: string;
  senha?: string;    // senha para o login
  password?: string; // fallback se você usou password em algum lugar
  nome: string;
  cargo: "admin" | "funcionario"; // <--- IMPORTANTE: Define o tipo do cargo
};

// ... restante dos tipos (Phonogram, Batch)

export type DatabaseSchema = {
  users: User[]; // <--- Use o tipo User aqui
  batches: any[];
  phonograms: any[];
};

const defaultData: DatabaseSchema = { users: [], batches: [], phonograms: [] };

export const getDb = async () => {
  return await JSONFilePreset<DatabaseSchema>('db.json', defaultData);
};