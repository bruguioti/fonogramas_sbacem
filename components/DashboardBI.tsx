"use client";
import { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Calculator, BarChart3, PieChart as PieIcon, Coins, TrendingUp, Users, FileText, Download } from 'lucide-react';
import { toPng } from 'html-to-image';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

export function VisualizacaoBI({ dados }: { dados: any[] }) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const colunas = useMemo(() => Object.keys(dados[0] || {}), [dados]);
  
  const colunasNumericas = useMemo(() => {
    return colunas.filter(c => {
      const valor = dados[0][c];
      return typeof valor === 'number' || (!isNaN(parseFloat(String(valor).replace(',', '.'))) && isFinite(Number(String(valor).replace(',', '.'))));
    });
  }, [colunas, dados]);

  const [colunaAgrupar, setColunaAgrupar] = useState(colunas[0]);
  const [colunaSomar, setColunaSomar] = useState(colunasNumericas[0] || '');

  const exportarImagem = async () => {
    if (dashboardRef.current === null) return;
    try {
      const dataUrl = await toPng(dashboardRef.current, { 
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: { padding: '40px' } 
      });
      const link = document.createElement('a');
      link.download = `Relatorio-Gestao-${colunaAgrupar}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao exportar:", err);
    }
  };

  const dadosProcessados = useMemo(() => {
    const mapa = dados.reduce((acc: any, item: any) => {
      const chave = String(item[colunaAgrupar] || 'Não Informado').substring(0, 30);
      let valorRaw = item[colunaSomar] || 0;
      if (typeof valorRaw === 'string') valorRaw = parseFloat(valorRaw.replace(',', '.'));
      const valor = isNaN(valorRaw) ? 0 : valorRaw;

      if (!acc[chave]) acc[chave] = { name: chave, value: 0, count: 0 };
      acc[chave].value += valor;
      acc[chave].count += 1;
      return acc;
    }, {});

    return Object.values(mapa).sort((a: any, b: any) => b.value - a.value);
  }, [dados, colunaAgrupar, colunaSomar]);

  const stats = useMemo(() => {
    const total = dadosProcessados.reduce((acc, curr: any) => acc + curr.value, 0);
    return {
      total,
      ticketMedio: dados.length > 0 ? total / dados.length : 0,
      distintos: dadosProcessados.length
    };
  }, [dadosProcessados, dados]);

  const top10 = dadosProcessados.slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* BOTÕES DE AÇÃO */}
      <div className="flex justify-end gap-2">
        <button 
          onClick={exportarImagem}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-100"
        >
          <Download size={18} /> Exportar PNG para Gestão
        </button>
      </div>

      {/* CONTEÚDO DO DASHBOARD */}
      <div ref={dashboardRef} className="space-y-8">
        
        {/* INDICADORES (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICardDark label="Montante Total" value={stats.total} />
          <KPICard label="Média por Item" value={stats.ticketMedio} icon={<TrendingUp size={14}/>} color="text-blue-600" />
          <KPICard label="Grupos Ativos" value={stats.distintos} icon={<Users size={14}/>} color="text-purple-600" isMoney={false} />
          <KPICard label="Linhas Processadas" value={dados.length} icon={<FileText size={14}/>} color="text-green-600" isMoney={false} />
        </div>

        {/* GRÁFICOS REAIS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-[480px] flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
              <BarChart3 size={14}/> Top 10 Performance ({colunaAgrupar})
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip 
                    formatter={(v: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)}
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[0, 12, 12, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-[480px] flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
              <PieIcon size={14}/> Share de Receita (%)
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={top10} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                    {top10.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)} />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SELETORES (CONTROLES) */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calculator size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Unir por</p>
            <select value={colunaAgrupar} onChange={(e) => setColunaAgrupar(e.target.value)} className="text-sm font-bold border-none p-0 focus:ring-0 bg-transparent cursor-pointer">
              {colunas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Coins size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Somar Valor de</p>
            <select value={colunaSomar} onChange={(e) => setColunaSomar(e.target.value)} className="text-sm font-bold border-none p-0 focus:ring-0 bg-transparent cursor-pointer">
              {colunasNumericas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, color, isMoney = true }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
      <div className={`flex items-center gap-2 ${color} mb-2`}>
        {icon} <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-mono font-bold text-gray-800 uppercase">
        {isMoney ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : value}
      </p>
    </div>
  );
}

function KPICardDark({ label, value }: any) {
  return (
    <div className="bg-gray-900 p-6 rounded-[2rem] text-white">
      <div className="flex items-center gap-2 opacity-60 mb-2">
        <Coins size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-mono font-bold">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
      </p>
    </div>
  );
}