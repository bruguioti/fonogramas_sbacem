"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

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
        // 1. Persistência para o Front-end (Define o que aparece no menu)
        localStorage.setItem("user_authenticated", "true");
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_role", data.user.cargo); 

        // 2. Persistência para o Servidor/Proxy (Garante que o Next.js não bloqueie a rota)
        // Criamos um cookie que o Middleware consegue ler
        document.cookie = `user_token=true; path=/; max-age=86400; SameSite=Lax`;

        // 3. Redireciona para o Dashboard principal
        router.push("/");
        // Forçamos um refresh rápido para garantir que o Proxy valide os cookies novos
        router.refresh(); 
      } else {
        setErro(data.message || "Credenciais inválidas.");
      }
    } catch (error) {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      {/* Lado Esquerdo: Formulário */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-10 md:px-16 bg-white z-10 shadow-2xl">
        <div className="w-full max-w-sm mx-auto">
          
          <div className="mb-12">
            <img 
              src="/logo-sbacem.png" 
              alt="Logo SBACEM" 
              className="h-16 w-auto mb-8 object-contain"
            />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Acesse o sistema de fonogramas <span className="font-semibold text-[#D8315B]">SBACEM</span>.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#D8315B] focus:ring-4 focus:ring-pink-50 outline-none text-sm transition-all placeholder:text-slate-400"
                  placeholder="nome@exemplo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#8E44AD] focus:ring-4 focus:ring-purple-50 outline-none text-sm transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 text-red-600 text-[13px] p-3 rounded-lg border border-red-100 font-medium text-center animate-shake">
                {erro}
              </div>
            )}

            <button 
              type="submit"
              disabled={carregando}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-8 disabled:opacity-70"
            >
              {carregando ? <Loader2 size={20} className="animate-spin" /> : <>Entrar no painel <ArrowRight size={18} /></>}
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-slate-400 text-xs">© 2026 SBACEM - Todos os direitos reservados.</p>
          </footer>
        </div>
      </div>

      {/* Lado Direito: Visual Impactante */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#D8315B]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_50%,_#8E44AD_0%,_transparent_50%)]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-64 -mt-64" />
        
        <div className="relative z-10 p-12 max-w-lg">
            <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
              Gerencie seus <span className="underline decoration-pink-300">fonogramas</span> com precisão.
            </h2>
            <div className="mt-8 h-1.5 w-20 bg-white rounded-full" />
            <p className="mt-6 text-white/70 text-lg font-light leading-relaxed">
              Plataforma interna exclusiva para membros e administradores SBACEM.
            </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}