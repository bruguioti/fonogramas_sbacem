"use client";
import { useState, useEffect } from "react";
import { UserPlus, Shield, User, Trash2, Mail, BadgeCheck } from "lucide-react";

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoUser, setNovoUser] = useState({ nome: "", email: "", senha: "", cargo: "funcionario" });

  useEffect(() => { carregarUsuarios(); }, []);

  const carregarUsuarios = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsuarios(data);
  };

  const handlesalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(novoUser),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      setNovoUser({ nome: "", email: "", senha: "", cargo: "funcionario" });
      carregarUsuarios();
    }
  };

  const excluirUser = async (id: string) => {
    if (confirm("Excluir usuário?")) {
      await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      carregarUsuarios();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Equipe</h1>
          <p className="text-slate-500">Controle quem acessa o sistema SBACEM.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULÁRIO DE CADASTRO */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-[#D8315B]" /> Novo Cadastro
          </h2>
          <form onSubmit={handlesalvar} className="space-y-4">
            <input placeholder="Nome" className="w-full p-3 bg-slate-50 rounded-xl outline-none" 
              value={novoUser.nome} onChange={e => setNovoUser({...novoUser, nome: e.target.value})} required />
            
            <input type="email" placeholder="E-mail" className="w-full p-3 bg-slate-50 rounded-xl outline-none" 
              value={novoUser.email} onChange={e => setNovoUser({...novoUser, email: e.target.value})} required />
            
            <input type="password" placeholder="Senha" className="w-full p-3 bg-slate-50 rounded-xl outline-none" 
              value={novoUser.senha} onChange={e => setNovoUser({...novoUser, senha: e.target.value})} required />
            
            <select className="w-full p-3 bg-slate-50 rounded-xl outline-none" 
              value={novoUser.cargo} onChange={e => setNovoUser({...novoUser, cargo: e.target.value})}>
              <option value="funcionario">Funcionário Comum</option>
              <option value="admin">Administrador (Total)</option>
            </select>

            <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all">
              Criar Acesso
            </button>
          </form>
        </div>

        {/* LISTA DE USUÁRIOS */}
        <div className="lg:col-span-2 space-y-4">
          {usuarios.map((u: any) => (
            <div key={u.id} className="bg-white p-5 rounded-2xl flex items-center justify-between border border-slate-50 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${u.cargo === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                  {u.cargo === 'admin' ? <Shield size={24} /> : <User size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    {u.nome} {u.cargo === 'admin' && <BadgeCheck size={16} className="text-purple-500" />}
                  </h3>
                  <p className="text-sm text-slate-400 flex items-center gap-1"><Mail size={12} /> {u.email}</p>
                </div>
              </div>
              <button onClick={() => excluirUser(u.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}