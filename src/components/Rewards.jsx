import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

const RewardCard = ({ rank, player, amount, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: (4 - rank) * 0.2 }}
    className={cn(
      "glass-card p-8 flex flex-col items-center gap-4 relative overflow-hidden group",
      rank === 1 && "neon-border scale-110 z-10"
    )}
  >
    <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-500", color.text)}>
       <Trophy size={100} />
    </div>
    
    <div className={cn(
      "w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black border-4 shadow-2xl transition-transform duration-500 group-hover:scale-110",
      color.bg, color.border, color.text
    )}>
       {rank}
    </div>

    <div className="text-center space-y-1">
      <h3 className="text-2xl font-black italic uppercase tracking-tighter">{player?.name || '---'}</h3>
      <p className="text-ucl-silver text-xs uppercase tracking-widest">{player?.team || 'PES Player'}</p>
    </div>

    <div className="mt-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 flex items-center gap-2">
       <Star className="text-yellow-400" size={20} fill="currentColor" />
       <span className="text-2xl font-black text-ucl-neon">{amount}</span>
    </div>

    {rank === 1 && (
      <div className="absolute -bottom-2 -left-2 text-[100px] font-black italic text-ucl-neon opacity-5 select-none leading-none">
        CHAMPION
      </div>
    )}
  </motion.div>
);

const Rewards = ({ standings }) => {
  const top1 = standings[0];
  const top2 = standings[1];
  const top3 = standings[2];

  useEffect(() => {
    if (top1) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [top1]);

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-ucl-neon/20 rounded-full border-2 border-ucl-neon text-ucl-neon mb-4 shadow-[0_0_50px_rgba(0,242,255,0.3)]"
        >
          <PartyPopper size={48} />
        </motion.div>
        <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
          CÔNG BỐ <span className="text-ucl-neon">KẾT QUẢ</span>
        </h2>
        <p className="text-ucl-silver max-w-xl mx-auto uppercase tracking-[0.2em] text-xs">
          Chúc mừng các nhà vô địch mùa giải Champions League 2024
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto pt-10">
        <RewardCard 
          rank={2} 
          player={top2} 
          amount="400K" 
          color={{ bg: 'bg-slate-400/20', border: 'border-slate-400', text: 'text-slate-400' }} 
        />
        <RewardCard 
          rank={1} 
          player={top1} 
          amount="600K" 
          color={{ bg: 'bg-yellow-400/20', border: 'border-yellow-400', text: 'text-yellow-400' }} 
        />
        <RewardCard 
          rank={3} 
          player={top3} 
          amount="200K" 
          color={{ bg: 'bg-orange-600/20', border: 'border-orange-600', text: 'text-orange-600' }} 
        />
      </div>

      <div className="flex justify-center mt-12">
         <motion.div 
           animate={{ y: [0, -10, 0] }}
           transition={{ repeat: Infinity, duration: 2 }}
           className="glass-card p-12 border-ucl-neon/30 flex flex-col items-center gap-6"
         >
            <Trophy className="text-ucl-neon" size={80} />
            <h4 className="text-3xl font-black italic text-center">CHAMPIONS LEAGUE CUP</h4>
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-ucl-neon to-transparent" />
            <p className="text-ucl-silver text-sm italic">The pride of PES 2021 community</p>
         </motion.div>
      </div>
    </div>
  );
};

export default Rewards;
