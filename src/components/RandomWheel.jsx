import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RotateCw, RefreshCw, Users, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

const RandomWheel = ({ players }) => {
  const [spinning, setSpinning] = useState(false);
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const controls = useAnimation();
  const wheelRef = useRef(null);

  const spinSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3');
  const winSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');

  const handleShuffle = async () => {
    if (players.length < 2) {
      alert("Cần ít nhất 2 người chơi để chia đội.");
      return;
    }

    setSpinning(true);
    // spinSound.play().catch(e => console.log('Audio blocked'));

    // Animation rotation
    const rotation = 1800 + Math.random() * 360; // 5 full spins + random
    await controls.start({
      rotate: rotation,
      transition: { duration: 3, ease: [0.45, 0.05, 0.55, 0.95] }
    });

    // logic chia đội
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    setTeamA(shuffled.slice(0, mid));
    setTeamB(shuffled.slice(mid));
    
    setSpinning(false);
    // winSound.play().catch(e => console.log('Audio blocked'));
  };

  const reset = () => {
    setTeamA([]);
    setTeamB([]);
    controls.set({ rotate: 0 });
  };

  return (
    <div className="flex flex-col items-center gap-12 max-w-4xl mx-auto">
      {/* The Wheel */}
      <div className="relative group">
        <div className="absolute inset-0 bg-ucl-neon/20 blur-[100px] rounded-full group-hover:bg-ucl-neon/40 transition-colors duration-1000" />
        
        <div className="relative z-10 w-80 h-80 md:w-96 md:h-96">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
                <div className="w-8 h-10 bg-ucl-neon clip-path-polygon-[50%_100%,0%_0%,100%_0%] shadow-lg" 
                     style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
            </div>

            {/* Spinner Body */}
            <motion.div 
              animate={controls}
              className="w-full h-full rounded-full border-8 border-white/10 bg-ucl-blue/30 backdrop-blur-md overflow-hidden relative shadow-2xl"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                    <div className="bg-ucl-blue/40 border border-white/5" />
                    <div className="bg-ucl-star/40 border border-white/5" />
                    <div className="bg-ucl-neon/20 border border-white/5" />
                    <div className="bg-ucl-blue/60 border border-white/5" />
                 </div>
              </div>
              
              {/* Inner Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-1/2 h-1/2 rounded-full bg-ucl-dark/80 border-4 border-ucl-neon flex items-center justify-center z-10 shadow-[0_0_30px_rgba(0,242,255,0.3)]">
                    <Trophy className="text-ucl-neon animate-pulse" size={48} />
                 </div>
              </div>
              
              {/* Star Pattern Overlay */}
              <div className="absolute inset-0 star-pattern opacity-30 rotate-45" />
            </motion.div>
            
            {/* Control Button In Center */}
            <button 
              disabled={spinning}
              onClick={handleShuffle}
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-20 h-20 rounded-full bg-ucl-neon text-ucl-dark flex items-center justify-center shadow-[0_0_40px_rgba(0,242,255,0.6)] hover:scale-110 active:scale-95 transition-all",
                spinning && "opacity-50 cursor-not-allowed"
              )}
            >
               <RotateCw className={cn("transition-transform duration-1000", spinning && "animate-spin")} size={32} />
            </button>
        </div>
      </div>

      <div className="flex gap-4">
         <button onClick={handleShuffle} className="ucl-button flex items-center gap-2 px-8 py-3 bg-ucl-neon text-ucl-dark border-none">
           <RotateCw size={20} /> Quay ngẫu nhiên
         </button>
         <button onClick={reset} className="ucl-button flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10">
           <RefreshCw size={20} /> Reset
         </button>
      </div>

      {/* Results Display */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card overflow-hidden">
           <div className="bg-ucl-blue p-4 flex items-center gap-3">
              <ShieldAlert className="text-white" size={20} />
              <h4 className="font-black italic uppercase tracking-widest">TEAM A</h4>
           </div>
           <div className="p-6 space-y-4">
              {teamA.length > 0 ? teamA.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={p.id} 
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                >
                   <div className="w-8 h-8 rounded-full bg-ucl-blue flex items-center justify-center font-bold text-xs">{p.name.charAt(0)}</div>
                   <span className="font-bold">{p.name}</span>
                </motion.div>
              )) : (
                <p className="text-ucl-silver italic text-center py-4">Chưa có thành viên</p>
              )}
           </div>
        </div>

        <div className="glass-card overflow-hidden">
           <div className="bg-ucl-star p-4 flex items-center gap-3">
              <ShieldAlert className="text-white" size={20} />
              <h4 className="font-black italic uppercase tracking-widest">TEAM B</h4>
           </div>
           <div className="p-6 space-y-4">
              {teamB.length > 0 ? teamB.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={p.id} 
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                >
                   <div className="w-8 h-8 rounded-full bg-ucl-star flex items-center justify-center font-bold text-xs">{p.name.charAt(0)}</div>
                   <span className="font-bold">{p.name}</span>
                </motion.div>
              )) : (
                <p className="text-ucl-silver italic text-center py-4">Chưa có thành viên</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RandomWheel;
