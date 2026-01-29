// app/admin/usuarios/page.tsx
"use client";
import { useState } from "react";
import { Shield, UserPlus, Trash2, Edit2, Check, X } from "lucide-react";

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: "João Silva", email: "joao@sbacem.org.br", role: "ADMIN", status: "ATIVO" },
    { id: 2, nome: "Maria Souza", email: "maria@sbacem.org.br", role: "USER", status: "ATIVO" },
  ]);

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestão de Acessos</h1>
          <p className="text-slate-500 font-medium">Controle quem pode exportar remessas e editar fonogramas</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-200 flex items-center gap-2 hover:-translate-y-1 transition-all">
          <UserPlus size={20} /> NOVO USUÁRIO
        </button>
      </header>

      {/* Tabela de Usuários Glassmorphism */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/30 border-b border-white/40">
            <tr className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              <th className="p-6">Usuário</th>
              <th className="p-6">Nível de Acesso</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-white/50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                      {u.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">{u.nome}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                    u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                    <Check size={14} /> {u.status}
                  </div>
                </td>
                <td className="p-6 text-right flex justify-end gap-2">
                  <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}