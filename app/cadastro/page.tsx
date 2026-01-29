// app/cadastro/page.tsx
"use client";
import { cadastrarUsuario } from "@/app/actions/auth";
import { User, Mail, Lock, Check } from "lucide-react";

export default function CadastroPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-6">Criar Conta Administrativa</h2>
        
        <form action={cadastrarUsuario} className="space-y-4">
          <input name="name" placeholder="Nome Completo" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
          <input name="email" type="email" placeholder="E-mail Institucional" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
          <input name="password" type="password" placeholder="Senha Forte" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
          
          <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition-all mt-4">
            CADASTRAR USUÁRIO
          </button>
        </form>
      </div>
    </div>
  );
}