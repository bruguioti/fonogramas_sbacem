export function exportarParaEcad(dados: any[]) {
  const formatarLinha = (item: any) => {
    // 1. Limpeza: Sistemas antigos odeiam acentos ou caracteres especiais
    const limpar = (txt: string) => 
      (txt || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .toUpperCase()
        .replace(/[^A-Z0-9 ]/g, ""); // Mantém apenas letras, números e espaços

    // 2. Aplicação do Layout de largura fixa
    const isrc = limpar(item.isrc).padEnd(12, " ");
    const titulo = limpar(item.titulo).substring(0, 40).padEnd(40, " ");
    const artista = limpar(item.interprete).substring(0, 30).padEnd(30, " ");
    
    return `${isrc}${titulo}${artista}`;
  };

  const conteudo = dados.map(formatarLinha).join("\r\n");

  // 3. Importante: Usar Windows-1252 ou UTF-8 dependendo do validador
  // A maioria dos sistemas legados de direitos autorais prefere Windows-1252
  const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  
  // Nome do arquivo formatado para fácil identificação
  const data = new Date().toISOString().split('T')[0];
  a.download = `REMESSA_SBACEM_${data}.txt`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}