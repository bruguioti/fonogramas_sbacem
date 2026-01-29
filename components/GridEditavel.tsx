"use client";
import { useState, useMemo } from "react";
import { X, Save, Search, Database } from "lucide-react";

export default function GridConferencia({ dadosIniciais, aoFinalizar, aoCancelar }: any) {
  const [dados, setDados] = useState(dadosIniciais);
  const [filtro, setFiltro] = useState("");

  const colunas = useMemo(() => {
    if (!dadosIniciais || dadosIniciais.length === 0) return [];
    return Object.keys(dadosIniciais[0]);
  }, [dadosIniciais]);

  const dadosFiltrados = useMemo(() => {
    if (!filtro) return dados;
    const termo = filtro.toLowerCase();
    return dados.filter((item: any) =>
      Object.values(item).some((valor) => String(valor).toLowerCase().includes(termo))
    );
  }, [dados, filtro]);

  const handleChange = (indexGlobal: number, campo: string, valor: string) => {
    const novosDados = [...dados];
    novosDados[indexGlobal][campo] = valor;
    setDados(novosDados);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      
      {/* Container Principal: max-w-[98vw] para aproveitar o espaço em telas largas */}
      <div className="bg-white w-full max-w-[98vw] h-[92vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        
        {/* HEADER FIXO */}
        <header className="p-6 border-b border-gray-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
              <Database className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight leading-none">Conferência</h2>
              <p className="text-sm text-gray-500 font-light mt-1">
                <span className="font-bold text-blue-600">{colunas.length}</span> colunas x <span className="font-bold text-blue-600">{dados.length}</span> registros
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar em todas as colunas..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-2xl outline-none text-sm transition-all"
            />
          </div>

          <button onClick={aoCancelar} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
            <X size={24} />
          </button>
        </header>

        {/* ÁREA DA TABELA COM ROLAGEM DUPLA (X e Y) */}
        <div className="flex-1 overflow-auto bg-gray-50/50 custom-scrollbar">
          {/* A largura da table é definida dinamicamente: colunas * 200px (mínimo) */}
          <table 
            className="border-separate border-spacing-0 table-fixed" 
            style={{ width: `${colunas.length * 250}px`, minWidth: '100%' }}
          >
            <thead className="sticky top-0 z-20 shadow-sm">
              <tr>
                {colunas.map((col) => (
                  <th 
                    key={col} 
                    className="p-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-[#f8fafd] border-b border-r border-gray-100 last:border-r-0"
                  >
                    <div className="truncate w-full" title={col}>{col}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {dadosFiltrados.map((item: any, idxLinha: number) => (
                <tr key={idxLinha} className="hover:bg-blue-50/30 transition-colors group">
                  {colunas.map((col) => (
                    <td key={col} className="p-1 border-b border-r border-gray-50 last:border-r-0">
                      <textarea 
                        rows={1}
                        value={item[col] || ""} 
                        onChange={(e) => handleChange(idxLinha, col, e.target.value)}
                        className="w-full p-2 bg-transparent border-none focus:ring-1 focus:ring-blue-500/20 rounded-md text-sm text-gray-600 resize-none hover:bg-white focus:bg-white outline-none transition-all overflow-hidden font-normal"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {dadosFiltrados.length === 0 && (
            <div className="sticky left-0 w-[95vw] h-[40vh] flex flex-col items-center justify-center">
              <Search className="text-gray-200 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-300">Nenhum dado encontrado</h3>
            </div>
          )}
        </div>

        {/* FOOTER FIXO */}
        <footer className="p-6 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {dadosFiltrados.length} resultados exibidos
          </div>
          
          <div className="flex gap-4">
            <button onClick={aoCancelar} className="px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
              Descartar
            </button>
            <button 
              onClick={() => aoFinalizar(dados)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Save size={18} /> Confirmar e Pagar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}