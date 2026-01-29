"use server";

import * as XLSX from "xlsx";

export async function identificarColunas(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("Arquivo não encontrado");

  const bytes = await file.arrayBuffer();
  
  const workbook = XLSX.read(bytes, { 
    type: "buffer",
    codepage: 65001 // Garante suporte a acentos (UTF-8)
  });
  
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  /**
   * MUDANÇA PRINCIPAL:
   * Ao remover 'header: 1', o XLSX usa a primeira linha automaticamente como chaves do objeto.
   * Se a planilha tem "Nome", "ISRC", "Data", o objeto será { Nome: "...", ISRC: "...", Data: "..." }.
   */
  const rawData = XLSX.utils.sheet_to_json(sheet, { 
    defval: "" // Mantém campos vazios como "" para não quebrar o layout
  });

  if (!rawData.length) throw new Error("O arquivo parece estar vazio ou não possui cabeçalhos");

  // Retornamos os dados brutos (todos os campos de todas as colunas)
  return {
    tipoArquivo: file.name.split('.').pop()?.toUpperCase(),
    preview: rawData // Agora é um array de objetos dinâmicos
  };
}