// app/fonogramas/page.tsx
"use client";
import { useState, useMemo } from "react";
import { Search, Filter, CheckCircle, AlertTriangle, Send, MoreVertical } from "lucide-react";

export default function GestaoFonogramas() {
  const [busca, setBusca] = useState("");
  const [filtroProdutor, setFiltroProdutor] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);

  // Filtros Otimizados
  const listagemFiltrada = useMemo(() => {
    return dbDados.filter(f => {
      const matchBusca = f.titulo.toLowerCase().includes(busca.toLowerCase()) || f.isrc.includes(busca);
      const matchProdutor = filtroProdutor === "" || f.produtor === filtroProdutor;
      return matchBusca && matchProdutor;
    });
  }, [busca, filtroProdutor]);

  const toggleSelect = (id: string) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selecionados.length === listagemFiltrada.length) setSelecionados([]);
    else setSelecionados(listagemFiltrada.map(f => f.id));
  };

  return (
    <div className="p-4 md:p-10 min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 relative overflow-hidden">
      
      {/* Background Decorativo para realçar o Glassmorphism */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-300 rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Cabeçalho de Ações */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestão de Fonogramas</h1>
            <p className="text-slate-500 font-medium">Controle de remessas e validação de ISRC</p>
          </div>

          <button 
            disabled={selecionados.length === 0}
            className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none hover:-translate-y-1"
          >
            <Send size={20} />
            Exportar Selecionados ({selecionados.length})
          </button>
        </header>

        {/* Barra de Filtros Glassmorphism */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Buscar por ISRC ou Título..." 
              className="w-full pl-12 pr-4 py-3 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                onChange={(e) => setFiltroProdutor(e.target.value)} 
                className="pl-12 pr-10 py-3 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-slate-600 cursor-pointer transition-all"
              >
                <option value="">Todos os Produtores</option>
                <option value="Produtor A">Produtor A</option>
                <option value="Produtor B">Produtor B</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela com Efeito de Vidro */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/30 text-[11px] font-black uppercase tracking-[2px] text-slate-400 border-b border-white/40">
                  <th className="p-6">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                      checked={selecionados.length === listagemFiltrada.length && listagemFiltrada.length > 0}
                      onChange={selectAll}
                    />
                  </th>
                  <th className="p-6">ISRC</th>
                  <th className="p-6">Título</th>
                  <th className="p-6">Produtor</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {listagemFiltrada.map(f => (
                  <tr key={f.id} className="hover:bg-white/50 transition-colors group cursor-default">
                    <td className="p-6">
                       <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                        checked={selecionados.includes(f.id)}
                        onChange={() => toggleSelect(f.id)}
                       />
                    </td>
                    <td className="p-6">
                      <span className="font-mono font-black text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg border border-indigo-100/50">
                        {f.isrc}
                      </span>
                    </td>
                    <td className="p-6 font-bold text-slate-700">{f.titulo}</td>
                    <td className="p-6 font-medium text-slate-500">{f.produtor}</td>
                    <td className="p-6">
                      <div className={`flex items-center gap-2 w-fit px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase border ${
                        f.status === 'ERRO' 
                          ? 'bg-red-50 text-red-600 border-red-100' 
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {f.status === 'ERRO' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                        {f.status}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}