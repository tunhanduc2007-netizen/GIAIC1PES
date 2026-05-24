import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Save, User as UserIcon, Shield, Award, Clock, Flame, ShieldAlert, ChevronRight, Search, X } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';
import confetti from 'canvas-confetti';

const SearchableSelect = ({ value, onChange, players, placeholder, side }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedPlayer = players.find(p => p.id === value);
  
  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelect = (playerId) => {
    onChange(playerId);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-ucl-dark/80 border border-white/10 rounded-xl px-4 py-3 text-center text-sm font-bold hover:border-ucl-neon outline-none transition-all cursor-pointer flex items-center justify-between"
      >
        <span className="flex-1">{selectedPlayer ? `${selectedPlayer.name} (${selectedPlayer.owner})` : placeholder}</span>
        <ChevronRight className={cn("transition-transform", isOpen && "rotate-90")} size={16} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-ucl-dark/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
          >
            {/* Search Box */}
            <div className="p-3 border-b border-white/10 sticky top-0 bg-ucl-dark/95">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ucl-silver" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm đội..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-sm focus:border-ucl-neon outline-none"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ucl-silver hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Options List */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p.id)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-3",
                      value === p.id && "bg-ucl-neon/20 text-ucl-neon"
                    )}
                  >
                    <img src={getTeamLogo(p.name)} alt={p.name} className="w-6 h-6 object-contain" />
                    <span>{p.name}</span>
                    <span className="text-xs opacity-60">({p.owner})</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-ucl-silver text-sm">
                  Không tìm thấy đội nào
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MatchEntry = ({ players, matches, setMatches }) => {
  const [playerAId, setPlayerAId] = useState('');
  const [playerBId, setPlayerBId] = useState('');
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [scorersA, setScorersA] = useState('');
  const [scorersB, setScorersB] = useState('');
  const [yellowA, setYellowA] = useState('');
  const [yellowB, setYellowB] = useState('');
  const [redA, setRedA] = useState('');
  const [redB, setRedB] = useState('');
  const [mvpId, setMvpId] = useState('');

  const playWhistleSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (time, duration, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        // Fast vibrato to mimic whistle pea rattle
        const fm = ctx.createOscillator();
        const fmGain = ctx.createGain();
        fm.frequency.value = 35;
        fmGain.gain.value = 60;
        
        fm.connect(fmGain.gain);
        fmGain.connect(osc.frequency);
        
        // Envelope
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.4, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        fm.start(time);
        osc.start(time);
        
        fm.stop(time + duration);
        osc.stop(time + duration);
      };

      const now = ctx.currentTime;
      // Double whistle: Toot Toot!
      playTone(now, 0.2, 1800);
      playTone(now + 0.28, 0.4, 1800);
    } catch (e) {
      console.log('Web Audio Context error:', e);
    }
  };

  const handleSaveMatch = (e) => {
    e.preventDefault();
    if (!playerAId || !playerBId || playerAId === playerBId) {
      alert('Vui lòng chọn 2 đội khác nhau.');
      return;
    }

    const newMatch = {
      id: Date.now().toString(),
      playerAId,
      playerBId,
      teamA: pA?.name || '',
      teamB: pB?.name || '',
      scoreA: parseInt(scoreA),
      scoreB: parseInt(scoreB),
      scorersA,
      scorersB,
      yellowA,
      yellowB,
      redA,
      redB,
      mvpId,
      date: new Date().toISOString()
    };

    setMatches([...matches, newMatch]);
    
    // Play referee whistle sound
    playWhistleSound();

    // Trigger visual confetti fireworks!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ff2a5f', '#ffd700', '#00b8ff', '#ffffff']
    });
    
    // Reset form
    setPlayerAId('');
    setPlayerBId('');
    setScoreA(0);
    setScoreB(0);
    setScorersA('');
    setScorersB('');
    setYellowA('');
    setYellowB('');
    setRedA('');
    setRedB('');
    setMvpId('');
  };

  const pA = players.find(p => p.id === playerAId);
  const pB = players.find(p => p.id === playerBId);
  const mvp = players.find(p => p.id === mvpId);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-ucl-neon/20 border border-ucl-neon/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.2)]">
            <Sword className="text-ucl-neon" size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">NHẬP KẾT QUẢ <span className="text-ucl-neon">TRẬN ĐẤU</span></h2>
            <p className="text-ucl-silver text-xs font-bold uppercase tracking-[0.2em] mt-1">Cập nhật tỉ số và thống kê ngay lập tức</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveMatch} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Score Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-1 overflow-hidden">
            <div className="bg-ucl-gradient p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative">
              
              {/* Team A Selection Area */}
              <div className="flex-1 w-full space-y-6">
                 <div className="text-center space-y-4">
                    <div className={cn(
                      "w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-black border-4 transition-all duration-500 overflow-hidden",
                      pA ? "bg-white/5 border-ucl-neon/50 scale-110 shadow-[0_0_30px_rgba(0,242,255,0.2)]" : "bg-white/5 text-ucl-silver border-white/5"
                    )}>
                       {pA ? (
                         <img src={getTeamLogo(pA.name)} alt={pA.name} className="w-14 h-14 object-contain" />
                       ) : '?'}
                    </div>
                    <SearchableSelect
                      value={playerAId}
                      onChange={setPlayerAId}
                      players={players}
                      placeholder="CHỌN ĐỘI A"
                      side="A"
                    />
                 </div>
                 
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-ucl-silver uppercase tracking-widest block text-center">Ghi bàn (Tên, Tên...)</label>
                    <textarea 
                      value={scorersA} 
                      onChange={(e) => setScorersA(e.target.value)} 
                      placeholder="Kane, Kane, Goretzka..."
                      className="w-full h-24 bg-ucl-dark/50 border border-white/10 rounded-2xl p-4 text-xs focus:border-ucl-neon outline-none transition-all resize-none"
                    />
                 </div>
              </div>

              {/* VS & Score Middle Area */}
              <div className="flex flex-col items-center gap-6 z-10 px-8">
                 <div className="text-2xl font-black italic text-ucl-neon opacity-50">VS</div>
                 <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      value={scoreA} 
                      onChange={(e) => setScoreA(Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                      className="w-20 h-24 bg-ucl-dark/90 border-2 border-white/10 rounded-3xl text-center text-5xl font-black italic focus:border-ucl-neon focus:shadow-[0_0_20px_rgba(0,242,255,0.3)] outline-none transition-all"
                    />
                    <div className="w-4 h-1 bg-ucl-neon rounded-full" />
                    <input 
                      type="number" 
                      value={scoreB} 
                      onChange={(e) => setScoreB(Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                      className="w-20 h-24 bg-ucl-dark/90 border-2 border-white/10 rounded-3xl text-center text-5xl font-black italic focus:border-ucl-neon focus:shadow-[0_0_20px_rgba(0,242,255,0.3)] outline-none transition-all"
                    />
                 </div>
                 <div className="px-4 py-1.5 bg-ucl-neon/10 border border-ucl-neon/40 rounded-full text-[10px] font-black text-ucl-neon uppercase tracking-widest">Scoreboard</div>
              </div>

              {/* Team B Selection Area */}
              <div className="flex-1 w-full space-y-6">
                 <div className="text-center space-y-4">
                    <div className={cn(
                      "w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-black border-4 transition-all duration-500 overflow-hidden",
                      pB ? "bg-white/5 border-ucl-blue/50 scale-110 shadow-[0_0_30px_rgba(0,212,255,0.2)]" : "bg-white/5 text-ucl-silver border-white/5"
                    )}>
                       {pB ? (
                         <img src={getTeamLogo(pB.name)} alt={pB.name} className="w-14 h-14 object-contain" />
                       ) : '?'}
                    </div>
                    <SearchableSelect
                      value={playerBId}
                      onChange={setPlayerBId}
                      players={players}
                      placeholder="CHỌN ĐỘI B"
                      side="B"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-ucl-silver uppercase tracking-widest block text-center">Ghi bàn (Tên, Tên...)</label>
                    <textarea 
                      value={scorersB} 
                      onChange={(e) => setScorersB(e.target.value)} 
                      placeholder="Saka, Neres, Kudus..."
                      className="w-full h-24 bg-ucl-dark/50 border border-white/10 rounded-2xl p-4 text-xs focus:border-ucl-neon outline-none transition-all resize-none"
                    />
                 </div>
              </div>

              {/* Background Stars Decoration */}
              <div className="absolute inset-0 opacity-10 pointer-events-none star-pattern" />
            </div>
          </div>

          {/* Discipline Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-card p-6 border-yellow-500/10">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-6 h-8 bg-yellow-400 rounded-sm" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400">Thẻ vàng (Cầu thủ)</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input 
                     type="text" 
                     value={yellowA} 
                     onChange={(e) => setYellowA(e.target.value)}
                     placeholder="Đội A..."
                     className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-yellow-400 outline-none"
                   />
                   <input 
                     type="text" 
                     value={yellowB} 
                     onChange={(e) => setYellowB(e.target.value)}
                     placeholder="Đội B..."
                     className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-yellow-400 outline-none"
                   />
                </div>
             </div>

             <div className="glass-card p-6 border-red-500/10">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-6 h-8 bg-red-500 rounded-sm" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-red-500">Thẻ đỏ (Cầu thủ)</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input 
                     type="text" 
                     value={redA} 
                     onChange={(e) => setRedA(e.target.value)}
                     placeholder="Đội A..."
                     className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-red-500 outline-none"
                   />
                   <input 
                     type="text" 
                     value={redB} 
                     onChange={(e) => setRedB(e.target.value)}
                     placeholder="Đội B..."
                     className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-red-500 outline-none"
                   />
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Controls Area */}
        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card p-8 space-y-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-ucl-neon">
                    <Award size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest">MVP của trận</h3>
                 </div>
                 <select 
                   value={mvpId} 
                   onChange={(e) => setMvpId(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-ucl-neon outline-none"
                 >
                   <option value="">--- Chọn MVP ---</option>
                   {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                 <div className="flex items-center gap-2 text-ucl-silver">
                    <Clock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Thông tin trận</span>
                 </div>
                 <div className="text-xs space-y-1">
                    <p className="flex justify-between"><span>Thời gian:</span> <span className="text-white">{new Date().toLocaleTimeString()}</span></p>
                    <p className="flex justify-between"><span>Giải đấu:</span> <span className="text-ucl-neon font-bold">FIFA World Cup</span></p>
                 </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-ucl-neon text-ucl-dark rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(0,242,255,0.3)] flex items-center justify-center gap-3"
              >
                <Save size={24} /> LƯU KẾT QUẢ
              </button>
           </div>

           {/* Match History Small Preview */}
           <div className="glass-card p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-ucl-silver mb-4">Gần đây</h3>
              <div className="space-y-3">
                 {matches.slice(-3).reverse().map((m, i) => {
                    const p1 = players.find(p => p.id === m.playerAId);
                    const p2 = players.find(p => p.id === m.playerBId);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                         <span className="text-[10px] font-bold truncate flex-1">{p1?.name}</span>
                         <span className="text-xs font-black italic px-2">{m.scoreA}-{m.scoreB}</span>
                         <span className="text-[10px] font-bold truncate flex-1 text-right">{p2?.name}</span>
                      </div>
                    )
                 })}
              </div>
           </div>
        </div>

      </form>
    </div>
  );
};

export default MatchEntry;
