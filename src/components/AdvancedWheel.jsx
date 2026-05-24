import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Trophy, RotateCw, Sword, Zap, AlertCircle, History, ChevronRight, X } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';

const TEAMS_THINH = [
  { name: 'Qatar', color: '#7c2d12' },
  { name: 'Jordan', color: '#dc2626' },
  { name: 'Uzbekistan', color: '#38bdf8' },
  { name: 'Iran', color: '#15803d' },
  { name: 'Nhật Bản', color: '#1e40af' },
  { name: 'DR Congo', color: '#38bdf8' },
  { name: 'Tunisia', color: '#dc2626' },
  { name: 'Senegal', color: '#15803d' },
  { name: 'Algeria', color: '#15803d' },
  { name: 'Nam Phi', color: '#15803d' },
  { name: 'Curaçao', color: '#1e40af' },
  { name: 'Mexico', color: '#15803d' },
  { name: 'Panama', color: '#dc2626' },
  { name: 'Uruguay', color: '#38bdf8' },
  { name: 'Brazil', color: '#fbbf24' },
  { name: 'Ecuador', color: '#fbbf24' },
  { name: 'Tây Ban Nha', color: '#facc15' },
  { name: 'Anh', color: '#1e3a8a' },
  { name: 'Scotland', color: '#1e3a8a' },
  { name: 'Bỉ', color: '#be123c' },
  { name: 'Thổ Nhĩ Kỳ', color: '#dc2626' },
  { name: 'Bosnia & Herzegovina', color: '#1e40af' },
  { name: 'Croatia', color: '#dc2626' },
];

const TEAMS_BU = [
  { name: 'Iraq', color: '#111827' },
  { name: 'Australia', color: '#fbbf24' },
  { name: 'Saudi Arabia', color: '#15803d' },
  { name: 'Hàn Quốc', color: '#dc2626' },
  { name: 'Ghana', color: '#fbbf24' },
  { name: 'Cape Verde', color: '#1e40af' },
  { name: 'Bờ Biển Ngà', color: '#f97316' },
  { name: 'Maroc', color: '#0f766e' },
  { name: 'Ai Cập', color: '#dc2626' },
  { name: 'Haiti', color: '#1e40af' },
  { name: 'Mỹ', color: '#b91c1c' },
  { name: 'Canada', color: '#dc2626' },
  { name: 'Đức', color: '#111827' },
  { name: 'CH Séc', color: '#1e40af' },
  { name: 'Hà Lan', color: '#f97316' },
  { name: 'Pháp', color: '#1e3a8a' },
  { name: 'Thụy Sĩ', color: '#dc2626' },
  { name: 'Áo', color: '#dc2626' },
  { name: 'Na Uy', color: '#1e40af' },
  { name: 'New Zealand', color: '#111827' },
  { name: 'Bồ Đào Nha', color: '#15803d' },
  { name: 'Colombia', color: '#fbbf24' },
  { name: 'Thụy Điển', color: '#1e40af' },
  { name: 'Paraguay', color: '#dc2626' },
  { name: 'Argentina', color: '#60a5fa' },
];

const Wheel = ({ teams, onResult, label, side, isLocked }) => {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [availableTeams, setAvailableTeams] = useState(teams);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [canvasSize, setCanvasSize] = useState(350);

  useEffect(() => {
    setAvailableTeams(teams);
    setSelectedTeam(null);
  }, [teams]);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) setCanvasSize(280);
      else if (width < 1024) setCanvasSize(320);
      else setCanvasSize(350);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    drawWheel();
  }, [availableTeams, rotation, canvasSize]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvasSize;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    if (availableTeams.length === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a3a3c2';
      ctx.font = 'bold 14px Montserrat';
      ctx.textAlign = 'center';
      ctx.fillText('ĐÃ HẾT ĐỘI TUYỂN', centerX, centerY);
      return;
    }

    const sliceAngle = (Math.PI * 2) / availableTeams.length;

    availableTeams.forEach((team, i) => {
      const startAngle = i * sliceAngle + rotation;
      const endAngle = (i + 1) * sliceAngle + rotation;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, radius);
      gradient.addColorStop(0, team.color);
      gradient.addColorStop(1, '#050507');
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = `900 italic ${canvasSize < 300 ? '9px' : '11px'} "Montserrat"`;
      ctx.fillText(team.name.toUpperCase(), radius - 30, 4);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = side === 'BU' ? '#ff2a5f' : '#d4af37';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, canvasSize * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0b0d';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = `900 ${canvasSize < 300 ? '10px' : '12px'} Montserrat`;
    ctx.textAlign = 'center';
    ctx.fillText(side, centerX, centerY + 5);
  };

  const spin = () => {
    if (isSpinning || availableTeams.length === 0 || isLocked) return;

    if (navigator.vibrate) navigator.vibrate(20);
    setIsSpinning(true);
    const spinRotation = 1440 + Math.random() * 1440;
    const duration = 4000;
    const start = performance.now();

    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentRotation = rotation + spinRotation * ease;
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const finalRotation = currentRotation % (Math.PI * 2);
        const sliceAngle = (Math.PI * 2) / availableTeams.length;
        const winningIndex = Math.floor((Math.PI * 2 - (finalRotation % (Math.PI * 2))) / sliceAngle) % availableTeams.length;
        const result = availableTeams[winningIndex];
        
        setSelectedTeam(result);
        onResult(result);
        setAvailableTeams(prev => prev.filter(t => t.name !== result.name));
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 sm:p-8 glass-card border-white/5 relative overflow-hidden group w-full max-w-[400px]">
      <div className={cn(
        "absolute -top-24 -left-24 w-48 h-48 blur-[100px] rounded-full opacity-20 transition-colors",
        side === 'BU' ? "bg-ucl-neon" : "bg-ucl-blue"
      )} />

      <div className="flex items-center gap-3">
        <Shield className={cn(side === 'BU' ? "text-ucl-neon" : "text-ucl-blue")} size={24} />
        <h3 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase font-bebas">{label}</h3>
      </div>

      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={canvasSize} 
          height={canvasSize} 
          className="drop-shadow-[0_0_30px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:scale-105 cursor-pointer"
          onClick={spin}
        />
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-20">
          <div className={cn(
            "w-6 h-6 sm:w-8 sm:h-8 rotate-45 border-r-4 border-b-4 rounded-br-lg shadow-xl",
            side === 'BU' ? "bg-ucl-neon border-ucl-dark" : "bg-ucl-blue border-ucl-dark"
          )} />
        </div>
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || availableTeams.length === 0 || isLocked}
        className={cn(
          "w-full py-4 rounded-2xl font-black italic text-base sm:text-lg uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3",
          isSpinning || availableTeams.length === 0 || isLocked
            ? "bg-white/5 text-ucl-silver cursor-not-allowed"
            : side === 'BU'
              ? "bg-ucl-neon text-white hover:shadow-ucl-neon/40 hover:scale-[1.02]"
              : "bg-ucl-blue text-black hover:shadow-ucl-blue/40 hover:scale-[1.02]"
        )}
      >
        {isSpinning ? <RotateCw className="animate-spin" size={24} /> : <Zap size={24} className="fill-current" />}
        {isSpinning ? "SPINNING..." : `SPIN ${side}`}
      </button>

      <AnimatePresence>
        {selectedTeam && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="text-center font-montserrat">
            <p className="text-[10px] font-bold text-ucl-silver uppercase tracking-[0.3em] mb-1">Kết quả</p>
            <h4 className="text-lg sm:text-xl font-black italic text-white tracking-tight">{selectedTeam.name}</h4>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdvancedWheel = ({ players = [], onMatchCreated }) => {
  const [drawMode, setDrawMode] = useState('all'); // 'all' or 'qualified'
  const [resultBU, setResultBU] = useState(null);
  const [resultThinh, setResultThinh] = useState(null);
  const [history, setHistory] = useState([]);
  const processedPairRef = useRef(null);

  // 12 Groups definition to map qualified teams
  const groups = {
    'A': ['Iran', 'Ai Cập', 'Bỉ', 'Saudi Arabia'],
    'B': ['Jordan', 'Iraq', 'Tây Ban Nha', 'Pháp'],
    'C': ['Thổ Nhĩ Kỳ', 'Hà Lan', 'Brazil', 'Argentina'],
    'D': ['Croatia', 'Colombia', 'Senegal', 'Thụy Sĩ'],
    'E': ['Uruguay', 'Haiti', 'Qatar', 'Bồ Đào Nha'],
    'F': ['Uzbekistan', 'New Zealand', 'Algeria', 'Hàn Quốc'],
    'G': ['Bosnia & Herzegovina', 'Paraguay', 'Áo', 'Scotland'],
    'H': ['Tunisia', 'Na Uy', 'DR Congo', 'Australia'],
    'I': ['Curaçao', 'Cape Verde', 'Canada', 'Đức'],
    'J': ['Mexico', 'CH Séc', 'Ecuador', 'Maroc'],
    'K': ['Nhật Bản', 'Ghana', 'Nam Phi', 'Thụy Điển'],
    'L': ['Anh', 'Mỹ', 'Bờ Biển Ngà', 'Panama'],
  };

  // Compute qualified teams (Top 2 from each group) dynamically
  const { thinhQualified, buQualified } = React.useMemo(() => {
    const thinhList = [];
    const buList = [];

    // Map of colors for easy lookup
    const colorsMap = {};
    TEAMS_THINH.forEach(t => { colorsMap[t.name] = t.color; });
    TEAMS_BU.forEach(t => { colorsMap[t.name] = t.color; });

    Object.entries(groups).forEach(([groupName, teams]) => {
      const sorted = teams
        .map(name => {
          const found = players.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
          return found || { name, owner: 'Chưa rõ', points: 0, gd: 0, gf: 0 };
        })
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.gf - a.gf;
        });

      // Top 2 qualify
      sorted.slice(0, 2).forEach(team => {
        const owner = String(team.owner).toUpperCase().trim();
        const color = colorsMap[team.name] || '#15803d'; // fallback green
        
        if (owner === 'THỊNH') {
          thinhList.push({ name: team.name, color });
        } else if (owner === 'BU') {
          buList.push({ name: team.name, color });
        }
      });
    });

    return { thinhQualified: thinhList, buQualified: buList };
  }, [players]);

  const thinhTeamsList = drawMode === 'qualified' ? thinhQualified : TEAMS_THINH;
  const buTeamsList = drawMode === 'qualified' ? buQualified : TEAMS_BU;

  useEffect(() => {
    if (resultBU && resultThinh) {
      const currentPair = `${resultBU.name}_${resultThinh.name}`;
      if (processedPairRef.current === currentPair) return;
      
      processedPairRef.current = currentPair;
      const newMatch = {
        id: `wheel_${Date.now()}`,
        playerA: 'BU',
        playerB: 'THỊNH',
        teamA: resultBU.name,
        teamB: resultThinh.name,
        scoreA: '-',
        scoreB: '-',
        date: new Date().toISOString(),
        status: 'pending'
      };

      setHistory(prev => [newMatch, ...prev]);
      onMatchCreated(newMatch);

      const timer = setTimeout(() => {
        setResultBU(null);
        setResultThinh(null);
        processedPairRef.current = null;
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [resultBU, resultThinh, onMatchCreated]);

  return (
    <div className="space-y-12 pb-32">
      <div className="text-center space-y-4 px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-tight font-bebas">
          HỆ THỐNG <span className="text-ucl-neon">BỐC THĂM TỰ ĐỘNG</span>
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={() => setDrawMode('all')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              drawMode === 'all' 
                ? "bg-ucl-neon text-white shadow-[0_0_15px_rgba(255,42,95,0.4)]" 
                : "bg-white/5 text-ucl-silver hover:bg-white/10"
            )}
          >
            Tất cả 48 đội
          </button>
          <button 
            onClick={() => setDrawMode('qualified')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
              drawMode === 'qualified' 
                ? "bg-ucl-neon text-white shadow-[0_0_15px_rgba(255,42,95,0.4)]" 
                : "bg-white/5 text-ucl-silver hover:bg-white/10"
            )}
          >
            <Trophy size={12} className="text-yellow-400" /> Đội đi tiếp (Top 2)
          </button>
        </div>
      </div>

      {/* Qualified Teams Section */}
      {drawMode === 'qualified' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto p-6 glass-card border-white/5 text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className="text-yellow-400 animate-pulse" size={18} />
            <h4 className="text-xs font-black uppercase tracking-widest text-white">24 Đội tuyển Vượt Qua Vòng Bảng</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-[10px] font-montserrat">
            {thinhQualified.map(t => (
              <div key={t.name} className="flex items-center gap-1.5 p-2 bg-ucl-neon/5 border border-ucl-neon/10 rounded-xl justify-center">
                <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center overflow-hidden shrink-0"><img src={getTeamLogo(t.name)} alt="" className="w-3 h-3 object-contain" /></div>
                <span className="font-bold text-white uppercase truncate">{t.name}</span>
                <span className="text-[7px] text-ucl-neon font-black">T</span>
              </div>
            ))}
            {buQualified.map(t => (
              <div key={t.name} className="flex items-center gap-1.5 p-2 bg-ucl-blue/5 border border-ucl-blue/10 rounded-xl justify-center">
                <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center overflow-hidden shrink-0"><img src={getTeamLogo(t.name)} alt="" className="w-3 h-3 object-contain" /></div>
                <span className="font-bold text-white uppercase truncate">{t.name}</span>
                <span className="text-[7px] text-ucl-blue font-black">B</span>
              </div>
            ))}
          </div>
          {thinhQualified.length === 0 && buQualified.length === 0 && (
            <p className="text-ucl-silver italic text-xs py-4">Chưa có kết quả vòng bảng. Hãy hoàn thành các trận đấu để lấy danh sách.</p>
          )}
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 max-w-6xl mx-auto px-4">
        <div className="relative">
          <Wheel side="BU" label="BỐC THĂM BU" teams={buTeamsList} onResult={setResultBU} isLocked={!!resultBU} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-ucl-dark border-4 border-ucl-neon shadow-[0_0_20px_rgba(255,42,95,0.5)] flex items-center justify-center z-20 overflow-hidden">
               {resultBU ? (
                 <motion.img 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   src={getTeamLogo(resultBU.name)} 
                   alt={resultBU.name} 
                   className="w-10 h-10 object-contain" 
                 />
               ) : (
                 <span className="text-[10px] font-black text-ucl-neon uppercase tracking-tighter font-bebas">BU</span>
               )}
            </div>
          </div>
        </div>
        
        <div className="flex lg:flex-col items-center gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-ucl-dark border-4 border-ucl-neon/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,42,95,0.2)]">
            <span className="text-xl sm:text-2xl font-black italic text-ucl-neon font-bebas">VS</span>
          </div>
          <div className="hidden lg:block w-px h-32 bg-gradient-to-b from-ucl-neon/50 to-transparent" />
          <div className="lg:hidden w-16 h-px bg-gradient-to-r from-ucl-neon/50 to-transparent" />
        </div>

        <div className="relative">
          <Wheel side="THỊNH" label="BỐC THĂM THỊNH" teams={thinhTeamsList} onResult={setResultThinh} isLocked={!!resultThinh} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-ucl-dark border-4 border-ucl-neon shadow-[0_0_20px_rgba(255,42,95,0.5)] flex items-center justify-center z-20 overflow-hidden">
               {resultThinh ? (
                 <motion.img 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   src={getTeamLogo(resultThinh.name)} 
                   alt={resultThinh.name} 
                   className="w-10 h-10 object-contain" 
                 />
               ) : (
                 <span className="text-[10px] font-black text-ucl-neon uppercase tracking-tighter font-bebas">THỊNH</span>
               )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {resultBU && resultThinh && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ucl-dark/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="relative glass-card p-8 md:p-12 border-4 border-ucl-neon max-w-2xl w-full text-center space-y-6">
               <button onClick={() => { setResultBU(null); setResultThinh(null); }} className="absolute top-4 right-4 text-ucl-silver"><X size={24} /></button>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 font-bebas">
                  <div className="text-2xl sm:text-4xl font-black italic text-white uppercase">{resultBU.name}</div>
                  <div className="text-5xl font-black italic text-ucl-neon">VS</div>
                  <div className="text-2xl sm:text-4xl font-black italic text-white uppercase">{resultThinh.name}</div>
               </div>
               <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-widest text-ucl-neon animate-pulse font-bebas">MATCH CREATED!</h3>
               <p className="text-ucl-silver font-bold uppercase tracking-widest text-[10px] font-montserrat">Adding to schedule...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8 px-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <History className="text-ucl-neon" size={24} />
              <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white font-bebas">LỊCH THI ĐẤU <span className="text-ucl-neon font-bebas">CHỜ ĐÁ</span></h3>
           </div>
        </div>
        
        <div className="grid gap-4">
          {history.map((match, idx) => (
            <motion.div key={match.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-4 sm:p-6 hover:border-ucl-neon/50 transition-all">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-12 flex-1 justify-center">
                  <div className="text-center min-w-[80px] sm:min-w-[120px]">
                      <span className="text-[8px] font-black text-ucl-neon block mb-1 font-montserrat">BU</span>
                      <span className="text-lg sm:text-xl font-black italic text-white uppercase font-bebas">{match.teamA}</span>
                  </div>
                  <div className="text-lg font-black italic text-ucl-neon opacity-30 font-bebas">VS</div>
                  <div className="text-center min-w-[80px] sm:min-w-[120px]">
                      <span className="text-[8px] font-black text-ucl-blue block mb-1 font-montserrat">THỊNH</span>
                      <span className="text-lg sm:text-xl font-black italic text-white uppercase font-bebas">{match.teamB}</span>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center gap-3 sm:pl-8 sm:border-l border-white/5">
                   <div className="px-3 py-1 bg-ucl-neon/10 border border-ucl-neon/30 rounded-lg whitespace-nowrap"><span className="text-[8px] font-black text-ucl-neon uppercase tracking-widest font-montserrat">MATCH {history.length - idx}</span></div>
                   <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'tourney' }))} className="p-2 bg-white/5 rounded-lg text-ucl-neon hover:bg-ucl-neon hover:text-ucl-dark transition-all"><ChevronRight size={16} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedWheel;
