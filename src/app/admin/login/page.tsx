"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setFeedback("Error al acceder: " + error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const allowedEmails = ["caerod2020@gmail.com", "almafuertera1@gmail.com"];
      if (!data.user.email || !allowedEmails.includes(data.user.email)) {
        setFeedback("Credenciales correctas, pero este correo no pertenece a los Administradores.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      
      // Navigate to admin
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c10] bg-[url('https://images.unsplash.com/photo-1600350730043-4dc9cf8db891?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-black/80"></div>
      <div className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-xl p-8 rounded-2xl border border-primary/30 shadow-2xl">
        <h1 className="text-3xl font-heading text-primary text-center mb-6 drop-shadow-md">Acceso del Gran Faraón</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-1">Email Registrado</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-background/50 border border-primary/30 rounded-lg px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-foreground/30 font-sans"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-1">Contraseña Sagrada</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-background/50 border border-primary/30 rounded-lg px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-foreground/30 font-sans"
            />
          </div>
          {feedback && <p className="text-red-400 text-sm font-sans">{feedback}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold py-2 rounded-lg transition-colors mt-4 shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50"
          >
            {loading ? "Invocando..." : "Entrar al Templo"}
          </button>
        </form>
        <p className="mt-4 text-xs text-center text-foreground/50">
          Esta área está restringida exclusivamente para César y Lali.
        </p>
      </div>
    </div>
  );
}
