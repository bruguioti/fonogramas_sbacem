// lib/db.ts
import { JSONFilePreset } from 'lowdb/node';

export type Phonogram = {
  id: string;
  isrc: string;
  titulo: string;
  interprete: string;
  produtor: string;
  batchId: string;
};

export type Batch = {
  id: string;
  userId: string;
  totalItems: number;
  createdAt: string;
};

export type DatabaseSchema = {
  users: any[];
  batches: Batch[];
  phonograms: Phonogram[];
};

const defaultData: DatabaseSchema = { users: [], batches: [], phonograms: [] };

export const getDb = async () => {
  return await JSONFilePreset<DatabaseSchema>('db.json', defaultData);
};