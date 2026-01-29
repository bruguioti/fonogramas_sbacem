"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user_authenticated", "true");
        localStorage.setItem("user_email", email);
        router.push("/intranet");
      } else {
        setErro(data.message || "Credenciais inválidas.");
      }
    } catch (error) {
      setErro("Erro ao conectar com o servidor SQL.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      
      {/* COLUNA ESQUERDA: FORMULÁRIO */}
      <div className="w-full lg:w-[500px] flex flex-col justify-center px-8 md:px-16 bg-white z-10 shadow-2xl relative">
        <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-left-6 duration-700">
          
          <div className="mb-12">
            <div className="mb-6">
              <img 
                src="https://play-lh.googleusercontent.com/LSeEJ8rgAVAet-UO_WMh0Z63A_mBGS6o386ipFtIV4ci1UNx63Y2svcIbwihwnqruWQ" 
                alt="Logo SBACEM" 
                className="w-16 h-16 rounded-2xl object-cover shadow-md border border-gray-100"
              />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              SBACEM <span className="text-blue-600 font-black">PRO</span>
            </h1>
            <p className="text-gray-400 mt-2 font-medium text-xs uppercase tracking-[3px]">
              Business Intelligence
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Usuário corporativo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm font-medium"
                  placeholder="nome@sbacem.org.br"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Senha de acesso</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl text-center border border-red-100 animate-in shake duration-300">
                {erro}
              </div>
            )}

            <button 
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-100 active:scale-[0.98] mt-4"
            >
              {carregando ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Entrar no Portal
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-50">
             <p className="text-gray-400 text-xs font-medium">
               Dificuldades no acesso? <br/>
               <span className="text-blue-600 font-bold hover:underline cursor-pointer">Contate a TI SBACEM</span>
             </p>
          </div>
        </div>
      </div>

      {/* COLUNA DIREITA: IMAGEM DE DASHBOARD */}
      <div className="hidden lg:flex flex-1 bg-slate-50 relative items-center justify-center p-12">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 w-full max-w-4xl animate-in fade-in zoom-in duration-1000">
          <div className="bg-white/40 backdrop-blur-md p-3 rounded-[3.5rem] border border-white/50 shadow-2xl">
            <img 
              src="http://googleusercontent.com/image_collection/image_retrieval/989269330813043665_0" 
              alt="Dashboard Preview" 
              className="rounded-[3rem] w-full h-auto object-cover shadow-sm"
            />
          </div>
          <div className="mt-10 text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Sua central de BI está pronta</h2>
            <p className="text-slate-500 font-medium">Acompanhe métricas e fonogramas em um só lugar.</p>
          </div>
        </div>
      </div>
    </div>
  );
}