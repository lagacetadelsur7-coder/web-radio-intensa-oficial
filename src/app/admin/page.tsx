"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [topic, setTopic] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchStatus();
    });
  }, [supabase]);

  const fetchStatus = async () => {
    const { data, error } = await supabase.from("radio_status").select("*").limit(1).single();
    if (data) {
      setTopic(data.current_topic);
      setIsLive(data.is_live);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    const { error: updateError } = await supabase
      .from("radio_status")
      .update({ current_topic: topic, is_live: isLive })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update the single row

    if (updateError) {
      setFeedback("Error al actualizar: " + updateError.message);
      setLoading(false);
      return;
    }

    if (session?.user?.id) {
      const { error: historyError } = await supabase
        .from("topics_history")
        .insert([{ topic, created_by: session.user.id }]);
      if (historyError) console.warn("Historial:", historyError.message);
    }

    setFeedback("Estado de la radio actualizado con éxito.");
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0c10]">
        <p className="text-primary animate-pulse font-heading text-xl">Sincronizando con el Nilo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070a] p-6 lg:p-12 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=2000&auto=format&fit=crop')] opacity-15 bg-cover bg-center mix-blend-screen pointer-events-none filter blur-[2px]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-center bg-black/50 backdrop-blur-xl p-8 rounded-3xl border border-t-primary/40 border-l-primary/40 border-b-black/50 border-r-black/50 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.1)] mb-10 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl lg:text-4xl font-heading text-primary drop-shadow-[0_2px_8px_rgba(212,175,55,0.5)]">Panel de Control de la Esfinge</h1>
            <p className="text-sm text-foreground/70 font-sans mt-1 bg-black/40 inline-block px-3 py-1 rounded-full border border-primary/20">
              Faraón Identificado: <span className="font-bold text-primary">{session.user.email}</span>
            </p>
          </div>
          <button onClick={handleLogout} className="px-6 py-2.5 bg-destructive/10 border border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:-translate-y-1 rounded-xl transition-all duration-300 font-bold backdrop-blur-md">
            Cerrar Sesión
          </button>
        </header>

        <main className="bg-black/50 backdrop-blur-xl p-8 lg:p-12 rounded-3xl border border-t-primary/30 border-l-primary/30 border-b-black border-r-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000"></div>
          
          <h2 className="text-2xl text-primary font-heading mb-8 border-b border-primary/20 pb-4 inline-block drop-shadow-md">
            Control de la Transmisión
          </h2>
          
          <form onSubmit={handleUpdateStatus} className="space-y-8 relative z-10">
            <div className="group/field">
              <label className="block text-sm font-medium text-primary/90 mb-3 ml-1 tracking-wide uppercase">Tema del Día (Current Topic)</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-black/60 border border-primary/30 rounded-2xl px-5 py-4 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 min-h-[120px] text-lg font-sans shadow-inner transition-all group-hover/field:border-primary/50 resize-y"
                placeholder="Misterios del Antiguo Egipto..."
                required
              />
              <p className="text-xs text-foreground/50 mt-3 ml-1 font-sans">
                Este tema se actualizará en tiempo real para todos los Oyentes del Nilo y será usado por los bots IA para participar en la conversación.
              </p>
            </div>
            
            <div className={`p-1 rounded-2xl transition-all duration-500 ${isLive ? 'bg-gradient-to-r from-red-600/50 to-orange-600/50 shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'bg-primary/10'}`}>
              <div className="flex items-center space-x-4 bg-black/80 backdrop-blur-xl p-5 rounded-xl border border-white/5 h-full">
                <input
                  type="checkbox"
                  id="isLive"
                  checked={isLive}
                  onChange={(e) => setIsLive(e.target.checked)}
                  className="w-7 h-7 border-2 border-primary/50 bg-black/50 text-red-500 focus:ring-red-500/50 rounded cursor-pointer transition-all checked:shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                />
                <label htmlFor="isLive" className="text-foreground/90 font-medium cursor-pointer select-none text-xl tracking-wide flex items-center">
                  Activar Indicador
                  <span className={`ml-3 px-3 py-1 text-xs font-bold uppercase rounded-full tracking-widest ${isLive ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_red]' : 'bg-gray-700 text-gray-400'}`}>
                    EN VIVO
                  </span>
                </label>
              </div>
            </div>

            {feedback && (
              <div className={`px-6 py-4 rounded-xl text-sm font-medium border shadow-lg animate-in fade-in slide-in-from-bottom-2 ${feedback.includes("éxito") ? "bg-green-950/40 border-green-500/50 text-green-400" : "bg-red-950/40 border-red-500/50 text-red-400"}`}>
                {feedback}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full md:w-auto overflow-hidden px-10 py-4 bg-gradient-to-r from-primary to-yellow-600 text-black font-extrabold rounded-xl transition-all duration-300 shadow-[0_10px_20px_rgba(212,175,55,0.3),inset_0_2px_0_rgba(255,255,255,0.4)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(212,175,55,0.5),inset_0_2px_0_rgba(255,255,255,0.6)] disabled:opacity-50 disabled:hover:translate-y-0 text-lg uppercase tracking-widest"
            >
              {loading ? (
                 <span className="flex items-center justify-center space-x-2">
                   <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                   <span>Invocando a los Dioses...</span>
                 </span>
              ) : "Actualizar Oráculo"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
