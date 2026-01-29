"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  Download, LayoutDashboard, FileAudio, 
  History, LogOut, Edit3, BarChart3, Settings, Plus, Menu,
  Trash2, AlertCircle, Database, Filter, Search as SearchIcon,
  PieChart, ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import GridConferencia from "@/components/GridEditavel"; 
import { identificarColunas } from "@/app/actions/importar-planilha"; 
import { exportarParaEcad } from "@/lib/gerador-txt";
import { 
  salvarLote, 
  buscarHistorico, 
  excluirLote, 
  obterMetricasDashboard 
} from "@/app/actions/fonogramas";
import { VisualizacaoBI } from "@/components/DashboardBI";

export default function AppIntranet() {
  const router = useRouter();
  
  // Estados de Interface e Dados
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [dadosParaConferir, setDadosParaConferir] = useState<any[] | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [loteSendoEditado, setLoteSendoEditado] = useState<string | null>(null);
  const [loteSelecionadoBI, setLoteSelecionadoBI] = useState<string>("");
  const [loteParaApagar, setLoteParaApagar] = useState<string | null>(null);
  const [isExcluindo, setIsExcluindo] = useState(false);

  // Memoização para performance do BI
  const dadosBI = useMemo(() => {
    if (!loteSelecionadoBI) return null;
    const lote = historico.find(h => h.id === loteSelecionadoBI);
    return lote ? lote.conteudo : null;
  }, [loteSelecionadoBI, historico]);

  // Carregamento de dados (Sincronização com Banco)
  const carregarTudo = async () => {
    try {
      const [dadosHistorico, dadosMetricas] = await Promise.all([
        buscarHistorico(),
        obterMetricasDashboard()
      ]);

      const formatados = dadosHistorico.map((b: any) => ({
        id: b.id,
        data: b.createdAt ? new Date(b.createdAt).toLocaleDateString("pt-BR") : "---",
        quantidade: b.totalItems || 0,
        conteudo: b.phonograms || []
      }));

      setHistorico(formatados.reverse());
      setMetricas(dadosMetricas);
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error);
    }
  };

  useEffect(() => { carregarTudo(); }, []);

  // Handlers de Ações
  const handleExcluirLote = async () => {
    if (!loteParaApagar) return;
    setIsExcluindo(true);
    const res = await excluirLote(loteParaApagar, "Administrador");
    if (res.success) {
      await carregarTudo();
      setLoteParaApagar(null);
    }
    setIsExcluindo(false);
  };

  const salvarEExportar = async (dadosAjustados: any[]) => {
    const resultado = await salvarLote("admin_01", dadosAjustados, loteSendoEditado || undefined); 
    if (resultado.success) {
      await carregarTudo();
      exportarParaEcad(dadosAjustados);
      setDadosParaConferir(null);
      setLoteSendoEditado(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const result = await identificarColunas(formData);
    setDadosParaConferir(result.preview);
    e.target.value = "";
  };

  return (
    <div className="flex h-screen w-full bg-white text-[#1f1f1f] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? "w-72" : "w-20"} flex-shrink-0 bg-[#f0f4f9] transition-all duration-300 flex flex-col p-4 border-r border-gray-100`}>
        <div className="flex items-center justify-between mb-8 px-2">
          {isSidebarOpen && (
            <span className="font-semibold text-xl tracking-tight text-gray-800 italic">
              SBACEM <span className="text-blue-600">PRO</span>
            </span>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
            <Menu size={20} />
          </button>
        </div>

        <button 
          onClick={() => document.getElementById('fileInput')?.click()}
          className="flex items-center gap-3 bg-[#e9eef6] hover:bg-[#dce3f0] p-4 rounded-2xl transition-all mb-8 shadow-sm text-gray-700 overflow-hidden"
        >
          <Plus className="text-blue-600 shrink-0" size={24} />
          {isSidebarOpen && <span className="font-medium text-sm">Nova Importação</span>}
          <input id="fileInput" type="file" className="hidden" accept=".xlsx,.csv" onChange={handleFileUpload} />
        </button>

        <nav className="flex-1 space-y-1">
          <SideItem icon={<LayoutDashboard size={20}/>} label="Geral" active={abaAtiva === 'dashboard'} isOpen={isSidebarOpen} onClick={() => setAbaAtiva('dashboard')} />
          <SideItem icon={<BarChart3 size={20}/>} label="Gráficos BI" active={abaAtiva === 'graficos'} isOpen={isSidebarOpen} onClick={() => setAbaAtiva('graficos')} />
          <SideItem icon={<History size={20}/>} label="Remessas" active={abaAtiva === 'historico'} isOpen={isSidebarOpen} onClick={() => setAbaAtiva('historico')} />
        </nav>

        <button 
          onClick={() => router.push("/login")} 
          className="flex items-center gap-3 p-4 hover:bg-red-50 text-red-500 rounded-2xl transition-colors mt-auto group"
        >
          <LogOut size={20} className="shrink-0 group-hover:translate-x-1 transition-transform" />
          {isSidebarOpen && <span className="font-medium">Sair do Sistema</span>}
        </button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 h-full overflow-y-auto bg-white pt-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto pb-20">
          
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-normal text-gray-900 mb-2 tracking-tight">
                Olá, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">Administrador</span>
              </h1>
              <p className="text-gray-500 text-xl font-light">Gestão universal de relatórios e fonogramas.</p>
            </div>
          </header>

          {/* ABA DASHBOARD */}
          {abaAtiva === 'dashboard' && metricas && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Itens no Banco" value={metricas.resumo.totalRegistros} icon={<Database className="text-blue-500" />} />
                <StatCard label="Colunas Mapeadas" value={metricas.resumo.colunasDetectadas.length} icon={<Filter className="text-purple-500" />} />
                <StatCard label="Lotes Ativos" value={metricas.resumo.lotesAtivos} icon={<History className="text-green-500" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mb-6">Colunas Detectadas</h3>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                    {metricas.resumo.colunasDetectadas.map((col: string) => (
                      <span key={col} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-[11px] font-semibold border border-gray-100">
                        {col}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mb-6">Logs de Auditoria</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {metricas.logsRecentes.map((log: any) => (
                      <div key={log.id} className="flex gap-4 p-4 bg-red-50/30 rounded-2xl border border-red-50/50">
                        <Trash2 size={16} className="text-red-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-800">{log.usuario} deletou um lote</p>
                          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{log.detalhes}</p>
                          <p className="text-[9px] text-red-400 mt-2 font-mono uppercase">{new Date(log.data).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* ABA GRÁFICOS BI */}
          {abaAtiva === 'graficos' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Inteligência de BI</h2>
                  <p className="text-sm text-gray-500">Selecione um relatório para processar os gráficos</p>
                </div>
                
                <div className="relative min-w-[280px]">
                  <select 
                    value={loteSelecionadoBI}
                    onChange={(e) => setLoteSelecionadoBI(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
                  >
                    <option value="">Selecione um lote...</option>
                    {historico.map((lote) => (
                      <option key={lote.id} value={lote.id}>Lote {lote.data} - {lote.quantidade} itens</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              {dadosBI ? (
                <VisualizacaoBI dados={dadosBI} />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-100 rounded-[3rem] text-gray-400">
                   <Database size={48} className="mb-4 opacity-20" />
                   <p>Escolha um relatório acima para visualizar os dados.</p>
                </div>
              )}
            </div>
          )}

          {/* ABA REMESSAS */}
          {abaAtiva === 'historico' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mb-6 px-4">Histórico de Lotes</h3>
                <div className="space-y-1">
                  {historico.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 hover:bg-[#f8fafd] rounded-2xl transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#f0f4f9] rounded-xl flex items-center justify-center text-blue-600">
                          <History size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.quantidade} Registros</p>
                          <p className="text-xs text-gray-400">{item.data}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setLoteSendoEditado(item.id); setDadosParaConferir(item.conteudo); }} className="p-2 bg-white border border-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-all shadow-sm">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => exportarParaEcad(item.conteudo)} className="p-2 bg-white border border-gray-100 rounded-lg text-gray-500 hover:text-green-600 transition-all shadow-sm">
                          <Download size={18} />
                        </button>
                        <button onClick={() => setLoteParaApagar(item.id)} className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-all shadow-sm">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* MODAIS */}
        {loteParaApagar && (
          <div className="fixed inset-0 z-[150] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center">
              <AlertCircle size={32} className="text-red-500 mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-2">Excluir Lote?</h3>
              <p className="text-sm text-gray-500 mb-8">Esta ação não poderá ser desfeita.</p>
              <div className="flex gap-3">
                <button onClick={() => setLoteParaApagar(null)} className="flex-1 py-3 text-gray-500">Cancelar</button>
                <button onClick={handleExcluirLote} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl">
                  {isExcluindo ? "..." : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        )}

        {dadosParaConferir && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col">
            <GridConferencia 
              dadosIniciais={dadosParaConferir} 
              aoFinalizar={salvarEExportar} 
              aoCancelar={() => { setDadosParaConferir(null); setLoteSendoEditado(null); }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

// SUB-COMPONENTES AUXILIARES
function SideItem({ icon, label, active, isOpen, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${active ? "bg-[#d2e3fc] text-[#174ea6]" : "hover:bg-[#e8eaed] text-gray-600"}`}>
      <span className="shrink-0">{icon}</span>
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-[#f8fafd] p-8 rounded-[2rem] border border-[#edf2f7] flex flex-col gap-4 transition-all hover:shadow-md">
      <div className="flex items-center justify-between uppercase text-[10px] font-bold tracking-[2px] text-gray-400">
        {label} {icon}
      </div>
      <div className="text-4xl font-light text-gray-900 tracking-tight">{value}</div>
    </div>
  );
}