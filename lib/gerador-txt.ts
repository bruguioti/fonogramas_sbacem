// lib/gerador-txt.ts

/**
 * Exporta os dados para TXT ou CSV utilizando ";" como delimitador.
 * O nome foi mantido como exportarParaEcad para evitar erros de importação no projeto.
 */
export function exportarParaEcad(dados: any[], colunas: string[], formato: 'txt' | 'csv' = 'txt') {
  const prepararCampo = (txt: any) => {
    const stringLimpa = (txt || "")
      .toString()
      .normalize("NFD") // Remove acentos
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();
    
    // Substitui ponto e vírgula interno por espaço para não quebrar as colunas do arquivo final
    return stringLimpa.replace(/;/g, " ");
  };

  // Montagem do conteúdo (Cabeçalho + Linhas)
  const cabecalho = colunas.join(";");
  const linhas = dados.map((item) => 
    colunas.map((col) => prepararCampo(item[col])).join(";")
  );

  const conteudoCompleto = [cabecalho, ...linhas].join("\r\n");

  // Define o tipo de arquivo e extensão baseado na escolha
  const mimeType = formato === 'txt' ? "text/plain" : "text/csv";
  const extensao = formato === 'txt' ? "txt" : "csv";

  // \uFEFF é o BOM (Byte Order Mark) para garantir que o Excel abra com UTF-8 corretamente
  const blob = new Blob(["\uFEFF" + conteudoCompleto], { 
    type: `${mimeType};charset=utf-8` 
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  
  const data = new Date().toISOString().split('T')[0];
  a.download = `REMESSA_SBACEM_${data}.${extensao}`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}