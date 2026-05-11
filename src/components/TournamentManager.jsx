import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Award, ChevronRight, Save, Trash2, Trophy } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';

const TournamentManager = ({ tourneyMatches, setTourneyMatches, matches, setMatches, players }) => {
  const [editingId, setEditingId] = useState(null);
  const [editScoreA, setEditScoreA] = useState(0);
  const [editScoreB, setEditScoreB] = useState(0);

  const handleSaveResult = (match) => {
    const pA = players.find(p => p.name === match.playerA);
    const pB = players.find(p => p.name === match.playerB);
    
    // Add to main match history
    const newMatch = {
      id: Date.now().toString(),
      playerAId: pA?.id || 'bu',
      playerBId: pB?.id || 'thinh',
      teamA: match.teamA,
      teamB: match.teamB,
      scoreA: parseInt(editScoreA),
      scoreB: parseInt(editScoreB),
      date: new Date().toISOString()
    };

    setMatches([...matches, newMatch]);

    // Update tourney match status
    const updatedTourney = tourneyMatches.map(m => 
      m.id === match.id ? { ...m, status: 'completed', scoreA: editScoreA, scoreB: editScoreB } : m
    );
    setTourneyMatches(updatedTourney);
    setEditingId(null);
  };

  const removeTourneyMatch = (id) => {
    setTourneyMatches(tourneyMatches.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-ucl-neon/20 rounded-2xl border border-ucl-neon/40 shrink-0">
             <Swords className="text-ucl-neon" size={24} md={28} />
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">LỊCH THI ĐẤU <span className="text-ucl-neon">& CẶP ĐẤU</span></h2>
            <p className="text-ucl-silver text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Tự động tạo từ vòng quay</p>
          </div>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {tourneyMatches.map((match) => (
          <motion.div 
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "glass-card p-4 md:p-6 border-l-4 transition-all",
              match.status === 'completed' ? "border-l-green-500 opacity-60" : "border-l-ucl-neon"
            )}
          >
            <div className="flex justify-between items-start mb-4">
               <span className="text-[8px] md:text-[10px] font-black bg-ucl-neon/10 text-ucl-neon px-2 py-0.5 rounded-full uppercase tracking-widest">{match.name}</span>
               <button onClick={() => removeTourneyMatch(match.id)} className="text-ucl-silver hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>

            <div className="flex items-center justify-between gap-2 md:gap-4">
               <div className="flex-1 text-center space-y-2">
                  <img src={getTeamLogo(match.teamA)} alt={match.teamA} className="w-8 h-8 md:w-10 md:h-10 mx-auto object-contain" />
                  <div className="min-w-0">
                    <p className="text-[8px] md:text-[10px] text-ucl-silver uppercase font-bold tracking-widest truncate">{match.playerA}</p>
                    <p className="text-sm md:text-lg font-black italic truncate">{match.teamA}</p>
                  </div>
               </div>

               <div className="flex flex-col items-center">
                 {editingId === match.id ? (
                   <div className="flex items-center gap-1 md:gap-2">
                      <input 
                        type="number" 
                        value={editScoreA} 
                        onChange={(e) => setEditScoreA(e.target.value)} 
                        className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl text-center text-lg md:text-xl font-black focus:border-ucl-neon outline-none"
                      />
                      <span className="text-ucl-silver">-</span>
                      <input 
                        type="number" 
                        value={editScoreB} 
                        onChange={(e) => setEditScoreB(e.target.value)} 
                        className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl text-center text-lg md:text-xl font-black focus:border-ucl-neon outline-none"
                      />
                   </div>
                 ) : (
                   <div className="text-xl md:text-3xl font-black italic tracking-tighter text-ucl-neon">
                      {match.status === 'completed' ? `${match.scoreA} - ${match.scoreB}` : 'VS'}
                   </div>
                 )}
               </div>

               <div className="flex-1 text-center space-y-2">
                  <img src={getTeamLogo(match.teamB)} alt={match.teamB} className="w-8 h-8 md:w-10 md:h-10 mx-auto object-contain" />
                  <div className="min-w-0">
                    <p className="text-[8px] md:text-[10px] text-ucl-silver uppercase font-bold tracking-widest truncate">{match.playerB}</p>
                    <p className="text-sm md:text-lg font-black italic truncate">{match.teamB}</p>
                  </div>
               </div>
            </div>

            <div className="mt-6 flex justify-center">
              {match.status !== 'completed' ? (
                editingId === match.id ? (
                  <button 
                    onClick={() => handleSaveResult(match)}
                    className="ucl-button flex items-center gap-2 px-4 py-2 text-[10px]"
                  >
                    <Save size={12} /> Lưu kết quả
                  </button>
                ) : (
                  <button 
                    onClick={() => { setEditingId(match.id); setEditScoreA(0); setEditScoreB(0); }}
                    className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-ucl-neon hover:text-ucl-dark transition-all"
                  >
                    <Award size={12} /> Nhập tỉ số
                  </button>
                )
              ) : (
                <div className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                   <Save size={12} /> Đã thi đấu
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {tourneyMatches.length === 0 && (
           <div className="col-span-full py-12 md:py-20 glass-card text-center space-y-4">
              <Trophy size={48} className="mx-auto text-ucl-silver opacity-20" />
              <p className="text-ucl-silver italic text-xs md:text-sm">Chưa có cặp đấu nào. Hãy dùng vòng quay để tạo cặp đấu tự động.</p>
           </div>
        )}
      </div>

      {/* Bracket Section */}
      <div className="space-y-6">
        <h3 className="text-lg md:text-xl font-black italic tracking-widest text-ucl-neon">BRACKET / NHÁNH ĐẤU</h3>
        <div className="glass-card p-6 md:p-12 border-ucl-neon/10 overflow-hidden">
           <div className="overflow-x-auto pb-4 custom-scrollbar">
             <div className="min-w-[800px] py-12 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-4xl flex items-center justify-between">
                   {/* Round of 16 Columns */}
                   <div className="flex flex-col gap-4">
                      {[1,2,3,4].map(i => <div key={i} className="w-24 h-8 bg-white/5 border border-white/10 rounded" />)}
                   </div>
                   <div className="flex flex-col gap-8">
                      {[1,2].map(i => <div key={i} className="w-24 h-8 bg-ucl-neon/20 border border-ucl-neon/40 rounded" />)}
                   </div>
                   <div className="w-24 h-24 sm:w-32 sm:h-32 bg-ucl-neon flex items-center justify-center rounded-2xl shadow-[0_0_50px_rgba(0,242,255,0.3)] shrink-0">
                      <Trophy className="text-ucl-dark" size={32} />
                   </div>
                   <div className="flex flex-col gap-8">
                      {[1,2].map(i => <div key={i} className="w-24 h-8 bg-ucl-neon/20 border border-ucl-neon/40 rounded" />)}
                   </div>
                   <div className="flex flex-col gap-4">
                      {[1,2,3,4].map(i => <div key={i} className="w-24 h-8 bg-white/5 border border-white/10 rounded" />)}
                   </div>
                </div>
                <p className="mt-8 text-ucl-silver text-[10px] italic">Hệ thống Bracket sẽ tự động điền tên sau khi đủ 8 trận đấu.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentManager;
