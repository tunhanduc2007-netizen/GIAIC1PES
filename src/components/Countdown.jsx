import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Trophy } from 'lucide-react';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false
  });

  useEffect(() => {
    // FIFA World Cup 2026 Kickoff: June 11, 2026
    const targetDate = new Date('2026-06-11T00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true });
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isCompleted: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft.isCompleted) {
    return (
      <div className="glass-card px-6 py-3 border-ucl-blue/30 text-ucl-blue font-black tracking-widest text-xs uppercase animate-pulse flex items-center gap-2">
        <Trophy size={16} className="text-yellow-400" />
        <span>THE WORLD CUP HAS BEGUN!</span>
      </div>
    );
  }

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days, color: 'text-ucl-blue' },
    { label: 'Hrs', value: timeLeft.hours, color: 'text-white' },
    { label: 'Mins', value: timeLeft.minutes, color: 'text-white' },
    { label: 'Secs', value: timeLeft.seconds, color: 'text-ucl-neon' }
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 bg-black/40 backdrop-blur-md px-5 py-3 rounded-3xl border border-white/10 w-fit shadow-2xl">
      <div className="flex items-center gap-2 text-ucl-silver shrink-0">
        <Clock size={14} className="text-ucl-neon animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">ROAD TO<br/><span className="text-ucl-blue font-bold">WORLD CUP 2026</span></span>
      </div>
      
      <div className="h-px sm:w-px sm:h-8 bg-white/10 w-full sm:w-auto" />
      
      <div className="flex items-center gap-2 md:gap-3">
        {timeBlocks.map((block, i) => (
          <div key={i} className="flex items-center gap-1.5 md:gap-2">
            <div className="flex flex-col items-center">
              <span className={`text-base md:text-xl font-black italic tracking-tighter leading-none ${block.color}`}>
                {String(block.value).padStart(2, '0')}
              </span>
              <span className="text-[7px] font-bold uppercase tracking-wider text-ucl-silver mt-0.5">{block.label}</span>
            </div>
            {i < 3 && <span className="text-white/20 font-black text-xs md:text-sm -mt-2">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Countdown;
