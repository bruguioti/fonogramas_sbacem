"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

const purificar = (dados: any) => JSON.parse(JSON.stringify(dados));

export async function buscarHistorico() {
  const db = await getDb();
  return purificar(db.data?.batches || []);
}

export async function salvarLote(userId: string, dados: any[], loteIdExistente?: string) {
  const db = await getDb();
  if (!db.data.batches) db.data.batches = [];

  const idDoLote = loteIdExistente || Math.random().toString(36).substring(2, 9);

  const novoLote = {
    id: idDoLote,
    userId: userId,
    totalItems: dados.length,
    createdAt: loteIdExistente 
      ? db.data.batches.find((b: any) => b.id === loteIdExistente)?.createdAt 
      : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phonograms: dados 
  };

  if (loteIdExistente) {
    const index = db.data.batches.findIndex((b: any) => b.id === loteIdExistente);
    if (index !== -1) db.data.batches[index] = novoLote;
  } else {
    db.data.batches.push(novoLote);
  }

  await db.write();
  revalidatePath("/dashboard");
  return { success: true, id: idDoLote };
}

export async function excluirLote(loteId: string, usuarioNome: string) {
  const db = await getDb();
  const loteOriginal = db.data.batches.find((b: any) => b.id === loteId);
  if (!loteOriginal) return { success: false, error: "Lote não encontrado" };

  if (!db.data.logs) db.data.logs = [];
  
  const registroLog = {
    id: Math.random().toString(36).substring(2, 9),
    acao: "EXCLUSÃO",
    usuario: usuarioNome,
    detalhes: `Lote ${loteId} com ${loteOriginal.totalItems} registros foi apagado.`,
    data: new Date().toISOString()
  };

  db.data.logs.push(registroLog);
  db.data.batches = db.data.batches.filter((b: any) => b.id !== loteId);

  await db.write();
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * NOVA FUNÇÃO: Gera métricas para o Dashboard
 * Identifica colunas dinamicamente em todos os lotes
 */
export async function obterMetricasDashboard() {
  const db = await getDb();
  const lotes = db.data?.batches || [];
  const logs = db.data?.logs || [];

  // 1. Mapeia TODAS as chaves únicas de colunas usadas em todos os lotes
  const todasColunas = new Set<string>();
  lotes.forEach((lote: any) => {
    if (lote.phonograms && lote.phonograms.length > 0) {
      Object.keys(lote.phonograms[0]).forEach(col => todasColunas.add(col));
    }
  });

  // 2. Calcula totais gerais
  const totalRegistros = lotes.reduce((acc: number, b: any) => acc + b.totalItems, 0);

  return purificar({
    resumo: {
      lotesAtivos: lotes.length,
      totalRegistros,
      colunasDetectadas: Array.from(todasColunas),
    },
    logsRecentes: logs.slice(-5).reverse(), // Últimos 5 logs de exclusão
  });
}