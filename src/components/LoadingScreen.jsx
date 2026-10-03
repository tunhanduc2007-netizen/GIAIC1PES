import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Shield, Zap, Sparkles, Flame } from 'lucide-react';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('KHỞI TẠO ĐẤU TRƯỜNG CHAMPIONS LEAGUE...');

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1350; // 1.35 seconds: lightning fast, responsive, and buttery smooth

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 25) {
        setStatusText('TẢI 28 CÂU LẠC BỘ HÀNG ĐẦU CHÂU ÂU...');
      } else if (pct < 55) {
        setStatusText('ĐỒNG BỘ 14 CẶP ĐẤU VÒNG LOẠI THỊNH VS BU...');
      } else if (pct < 85) {
        setStatusText('THIẾT LẬP 7 BẢNG ĐẤU & BẢNG XẾP HẠNG...');
      } else {
        setStatusText('SẴN SÀNG KHỞI TRANH ĐẤU TRƯỜNG C1!');
      }

      if (pct >= 100) {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 180);
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#06080e] flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Background Cinematic Atmosphere & Deep Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,184,255,0.18)_0%,rgba(139,21,56,0.22)_40%,#06080e_85%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,215,0,0.12)_0%,transparent_60%)] pointer-events-none" />
      
      {/* Cyber Grid Lines for Depth */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 242, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 70%)'
        }}
      />


      {/* 3D ROTATING GYROSCOPE ARENA */}
      <div className="relative flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 [perspective:1200px] mb-6">
        
        {/* Ambient Core Halo */}
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-[#ff2a5f]/25 via-[#00f2ff]/25 to-[#ffd700]/25 blur-3xl animate-pulse" />

        {/* 3D Ring 1: High-Speed Cyan Gyroscope Orbit */}
        <motion.div
          animate={{
            rotateX: [72, 72, 72],
            rotateY: [0, 180, 360],
            rotateZ: [0, 360]
          }}
          transition={{
            rotateY: { duration: 4.5, repeat: Infinity, ease: "linear" },
            rotateZ: { duration: 8, repeat: Infinity, ease: "linear" }
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-[#00f2ff]/70 shadow-[0_0_35px_rgba(0,242,255,0.45)] pointer-events-none"
        >
          {/* Orbital Satellites */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#00f2ff] shadow-[0_0_20px_#00f2ff,0_0_40px_#00f2ff]" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#00f2ff] shadow-[0_0_20px_#00f2ff,0_0_40px_#00f2ff]" />
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_15px_#fff]" />
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_15px_#fff]" />
        </motion.div>

        {/* 3D Ring 2: Reverse Neon Pink / Crimson Orbit */}
        <motion.div
          animate={{
            rotateX: [55, 55, 55],
            rotateY: [360, 180, 0],
            rotateZ: [360, 0]
          }}
          transition={{
            rotateY: { duration: 3.8, repeat: Infinity, ease: "linear" },
            rotateZ: { duration: 7, repeat: Infinity, ease: "linear" }
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="absolute w-60 h-60 sm:w-68 sm:h-68 rounded-full border-2 border-dotted border-[#ff2a5f]/80 shadow-[0_0_35px_rgba(255,42,95,0.45)] pointer-events-none"
        >
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#ff2a5f] shadow-[0_0_20px_#ff2a5f,0_0_40px_#ff2a5f]" />
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#ff2a5f] shadow-[0_0_20px_#ff2a5f,0_0_40px_#ff2a5f]" />
        </motion.div>

        {/* 3D Ring 3: Diagonal Golden Star Orbit */}
        <motion.div
          animate={{
            rotateX: [0, 360],
            rotateY: [45, 45],
            rotateZ: [0, 360]
          }}
          transition={{
            rotateX: { duration: 6, repeat: Infinity, ease: "linear" },
            rotateZ: { duration: 9, repeat: Infinity, ease: "linear" }
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-[#ffd700]/60 shadow-[0_0_30px_rgba(255,215,0,0.35)] pointer-events-none"
        >
          <div className="absolute top-0 right-1/4 w-3.5 h-3.5 rounded-full bg-[#ffd700] shadow-[0_0_15px_#ffd700]" />
          <div className="absolute bottom-0 left-1/4 w-3.5 h-3.5 rounded-full bg-[#ffd700] shadow-[0_0_15px_#ffd700]" />
        </motion.div>

        {/* Center 3D Floating & Rotating UEFA Champions League Trophy Stand */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotateY: [0, 180, 360],
            rotateX: [8, -8, 8],
            scale: [1, 1.06, 1]
          }}
          transition={{
            y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
            rotateY: { duration: 3.6, repeat: Infinity, ease: "linear" },
            rotateX: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative z-10 flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Holographic Glowing 3D Glass Medallion */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-[#001433]/90 via-[#071329]/95 to-[#1f0622]/90 border-2 border-white/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,242,255,0.5),inset_0_0_30px_rgba(255,215,0,0.2)] flex items-center justify-center relative overflow-hidden group">
            
            {/* Shimmer sweep inside glass */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.45),transparent_70%)]" />
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 animate-[shimmer_2s_infinite]" />
            
            {/* 3D Champions League Trophy with Brilliant Gold Gradient */}
            <div className="relative z-10 flex flex-col items-center">
              <Trophy 
                size={62} 
                className="text-[#ffd700] filter drop-shadow-[0_0_25px_rgba(255,215,0,0.95)] drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]" 
              />
              <div className="flex items-center gap-1 mt-1">
                <Star size={10} fill="#00f2ff" className="text-[#00f2ff] drop-shadow-[0_0_8px_#00f2ff]" />
                <span className="text-[9px] font-black tracking-widest text-[#00f2ff] uppercase font-mono">UCL</span>
                <Star size={10} fill="#ff2a5f" className="text-[#ff2a5f] drop-shadow-[0_0_8px_#ff2a5f]" />
              </div>
            </div>

            {/* Futuristic Tech Corner Brackets */}
            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#00f2ff]" />
            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#ff2a5f]" />
            <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#ff2a5f]" />
            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#00f2ff]" />
          </div>

          {/* Under-glow holographic floor shadow reflection */}
          <div className="w-24 h-4 rounded-full bg-gradient-to-r from-[#ff2a5f]/40 via-[#00f2ff]/60 to-[#ffd700]/40 blur-md mt-4 scale-x-125" />
        </motion.div>
      </div>

      {/* HUD Info & Status Card */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center space-y-4">
        
        {/* UEFA Badge Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/15 backdrop-blur-xl shadow-[0_0_20px_rgba(0,242,255,0.2)]"
        >
          <Sparkles size={14} className="text-[#ffd700] animate-spin" />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white font-montserrat">
            UEFA CHAMPIONS LEAGUE <span className="text-[#00f2ff]">PES 2021</span>
          </span>
        </motion.div>

        {/* Dynamic Status Text with Smooth Fade */}
        <div className="h-6 flex items-center justify-center">
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#cbd5e1] font-montserrat drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
          >
            {statusText}
          </motion.p>
        </div>

        {/* High-tech Progress Bar with Glowing Shimmer */}
        <div className="w-full space-y-2.5">
          <div className="w-full h-3.5 rounded-full bg-black/60 border border-white/20 p-0.5 overflow-hidden relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#ff2a5f] via-[#00f2ff] to-[#ffd700] relative shadow-[0_0_15px_rgba(0,242,255,0.7)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            >
              {/* Animated scanline bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent w-full animate-[shimmer_1.2s_infinite]" />
            </motion.div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest font-mono">
            <span className="text-white/60">28 CLB CHÂU ÂU</span>
            <span className="text-[#00f2ff] font-bold text-sm tracking-normal bg-[#00f2ff]/10 px-2 py-0.5 rounded-md border border-[#00f2ff]/30">
              {progress}%
            </span>
            <span className="text-[#ffd700]">THỊNH 14 - BU 14</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoadingScreen;
