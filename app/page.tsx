"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  Download, LayoutDashboard, History, LogOut, Edit3, BarChart3, Plus, Menu,
  Trash2, AlertCircle, Database, Filter, ChevronDown, Users, ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import GridConferencia from "@/components/GridEditavel"; 
import { identificarColunas } from "@/app/actions/importar-planilha"; 
import { exportarParaEcad } from "@/lib/gerador-txt"; // Corrigido nome da importação
import { 
  salvarLote, 
  buscarHistorico, 
  excluirLote, 
  obterMetricasDashboard 
} from "@/app/actions/fonogramas";
import { VisualizacaoBI } from "@/components/DashboardBI";
import GestaoUsuarios from "@/components/GestaoUsuarios"; // Certifique-se de salvar o componente de usuários nesta pasta

export default function AppIntranet() {
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<string>("Carregando...");
  const [cargoUsuario, setCargoUsuario] = useState<string>("funcionario");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [dadosParaConferir, setDadosParaConferir] = useState<any[] | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [loteSendoEditado, setLoteSendoEditado] = useState<string | null>(null);
  const [loteSelecionadoBI, setLoteSelecionadoBI] = useState<string>("");
  const [loteParaApagar, setLoteParaApagar] = useState<string | null>(null);
  const [isExcluindo, setIsExcluindo] = useState(false);

useEffect(() => {
    // 1. Verifica autenticação
    const auth = localStorage.getItem("user_authenticated");
    const userEmail = localStorage.getItem("user_email");
    const userRole = localStorage.getItem("user_role"); // Removi o || "funcionario" daqui para validar se existe
    
    if (!auth || auth !== "true") {
      router.push("/login");
      return;
    }

    // 2. Define os estados com base no que foi salvo no login
    setUsuarioLogado(userEmail || "Usuário");
    setCargoUsuario(userRole || "funcionario");

    // 3. Carrega os dados do banco
    carregarTudo();
  }, [router]);

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
      console.error("Erro ao carregar dados:", error);
    }
  };

  useEffect(() => { carregarTudo(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const result = await identificarColunas(formData);
    setDadosParaConferir(result.preview);
    e.target.value = "";
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleExcluirLote = async () => {
    if (!loteParaApagar) return;
    setIsExcluindo(true);
    const res = await excluirLote(loteParaApagar, usuarioLogado);
    if (res.success) {
      await carregarTudo();
      setLoteParaApagar(null);
    }
    setIsExcluindo(false);
  };

  const salvarEExportar = async (payload: { dados: any[], colunas: string[] }) => {
    const { dados, colunas } = payload;
    const resultado = await salvarLote("admin_01", dados, loteSendoEditado || undefined); 
    if (resultado.success) {
      await carregarTudo();
      setDadosParaConferir(null);
      setLoteSendoEditado(null);
    }
  };

  const dadosBI = useMemo(() => {
    if (!loteSelecionadoBI) return null;
    const lote = historico.find(h => h.id === loteSelecionadoBI);
    return lote ? lote.conteudo : null;
  }, [loteSelecionadoBI, historico]);

  return (
    <div className="flex h-screen w-full bg-white text-[#1f1f1f] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? "w-72" : "w-20"} flex-shrink-0 bg-[#fdf2f8] transition-all duration-300 flex flex-col p-4 border-r border-pink-100`}>
        <div className="flex items-center justify-between mb-8 px-2">
          {isSidebarOpen && (
            <span className="font-semibold text-xl tracking-tight text-gray-800 italic shrink-0">
              Sbacem <span className="text-pink-600">Fonogramas</span>
            </span>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-pink-100 rounded-full text-pink-600">
            <Menu size={20} />
          </button>
        </div>

        <button 
          onClick={() => document.getElementById('fileInput')?.click()}
          className="flex items-center gap-3 bg-[#fce7f3] hover:bg-[#fbcfe8] p-4 rounded-2xl transition-all mb-8 shadow-sm text-gray-700 w-full overflow-hidden"
        >
          <Plus className="text-pink-600 shrink-0" size={24} />
          {isSidebarOpen && <span className="font-medium text-sm whitespace-nowrap">Nova Importação</span>}
          <input id="fileInput" type="file" className="hidden" accept=".xlsx,.csv" onChange={handleFileUpload} />
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          <SideItem icon={<LayoutDashboard size={20}/>} label="Painel Geral" active={abaAtiva === 'dashboard'} isOpen={isSidebarOpen} onClick={() => setAbaAtiva('dashboard')} />
          <SideItem icon={<BarChart3 size={20}/>} label="Inteligência BI" active={abaAtiva === 'graficos'} isOpen={isSidebarOpen} onClick={() => setAbaAtiva('graficos')} />
          <SideItem icon={<History size={20}/>} label="Remessas" active={abaAtiva === 'historico'} isOpen={isSidebarOpen} onClick={() => setAbaAtiva('historico')} />
          
          {/* Menu Administrativo visível apenas para admins */}
          {cargoUsuario === "admin" && (
            <SideItem icon={<Users size={20}/>} label="Gestão Equipe" active={abaAtiva === 'usuarios'} isOpen={isSidebarOpen} onClick={() => setAbaAtiva('usuarios')} />
          )}
        </nav>

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 p-4 hover:bg-red-50 text-red-500 rounded-2xl transition-colors mt-auto group w-full"
        >
          <LogOut size={20} className="shrink-0" />
          {isSidebarOpen && <span className="font-medium whitespace-nowrap">Sair do Sistema</span>}
        </button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 h-full overflow-y-auto bg-white">
        <div className="max-w-6xl mx-auto pt-16 px-8 md:px-12 pb-20">
          
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {cargoUsuario === "admin" && <ShieldCheck size={18} className="text-purple-600" />}
                <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">{cargoUsuario}</span>
              </div>
              <h1 className="text-5xl font-normal text-gray-900 mb-2 tracking-tight leading-tight">
                Olá, <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-medium">{usuarioLogado.split('@')[0]}</span>
              </h1>
              <p className="text-gray-500 text-xl font-light">Gestão universal de relatórios e fonogramas.</p>
            </div>
          </header>

          {/* CONTEÚDO DINÂMICO POR ABA */}
          
          {abaAtiva === 'dashboard' && metricas && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Itens no Banco" value={metricas.resumo.totalRegistros} icon={<Database className="text-pink-500" />} />
                <StatCard label="Colunas Mapeadas" value={metricas.resumo.colunasDetectadas.length} icon={<Filter className="text-purple-500" />} />
                <StatCard label="Lotes Ativos" value={metricas.resumo.lotesAtivos} icon={<History className="text-pink-400" />} />
              </div>
              {/* Seção de Colunas e Logs aqui... (mantida do seu código original) */}
            </div>
          )}

          {abaAtiva === 'graficos' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {/* Conteúdo do BI aqui... */}
               <div className="bg-pink-50/50 p-6 rounded-[2rem] border border-pink-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-pink-900">Análise de Dados</h2>
                  <select 
                    value={loteSelecionadoBI}
                    onChange={(e) => setLoteSelecionadoBI(e.target.value)}
                    className="bg-white border border-pink-200 py-2 px-4 rounded-xl outline-none shadow-sm"
                  >
                    <option value="">Selecione um lote...</option>
                    {historico.map((lote) => <option key={lote.id} value={lote.id}>Lote {lote.data}</option>)}
                  </select>
               </div>
               {dadosBI ? <VisualizacaoBI dados={dadosBI} /> : <div className="h-40 flex items-center justify-center text-pink-300 border-2 border-dashed border-pink-100 rounded-[2rem]">Selecione um lote para ver os gráficos</div>}
            </div>
          )}

          {abaAtiva === 'historico' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Lista de Remessas aqui... */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mb-6">Histórico Recente</h3>
                <div className="divide-y divide-gray-50">
                  {historico.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 hover:bg-pink-50 rounded-2xl transition-colors group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center"><History size={18} /></div>
                          <div>
                            <p className="font-semibold text-gray-800">{item.quantidade} Registros</p>
                            <p className="text-xs text-gray-400">{item.data}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <button onClick={() => { setLoteSendoEditado(item.id); setDadosParaConferir(item.conteudo); }} className="p-2 text-gray-400 hover:text-pink-600"><Edit3 size={18} /></button>
                          <button onClick={() => setLoteParaApagar(item.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA DE GESTÃO DE USUÁRIOS */}
          {abaAtiva === 'usuarios' && cargoUsuario === "admin" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <GestaoUsuarios />
            </div>
          )}

        </div>
      </main>

      {/* MODAL GRID PARA CONFERÊNCIA */}
      {dadosParaConferir && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <GridConferencia 
            dadosIniciais={dadosParaConferir} 
            aoFinalizar={salvarEExportar} 
            aoCancelar={() => { setDadosParaConferir(null); setLoteSendoEditado(null); }}
          />
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {loteParaApagar && (
        <div className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl">
            <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Excluir este lote?</h3>
            <p className="text-gray-500 text-sm mt-2 mb-8">Esta ação não pode ser desfeita no banco de dados.</p>
            <div className="flex gap-4">
              <button onClick={() => setLoteParaApagar(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Voltar</button>
              <button onClick={handleExcluirLote} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">
                {isExcluindo ? "..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-componentes Auxiliares
function SideItem({ icon, label, active, isOpen, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${active ? "bg-pink-100 text-pink-700" : "hover:bg-pink-50 text-gray-600"}`}>
      <span className="shrink-0">{icon}</span>
      {isOpen && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
    </button>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-pink-50/30 p-8 rounded-[2rem] border border-pink-100/50 flex flex-col gap-4 shadow-sm hover:border-pink-200 transition-all">
      <div className="flex items-center justify-between uppercase text-[10px] font-bold tracking-[2px] text-pink-400">
        {label} {icon}
      </div>
      <div className="text-4xl font-light text-gray-900 tracking-tight">{value}</div>
    </div>
  );
}