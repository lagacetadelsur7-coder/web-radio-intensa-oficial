"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LiveTopic() {
  const [topic, setTopic] = useState("Sintonizando las dunas...");
  const [isLive, setIsLive] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("radio_status")
        .select("current_topic, is_live")
        .limit(1)
        .single();
        
      if (!error && data && mounted) {
        setTopic(data.current_topic);
        setIsLive(data.is_live);
      }
    };

    fetchStatus();

    const channel = supabase
      .channel("public:radio_status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "radio_status",
        },
        (payload) => {
          if (mounted) {
            setTopic(payload.new.current_topic);
            setIsLive(payload.new.is_live);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="flex flex-col items-center">
      <div className="inline-flex items-center justify-center space-x-2 border border-primary/30 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4 transition-all duration-500">
        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse shadow-[0_0_8px_red]' : 'bg-gray-500'}`}></span>
        <span className={`text-sm font-medium tracking-widest uppercase font-heading ${isLive ? 'text-primary' : 'text-gray-400'}`}>
          {isLive ? 'Transmisión en Vivo' : 'Radio Offline'}
        </span>
      </div>
      <p className="text-lg md:text-xl text-primary/80 mt-4 max-w-3xl border-b border-primary/20 pb-4 animate-in fade-in slide-in-from-bottom-2">
        &quot;{topic}&quot;
      </p>
    </div>
  );
}
