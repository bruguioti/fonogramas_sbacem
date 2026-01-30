"use client";
import { useState, useEffect } from "react";
import { 
  UserPlus, Shield, User, Trash2, Mail, 
  BadgeCheck, Loader2, Key, UserCog 
} from "lucide-react";

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  
  // Estado para o formulário
  const [novoUser, setNovoUser] = useState({ 
    nome: "", 
    email: "", 
    senha: "", 
    cargo: "funcionario" 
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(novoUser),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setNovoUser({ nome: "", email: "", senha: "", cargo: "funcionario" });
        await carregarUsuarios();
      } else {
        const err = await res.json();
        alert(err.message || "Erro ao salvar usuário");
      }
    } catch (error) {
      alert("Falha na conexão com o servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const excluirUser = async (id: string) => {
    if (confirm("Tem certeza que deseja remover o acesso deste usuário?")) {
      try {
        const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
        if (res.ok) await carregarUsuarios();
      } catch (error) {
        alert("Erro ao excluir.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit sticky top-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-pink-100 p-2 rounded-lg">
              <UserPlus size={20} className="text-pink-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Novo Acesso</h2>
          </div>

          <form onSubmit={handleSalvar} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nome Completo</label>
              <input 
                placeholder="Ex: João Silva" 
                className="w-full p-3.5 bg-slate-50 border border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all text-sm" 
                value={novoUser.nome} 
                onChange={e => setNovoUser({...novoUser, nome: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="email"
                  placeholder="email@sbacem.org.br" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all text-sm" 
                  value={novoUser.email} 
                  onChange={e => setNovoUser({...novoUser, email: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Senha Provisória</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="password"
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all text-sm" 
                  value={novoUser.senha} 
                  onChange={e => setNovoUser({...novoUser, senha: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nível de Acesso</label>
              <select 
                className="w-full p-3.5 bg-slate-50 border border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all text-sm appearance-none" 
                value={novoUser.cargo} 
                onChange={e => setNovoUser({...novoUser, cargo: e.target.value})}
              >
                <option value="funcionario">Funcionário (Apenas Importar)</option>
                <option value="admin">Administrador (Total)</option>
              </select>
            </div>

            <button 
              disabled={enviando}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {enviando ? <Loader2 className="animate-spin" size={20} /> : "Finalizar Cadastro"}
            </button>
          </form>
        </div>

        {/* COLUNA DIREITA: LISTAGEM */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4 px-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <UserCog size={16} /> Usuários Ativos ({usuarios.length})
            </h3>
          </div>

          {carregando ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-300">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-sm font-medium">Sincronizando banco...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {usuarios.map((u: any) => (
                <div 
                  key={u.id} 
                  className="bg-white p-6 rounded-3xl flex items-center justify-between border border-slate-50 hover:border-pink-100 hover:shadow-xl hover:shadow-pink-500/5 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      u.cargo === 'admin' 
                        ? 'bg-purple-50 text-purple-500' 
                        : 'bg-pink-50 text-pink-500'
                    }`}>
                      {u.cargo === 'admin' ? <Shield size={28} /> : <User size={28} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        {u.nome}
                        {u.cargo === 'admin' && (
                          <span className="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Admin</span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-400 font-medium">{u.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => excluirUser(u.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Excluir Usuário"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}

              {usuarios.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">Nenhum usuário cadastrado.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}