import { AudioPlayer } from "@/components/AudioPlayer";
import { Chat } from "@/components/Chat";

export default function Home() {
  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1600350730043-4dc9cf8db891?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-fixed bg-no-repeat relative">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/70 pointer-events-none md:bg-black/60 dark:bg-black/80"></div>
      
      <main className="relative z-10 flex border-t-4 border-t-primary min-h-screen flex-col items-center p-4 md:p-12 lg:p-24 overflow-hidden overflow-y-auto">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
          <LiveTopic />
          <h1 className="text-5xl md:text-7xl font-bold font-heading text-primary drop-shadow-[0_5px_15px_rgba(212,175,55,0.4)] tracking-wider mt-2 hover:scale-105 transition-transform duration-500 cursor-default">
            Radio Intensa
          </h1>
          <h2 className="text-xl md:text-3xl text-foreground font-light max-w-2xl drop-shadow-lg">
            La Voz del Nilo - 24/7
          </h2>
        </div>

        {/* Content Container: Audio Controls & Chat */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-10 items-start relative z-10">
          
          {/* Audio Player Side */}
          <div className="lg:col-span-1 flex flex-col space-y-8">
            {/* 3D Glassmorphism Container */}
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-t-primary/30 border-l-primary/30 border-b-primary/10 border-r-primary/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.15)] w-full flex flex-col items-center text-center space-y-8 hover:-translate-y-2 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.25)] transition-all duration-500 group">
              
              {/* Cover Art */}
              <div className="relative w-56 h-56 rounded-full border-4 border-primary/80 overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.3)] group-hover:shadow-[0_0_60px_rgba(212,175,55,0.6)] transition-shadow duration-500">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10 group-hover:bg-primary/10 transition-colors"></div>
                <img 
                  src="https://images.unsplash.com/photo-1600350730043-4dc9cf8db891?q=80&w=600&auto=format&fit=crop" 
                  alt="Egyptian Theme" 
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700 ease-out"
                />
              </div>
              
              <div className="w-full">
                <AudioPlayer className="w-full" />
              </div>
            </div>
            
            {/* Info block */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-t-primary/20 border-l-primary/20 border-b-black/50 border-r-black/50 shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-heading text-xl text-primary mb-3 drop-shadow-md">Sobre la Radio</h3>
              <p className="text-sm text-foreground/85 leading-relaxed font-sans">
                Únete a la comunión de las voces eternas. Adéntrate en los misterios de la civilización prohibida mientras 
                escuchas música inmersiva y te conectas con los Oyentes del Nilo.
              </p>
            </div>
          </div>

          {/* Chat Side */}
          <div className="lg:col-span-2 w-full h-[650px] flex items-center justify-center transform hover:scale-[1.01] transition-transform duration-500">
             <Chat />
          </div>

        </div>
      </main>
    </div>
  );
}
