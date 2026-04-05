"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, User as UserIcon } from "lucide-react";

type Message = {
  id: string;
  nick: string;
  content: string;
  user_level: string;
  created_at: string;
};

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nick, setNick] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize and subscribe
  useEffect(() => {
    let mounted = true;
    
    // Load existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (error) {
        console.error("Error fetching messages:", error);
      } else if (data && mounted) {
        setMessages(data.reverse());
      }
    };
    
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel("public:chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: "status=eq.approved",
        },
        (payload) => {
          setMessages((current) => {
            // Avoid duplicates
            if (current.some(m => m.id === payload.new.id)) return current;
            return [...current, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Auto-scroll Down
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    const finalNick = nick.trim() || `Anónimo_${Math.floor(Math.random() * 1000)}`;
    setIsSending(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nick: finalNick,
          content: content.trim(),
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.error || "Falló al enviar.");
      } else {
        setContent(""); // Clear only content
      }
    } catch {
      setErrorMsg("Error de conexión al enviar el mensaje.");
    } finally {
      setIsSending(false);
    }
  };

  const getLevelColor = (lvl: string) => {
    switch (lvl) {
      case "Voz de la Esfinge": return "border-blue-500 text-blue-400";
      case "Intenso Legend": return "border-purple-500 text-purple-400";
      default: return "border-primary/50 text-primary"; // Oyente del Nilo
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black/30 backdrop-blur-2xl rounded-3xl overflow-hidden relative border border-t-primary/50 border-l-primary/50 border-b-black border-r-black shadow-[0_30px_60px_-15px_rgba(0,0,0,1),0_0_40px_rgba(212,175,55,0.15)] group transition-all duration-500">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000 z-0"></div>
      
      {/* Header */}
      <div className="px-8 py-5 bg-black/50 backdrop-blur-md border-b border-primary/20 flex items-center justify-between z-10 relative shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
        <h3 className="font-heading text-primary text-2xl font-bold tracking-wide drop-shadow-[0_2px_10px_rgba(212,175,55,0.5)] flex items-center gap-3">
          El Salón de la Esfinge
        </h3>
        <span className="text-xs font-bold text-primary/80 animate-pulse tracking-[0.2em] flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-primary/20 shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 block shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          EN LÍNEA
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50 scrollbar-track-transparent z-10 relative">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-primary/40 space-y-4">
             <UserIcon className="w-16 h-16 opacity-30 drop-shadow-lg" />
             <p className="font-heading text-lg">El salón aguarda en silencio...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-3 flex flex-col items-start max-w-[85%] group/msg hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <span className="text-sm font-bold text-foreground drop-shadow-md">
                  {msg.nick}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border bg-black/60 shadow-inner ${getLevelColor(msg.user_level)}`}>
                  {msg.user_level}
                </span>
                <span className="text-[11px] text-foreground/30 ml-2 font-mono group-hover/msg:text-foreground/50 transition-colors">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="bg-black/60 backdrop-blur-md border border-t-white/10 border-l-white/10 border-b-black/50 border-r-black/50 rounded-2xl rounded-tl-sm p-4 shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                <p className="text-[15px] text-foreground/95 leading-relaxed font-sans">
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="px-4 py-3 bg-red-950/90 border-t border-red-500/50 text-red-200 text-sm font-medium text-center shadow-[0_-5px_20px_rgba(220,38,38,0.2)] z-20">
          {errorMsg}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-black/70 backdrop-blur-xl border-t border-primary/20 flex flex-col gap-4 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Tu Alias (ej. Ramsés)"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            className="w-1/4 min-w-[120px] bg-black/60 border border-t-white/10 border-l-white/10 border-b-black border-r-black rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-primary/30 font-heading shadow-inner hover:border-primary/40 transition-colors"
          />
          <input
            type="text"
            placeholder="Escribe tu mensaje para el Nilo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-black/60 border border-t-white/10 border-l-white/10 border-b-black border-r-black rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-primary/30 font-sans shadow-inner hover:border-primary/40 transition-colors"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !content.trim()}
            className="flex items-center justify-center bg-gradient-to-r from-primary to-yellow-600 hover:from-yellow-500 hover:to-orange-500 text-black font-bold rounded-xl px-6 py-3 transition-all duration-300 shadow-[0_5px_15px_rgba(212,175,55,0.4),inset_0_2px_0_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:hover:scale-100 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(212,175,55,0.6)]"
          >
            {isSending ? (
               <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
            ) : (
               <Send className="w-5 h-5 fill-black/20" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
