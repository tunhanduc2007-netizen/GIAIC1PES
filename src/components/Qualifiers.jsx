import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Edit, Activity, Zap, PlayCircle, CheckCircle2 } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';

const QUALIFIER_PAIRINGS = [
  { id: 1, teamA: 'Đức', teamB: 'Haiti', ownerA: 'THỊNH', ownerB: 'BU' },
  { id: 2, teamA: 'Thổ Nhĩ Kỳ', teamB: 'Thụy Điển', ownerA: 'THỊNH', ownerB: 'BU' },
  { id: 3, teamA: 'Brazil', teamB: 'Pháp', ownerA: 'THỊNH', ownerB: 'BU' },
  { id: 4, teamA: 'Uzbekistan', teamB: 'Áo', ownerA: 'THỊNH', ownerB: 'BU' },
  { id: 5, teamA: 'Bỉ', teamB: 'Mỹ', ownerA: 'THỊNH', ownerB: 'BU' },
  { id: 6, teamA: 'Algeria', teamB: 'Ghana', ownerA: 'THỊNH', ownerB: 'BU' },
  { id: 7, teamA: 'DR Congo', teamB: 'Maroc', ownerA: 'THỊNH', ownerB: 'BU' },
  { id: 8, teamA: 'Croatia', teamB: 'Bồ Đào Nha', ownerA: 'THỊNH', ownerB: 'BU' },
  { id: 9, teamA: 'Panama', teamB: 'Ai Cập', ownerA: 'THỊNH', ownerB: 'BU' },
  { id: 10, teamA: 'Tây Ban Nha', teamB: 'CH Séc', ownerA: 'THỊNH', ownerB: 'BU' }
];

const Qualifiers = ({ matches = [], setActiveTab }) => {
  
  // Find match result from global matches state
  const getQualifierResult = (pairing) => {
    // Search matches list for this specific pairing (order-independent)
    const found = [...matches].reverse().find(m => 
      (m.teamA === pairing.teamA && m.teamB === pairing.teamB) || 
      (m.teamA === pairing.teamB && m.teamB === pairing.teamA)
    );

    if (!found) return null;

    const scoreA = found.teamA === pairing.teamA ? parseInt(found.scoreA) : parseInt(found.scoreB);
    const scoreB = found.teamA === pairing.teamB ? parseInt(found.scoreA) : parseInt(found.scoreB);
    const winner = scoreA > scoreB ? pairing.teamA : (scoreA < scoreB ? pairing.teamB : null);

    return {
      scoreA,
      scoreB,
      winner,
      date: found.date
    };
  };

  // Build match results list
  const results = QUALIFIER_PAIRINGS.map(p => {
    const res = getQualifierResult(p);
    return {
      ...p,
      played: !!res,
      scoreA: res ? res.scoreA : null,
      scoreB: res ? res.scoreB : null,
      winner: res ? res.winner : null
    };
  });

  const totalPlayed = results.filter(r => r.played).length;
  const progressPercent = Math.round((totalPlayed / 10) * 100);

  // Derby stats specifically for the 10 qualifiers
  const stats = {
    thinhWins: 0,
    buWins: 0,
    draws: 0
  };

  results.forEach(r => {
    if (r.played) {
      if (r.scoreA > r.scoreB) stats.thinhWins++;
      else if (r.scoreA < r.scoreB) stats.buWins++;
      else stats.draws++;
    }
  });

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-ucl-neon/20 rounded-2xl border border-ucl-neon/40 shrink-0">
             <Swords className="text-ucl-neon" size={24} />
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">CẶP ĐẤU <span className="text-ucl-neon">VÒNG LOẠI</span></h2>
            <p className="text-ucl-silver text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Liên kết trực tiếp với Nhập kết quả & Bảng xếp hạng chính</p>
          </div>
        </div>
        
        {/* Switch button */}
        {setActiveTab && (
          <button 
            onClick={() => setActiveTab('match-entry')}
            className="flex items-center gap-2 px-5 py-3 bg-ucl-neon hover:bg-ucl-neon/80 text-ucl-dark rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,42,95,0.2)] font-montserrat self-start sm:self-center"
          >
            <Edit size={14} /> Đi tới Nhập kết quả
          </button>
        )}
      </div>

      {/* Progress & Derby Stats Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-montserrat">
        
        {/* Progress Card */}
        <div className="glass-card p-6 flex flex-col justify-between border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
             <Activity className="text-ucl-neon" size={18} />
             <h4 className="text-[10px] font-black uppercase tracking-widest text-ucl-silver">Tiến trình Vòng Loại</h4>
          </div>
          <div className="space-y-3 z-10">
             <div className="flex justify-between items-end">
                <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-white">{totalPlayed} / 10</span>
                <span className="text-xs font-bold text-ucl-neon">{progressPercent}% Hoàn thành</span>
             </div>
             <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden flex border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-ucl-neon to-ucl-blue h-full"
                />
             </div>
             <p className="text-[9px] text-ucl-silver uppercase tracking-wider font-bold">Tỉ số tự động cập nhật khi nhập kết quả tương ứng.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
             <Activity size={120} />
          </div>
        </div>

        {/* Derby Stats Card */}
        <div className="glass-card p-6 border-white/5 lg:col-span-2 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
             <Zap className="text-yellow-400" size={18} />
             <h4 className="text-[10px] font-black uppercase tracking-widest text-ucl-silver">Thành tích Vòng loại (THỊNH vs BU)</h4>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 z-10">
             <div className="flex-1 w-full flex items-center justify-around">
                <div className="text-center">
                   <span className="text-lg font-black text-ucl-neon">THỊNH</span>
                   <span className="text-2xl md:text-3xl font-black italic block text-white mt-1">{stats.thinhWins} thắng</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 shrink-0 text-center">
                   <span className="text-[10px] font-black uppercase tracking-widest text-ucl-silver block">Hòa</span>
                   <span className="text-lg font-black block text-white mt-0.5">{stats.draws}</span>
                </div>
                <div className="text-center">
                   <span className="text-lg font-black text-ucl-blue">BU</span>
                   <span className="text-2xl md:text-3xl font-black italic block text-white mt-1">{stats.buWins} thắng</span>
                </div>
             </div>
          </div>
          {/* Split Glow background decoration */}
          <div className="absolute top-0 left-0 w-1/2 h-full bg-[radial-gradient(circle_at_0%_0%,rgba(255,42,95,0.02),transparent_70%)] pointer-events-none" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,rgba(0,212,255,0.02),transparent_70%)] pointer-events-none" />
        </div>

      </div>

      {/* Main Qualifiers Table List (Ultra-clean and readable!) */}
      <div className="glass-card overflow-hidden border border-white/5">
        <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
          <Swords className="text-ucl-neon shrink-0" size={20} />
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-white">Danh sách 10 trận đấu Vòng Loại</h3>
        </div>

        <div className="table-responsive">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full font-montserrat">
            <thead>
              <tr className="bg-ucl-blue/20 text-ucl-silver text-[9px] md:text-[10px] uppercase tracking-widest font-black border-b border-white/5">
                <th className="px-4 md:px-6 py-4 text-center w-16">Trận</th>
                <th className="px-4 md:px-6 py-4 text-right w-[35%]">Đội Tuyển A (THỊNH)</th>
                <th className="px-4 py-4 text-center w-32">Tỉ số</th>
                <th className="px-4 md:px-6 py-4 text-left w-[35%]">Đội Tuyển B (BU)</th>
                <th className="px-4 py-4 text-center w-28">Trạng thái</th>
                <th className="px-4 py-4 text-center w-36">Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {results.map((m, index) => {
                return (
                  <motion.tr 
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={cn(
                      "border-b border-white/5 hover:bg-white/2 transition-colors group",
                      m.played ? "bg-green-500/[0.01]" : ""
                    )}
                  >
                    {/* ID Trận */}
                    <td className="px-4 md:px-6 py-4 text-center font-black text-xs text-ucl-silver">
                      #{m.id}
                    </td>

                    {/* Đội A */}
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <div>
                          <p className="text-xs md:text-sm font-bold text-white group-hover:text-ucl-neon transition-colors truncate">{m.teamA}</p>
                          <span className="text-[8px] font-black text-ucl-neon uppercase tracking-tighter">{m.ownerA}</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0 shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                          <img src={getTeamLogo(m.teamA)} alt={m.teamA} className="w-6 h-6 object-contain" />
                        </div>
                      </div>
                    </td>

                    {/* Tỉ số chính giữa */}
                    <td className="px-4 py-4 text-center">
                      <div className="inline-block">
                        {m.played ? (
                          <div className="flex items-center justify-center gap-2.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl shadow-md">
                            <span className={cn("text-sm md:text-base font-black italic tracking-tighter", m.scoreA > m.scoreB ? "text-ucl-neon" : "text-white")}>
                              {m.scoreA}
                            </span>
                            <span className="text-ucl-silver/30 font-bold">-</span>
                            <span className={cn("text-sm md:text-base font-black italic tracking-tighter", m.scoreB > m.scoreA ? "text-ucl-blue" : "text-white")}>
                              {m.scoreB}
                            </span>
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-ucl-neon/10 border border-ucl-neon/20 rounded-lg text-[10px] font-black text-ucl-neon uppercase tracking-widest shadow-sm">
                            VS
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Đội B */}
                    <td className="px-4 md:px-6 py-4 text-left">
                      <div className="flex items-center gap-3 justify-start">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0 shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                          <img src={getTeamLogo(m.teamB)} alt={m.teamB} className="w-6 h-6 object-contain" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm font-bold text-white group-hover:text-ucl-blue transition-colors truncate">{m.teamB}</p>
                          <span className="text-[8px] font-black text-ucl-blue uppercase tracking-tighter">{m.ownerB}</span>
                        </div>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-4 text-center">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-flex items-center gap-1",
                        m.played 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                          : "bg-white/5 text-ucl-silver border border-white/5"
                      )}>
                        {m.played ? (
                          <>
                            <CheckCircle2 size={10} /> Đã đá
                          </>
                        ) : (
                          <>
                            <PlayCircle size={10} className="animate-pulse" /> Chưa đá
                          </>
                        )}
                      </span>
                    </td>

                    {/* Kết quả */}
                    <td className="px-4 py-4 text-center">
                      {m.played ? (
                        <div className="flex items-center justify-center gap-1.5 text-[9px] font-black text-green-400 uppercase tracking-widest">
                          <Trophy size={11} className="text-yellow-400" />
                          <span className="truncate max-w-[100px]">{m.winner || 'Hòa'}</span>
                        </div>
                      ) : (
                        <span className="text-[8px] uppercase tracking-widest text-ucl-silver/30 font-bold">Chờ thi đấu</span>
                      )}
                    </td>

                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Qualifiers;
