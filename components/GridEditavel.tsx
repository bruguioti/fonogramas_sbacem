"use client";
import { useState, useMemo } from "react";
import { X, Save, Search, Database, Plus, Table as TableIcon, ChevronLeft, ChevronRight, Trash2, Download } from "lucide-react";
// IMPORTANTE: Certifique-se que no seu arquivo lib/gerador-txt.ts a função exportada se chama exportarParaEcad
import { exportarParaEcad } from "@/lib/gerador-txt";

export default function GridConferencia({ dadosIniciais, aoFinalizar, aoCancelar }: any) {
  const [dados, setDados] = useState(dadosIniciais || []);
  const [filtro, setFiltro] = useState("");
  const [colunas, setColunas] = useState<string[]>(() => {
    if (!dadosIniciais || dadosIniciais.length === 0) return [];
    return Object.keys(dadosIniciais[0]);
  });

  // --- EXCLUSÃO CORRIGIDA (Usa a referência do objeto para não apagar errado no filtro) ---
  const apagarLinha = (itemParaRemover: any) => {
    if (confirm("Deseja realmente excluir esta linha?")) {
      const novosDados = dados.filter((item: any) => item !== itemParaRemover);
      setDados(novosDados);
    }
  };

  const apagarColuna = (nomeCol: string) => {
    if (confirm(`Excluir a coluna "${nomeCol}" e todos os seus dados?`)) {
      setColunas(colunas.filter(c => c !== nomeCol));
      setDados(dados.map((item: any) => {
        const novoItem = { ...item };
        delete novoItem[nomeCol];
        return novoItem;
      }));
    }
  };

  // --- MOVIMENTAÇÃO E ADIÇÃO ---
  const moverColuna = (index: number, direcao: 'esquerda' | 'direita') => {
    const novaPosicao = direcao === 'esquerda' ? index - 1 : index + 1;
    if (novaPosicao < 0 || novaPosicao >= colunas.length) return;
    const novasColunas = [...colunas];
    const [colunaRemovida] = novasColunas.splice(index, 1);
    novasColunas.splice(novaPosicao, 0, colunaRemovida);
    setColunas(novasColunas);
  };

  const adicionarLinha = () => {
    const novaLinha = colunas.reduce((acc, col) => ({ ...acc, [col]: "" }), {});
    setDados([novaLinha, ...dados]);
  };

  const adicionarColuna = () => {
    const nomeCol = prompt("Nome da nova coluna:");
    if (nomeCol && !colunas.includes(nomeCol)) {
      setColunas([...colunas, nomeCol]);
      setDados(dados.map((item: any) => ({ ...item, [nomeCol]: "" })));
    }
  };

  // --- EDIÇÃO CORRIGIDA (Mapeia o array original para garantir persistência) ---
  const handleChange = (itemReferencia: any, campo: string, valor: string) => {
    setDados((prev: any[]) => 
      prev.map((item) => {
        if (item === itemReferencia) {
          return { ...item, [campo]: valor };
        }
        return item;
      })
    );
  };

  const dadosFiltrados = useMemo(() => {
    if (!filtro) return dados;
    const termo = filtro.toLowerCase();
    return dados.filter((item: any) =>
      Object.values(item).some((v) => String(v).toLowerCase().includes(termo))
    );
  }, [dados, filtro]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[98vw] h-[92vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        
        {/* HEADER */}
        <header className="p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#D8315B] to-[#8E44AD] p-3 rounded-2xl shadow-lg shadow-pink-100">
              <Database className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Conferência SBACEM</h2>
              <p className="text-sm text-slate-500 font-medium">Gestão total de colunas e registros.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={adicionarLinha} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 transition-all">
              <Plus size={16} className="text-[#D8315B]" /> Linha
            </button>
            <button onClick={adicionarColuna} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 transition-all">
              <TableIcon size={16} className="text-[#8E44AD]" /> Coluna
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2" />
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Filtrar..."
                className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 focus:border-pink-200 rounded-xl outline-none text-sm w-48 focus:w-64 transition-all"
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            <button onClick={aoCancelar} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
          </div>
        </header>

        {/* TABELA */}
        <div className="flex-1 overflow-auto bg-slate-50/30 custom-scrollbar">
          <table className="border-separate border-spacing-0 table-fixed" style={{ width: `${(colunas.length * 240) + 60}px` }}>
            <thead className="sticky top-0 z-20 shadow-sm">
              <tr>
                {colunas.map((col, index) => (
                  <th key={col} className="p-4 bg-slate-50 border-b border-r border-slate-100 group/th">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">{col}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover/th:opacity-100 transition-opacity">
                        <button onClick={() => moverColuna(index, 'esquerda')} className="p-1 hover:bg-white rounded-md text-slate-400"><ChevronLeft size={14} /></button>
                        <button onClick={() => moverColuna(index, 'direita')} className="p-1 hover:bg-white rounded-md text-slate-400"><ChevronRight size={14} /></button>
                        <button onClick={() => apagarColuna(col)} className="p-1 hover:bg-red-50 rounded-md text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="w-[60px] bg-slate-50 border-b border-slate-100"></th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {dadosFiltrados.map((item: any, idxVisual: number) => (
                <tr key={idxVisual} className="group/tr hover:bg-slate-50/50 transition-colors">
                  {colunas.map((col) => (
                    <td key={col} className="p-1 border-b border-r border-slate-50 last:border-r-0">
                      <textarea 
                        rows={1}
                        value={item[col] || ""} 
                        onChange={(e) => handleChange(item, col, e.target.value)}
                        className="w-full p-2 bg-transparent border-none focus:ring-2 focus:ring-[#D8315B]/20 rounded-lg text-sm text-slate-600 resize-none hover:bg-white focus:bg-white transition-all outline-none"
                      />
                    </td>
                  ))}
                  <td className="p-1 border-b border-slate-50 text-center">
                    <button 
                      onClick={() => apagarLinha(item)}
                      className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/tr:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <footer className="p-6 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              {dados.length} Linhas
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => exportarParaEcad(dados, colunas, 'txt')}
              className="flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl text-xs font-bold transition-all border border-pink-100"
            >
              <Download size={14} /> .TXT
            </button>
            <button 
              onClick={() => exportarParaEcad(dados, colunas, 'csv')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-all border border-blue-100"
            >
              <Download size={14} /> .CSV
            </button>

            <div className="w-[1px] bg-slate-200 mx-2" />

            <button onClick={aoCancelar} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">
              Descartar
            </button>
            <button 
              onClick={() => aoFinalizar({ dados, colunas })}
              className="px-8 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl transition-all flex items-center gap-2"
            >
              <Save size={18} /> Salvar no Banco
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}