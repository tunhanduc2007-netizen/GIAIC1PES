import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sword, Swords, TrendingUp, DollarSign, Target, Activity, Zap, Star } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, color, delay, subValue }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-4 md:p-8 flex items-center gap-4 md:gap-6 overflow-hidden relative group hover:border-ucl-neon/40 hover:scale-[1.02] transition-all duration-300"
  >
    <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center bg-opacity-20 shadow-lg shrink-0", color)}>
      <Icon className={cn("transition-all", color.replace('bg-', 'text-').replace('bg-opacity-20', ''), "w-6 h-6 md:w-8 md:h-8")} />
    </div>
    <div className="z-10">
      <p className="text-ucl-silver text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-xl md:text-3xl font-black mt-1 italic tracking-tighter text-white">{value}</h3>
      {subValue && <p className="text-[8px] md:text-[10px] text-ucl-neon font-bold uppercase mt-1">{subValue}</p>}
    </div>
    <div className={cn("absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-all duration-500 scale-90 group-hover:scale-110", color)}>
      <Icon size={120} />
    </div>
  </motion.div>
);

const Dashboard = ({ players, matches, standings, topScorers = [], onViewAllMatches }) => {
  const totalMatches = matches.length;
  const topPlayer = standings[0];
  const topWinner = standings.reduce((prev, current) => (prev.wins > current.wins) ? prev : current, { wins: 0, name: 'N/A' });
  const topGoalScorer = topScorers[0];

  // Rivalry Stats Calculation
  const getOwner = (playerId) => {
    const player = players.find(p => String(p.id) === String(playerId));
    return player ? player.owner.toUpperCase() : 'UNKNOWN';
  };

  const derbyMatches = matches.filter(match => {
    const ownerA = getOwner(match.playerAId);
    const ownerB = getOwner(match.playerBId);
    return (ownerA === 'THỊNH' && ownerB === 'BU') || (ownerA === 'BU' && ownerB === 'THỊNH');
  });

  const derbyStats = {
    total: derbyMatches.length,
    thinhWins: 0,
    buWins: 0,
    draws: 0,
    thinhGoals: 0,
    buGoals: 0
  };

  derbyMatches.forEach(match => {
    const ownerA = getOwner(match.playerAId);
    const scoreA = parseInt(match.scoreA) || 0;
    const scoreB = parseInt(match.scoreB) || 0;

    if (ownerA === 'THỊNH') {
      derbyStats.thinhGoals += scoreA;
      derbyStats.buGoals += scoreB;
      if (scoreA > scoreB) derbyStats.thinhWins++;
      else if (scoreA < scoreB) derbyStats.buWins++;
      else derbyStats.draws++;
    } else if (ownerA === 'BU') {
      derbyStats.buGoals += scoreA;
      derbyStats.thinhGoals += scoreB;
      if (scoreA > scoreB) derbyStats.buWins++;
      else if (scoreA < scoreB) derbyStats.thinhWins++;
      else derbyStats.draws++;
    }
  });

  // Calculate percentages for win-rate bar
  const totalDecisive = derbyStats.thinhWins + derbyStats.buWins;
  const thinhPercent = totalDecisive > 0 ? Math.round((derbyStats.thinhWins / totalDecisive) * 100) : 50;
  const buPercent = totalDecisive > 0 ? Math.round((derbyStats.buWins / totalDecisive) * 100) : 50;

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      {/* Hero Section */}
      <div className="relative rounded-[2rem] overflow-hidden min-h-[260px] flex flex-col lg:flex-row lg:items-center justify-between p-6 md:p-12 bg-ucl-gradient border border-white/10 shadow-2xl gap-6">
        <div className="relative z-10 space-y-4 md:space-y-6 py-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1 bg-ucl-neon/20 border border-ucl-neon/40 rounded-full w-fit"
          >
            <Zap size={12} className="text-ucl-neon fill-ucl-neon animate-pulse" />
            <span className="text-ucl-neon text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] font-montserrat">FIFA World Cup Session 2026</span>
          </motion.div>
          
          <div className="space-y-1 md:space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="responsive-title"
            >
              FIFA WORLD CUP <span className="text-ucl-neon">PES 2021</span><br/>
              <span className="text-ucl-blue">CHAMPIONSHIP</span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 md:gap-8 pt-2 md:pt-4"
          >
             <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-white italic leading-none">{totalMatches}</span>
                <span className="text-[8px] md:text-[10px] text-ucl-silver font-bold uppercase tracking-widest mt-1 font-montserrat">Matches Played</span>
             </div>
             <div className="w-px h-8 md:h-10 bg-white/10" />
             <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-ucl-neon italic leading-none">{players.length}</span>
                <span className="text-[8px] md:text-[10px] text-ucl-silver font-bold uppercase tracking-widest mt-1 font-montserrat">Active Teams</span>
             </div>
          </motion.div>
        </div>

        {/* Cinematic Golden Glow Overlay instead of UCL logo */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-35 pointer-events-none bg-gold-glow mix-blend-screen" />
        <div className="absolute inset-0 bg-neon-glow opacity-30 pointer-events-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Vòng đấu hiện tại" 
          value="Group Stage" 
          icon={Activity} 
          color="bg-blue-500" 
          delay={0.1}
          subValue="Vòng đấu bảng"
        />
        <StatCard 
          title="Đội dẫn đầu" 
          value={topPlayer?.name || 'N/A'} 
          icon={Trophy} 
          color="bg-yellow-500" 
          delay={0.2}
          subValue={`${topPlayer?.points || 0} Points Overall`}
        />
        <StatCard 
          title="Thắng nhiều nhất" 
          value={topWinner?.name || 'N/A'} 
          icon={TrendingUp} 
          color="bg-green-500" 
          delay={0.3}
          subValue={`${topWinner?.wins || 0} Victories`}
        />
        <StatCard 
          title="Vua phá lưới" 
          value={topGoalScorer?.name || 'N/A'} 
          icon={Star} 
          color="bg-purple-500" 
          delay={0.4}
          subValue={`${topGoalScorer?.goals || 0} Goals Scored`}
        />
        <StatCard 
          title="Hiệu số cao nhất" 
          value={topPlayer?.gd || 0} 
          icon={Target} 
          color="bg-red-500" 
          delay={0.5}
          subValue="Defensive King"
        />
        <StatCard 
          title="Tổng giải thưởng" 
          value="1.200.000đ" 
          icon={DollarSign} 
          color="bg-ucl-blue" 
          delay={0.6}
          subValue="Grand Prize Pool"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Recent Matches */}
        <div className="glass-card p-6 md:p-8 border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <Sword className="text-ucl-neon" size={20} />
               <h3 className="text-lg md:text-xl font-black italic tracking-widest uppercase">Gần đây</h3>
            </div>
            <button 
              onClick={onViewAllMatches}
              className="text-ucl-neon text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-ucl-neon hover:text-white px-3 py-1 bg-ucl-neon/10 rounded-full border border-ucl-neon/20 transition-all font-montserrat"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[340px] pr-1 custom-scrollbar">
            {matches.length > 0 ? matches.slice(-5).reverse().map((match, i) => {
              const pA = players.find(p => String(p.id) === String(match.playerAId));
              const pB = players.find(p => String(p.id) === String(match.playerBId));
              const teamAName = pA?.name || match.teamA || 'Unknown';
              const teamBName = pB?.name || match.teamB || 'Unknown';
              
              return (
                <div key={i} className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-ucl-neon/30 hover:shadow-[0_0_15px_rgba(255,42,95,0.1)] transition-all group relative overflow-hidden">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black border border-white/10 group-hover:border-ucl-neon transition-all shadow-lg overflow-hidden shrink-0">
                      <img src={getTeamLogo(teamAName)} alt={teamAName} className="w-6 h-6 object-contain" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs block tracking-tight truncate">{teamAName}</span>
                      <span className="text-[8px] text-ucl-silver font-black uppercase tracking-tighter">{pA?.owner || '---'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center px-3 relative z-10 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white">{match.scoreA}</span>
                      <div className="w-1 h-1 rounded-full bg-ucl-neon animate-pulse" />
                      <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white">{match.scoreB}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-1 justify-end text-right min-w-0">
                    <div className="min-w-0">
                      <span className="font-bold text-xs block tracking-tight truncate">{teamBName}</span>
                      <span className="text-[8px] text-ucl-silver font-black uppercase tracking-tighter">{pB?.owner || '---'}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black border border-white/10 group-hover:border-ucl-neon transition-all shadow-lg overflow-hidden shrink-0">
                      <img src={getTeamLogo(teamBName)} alt={teamBName} className="w-6 h-6 object-contain" />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="p-12 text-center text-ucl-silver text-xs italic uppercase tracking-widest">
                 Chưa có trận đấu nào
              </div>
            )}
          </div>
        </div>

        {/* Rivalry Derby THỊNH vs BU */}
        <div className="glass-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden border-white/5">
           <div className="flex items-center gap-3 mb-8">
              <Swords className="text-ucl-neon" size={20} />
              <h3 className="text-lg md:text-xl font-black italic tracking-widest uppercase">Đại Chiến THỊNH vs BU</h3>
           </div>
           
           <div className="flex-1 flex flex-col justify-center space-y-6 relative z-10">
              {/* Head-to-Head Visuals */}
              <div className="flex items-center justify-between px-2">
                 <div className="text-center space-y-1">
                    <span className="w-12 h-12 rounded-2xl bg-ucl-neon/10 border border-ucl-neon/30 flex items-center justify-center text-ucl-neon text-xl font-black italic shadow-lg shadow-ucl-neon/10 mx-auto">T</span>
                    <span className="text-xs font-black tracking-widest uppercase text-ucl-neon block mt-2">THỊNH</span>
                    <span className="text-[9px] text-ucl-silver font-bold block">{derbyStats.thinhWins} Wins</span>
                 </div>
                 
                 <div className="text-center px-4 py-2 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                    <span className="text-xs font-black italic text-ucl-silver block tracking-wider uppercase">VS</span>
                    <span className="text-[9px] text-ucl-silver block font-montserrat font-bold">{derbyStats.total} Trận</span>
                 </div>
                 
                 <div className="text-center space-y-1">
                    <span className="w-12 h-12 rounded-2xl bg-ucl-blue/10 border border-ucl-blue/30 flex items-center justify-center text-ucl-blue text-xl font-black italic shadow-lg shadow-ucl-blue/10 mx-auto">B</span>
                    <span className="text-xs font-black tracking-widest uppercase text-ucl-blue block mt-2">BU</span>
                    <span className="text-[9px] text-ucl-silver font-bold block">{derbyStats.buWins} Wins</span>
                 </div>
              </div>

              {/* Progress Bar Split */}
              <div className="space-y-2">
                 <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-ucl-silver font-montserrat">
                    <span>Thắng: {thinhPercent}%</span>
                    <span>Hòa: {derbyStats.draws}</span>
                    <span>Thắng: {buPercent}%</span>
                 </div>
                 <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden flex border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${thinhPercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-ucl-neon to-red-500 h-full"
                    />
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${buPercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="bg-gradient-to-l from-ucl-blue to-yellow-500 h-full"
                    />
                 </div>
              </div>

              {/* Detailed Stats */}
              <div className="space-y-3 pt-2 font-montserrat">
                 <div className="flex justify-between items-center py-2 border-b border-white/5 text-[11px]">
                    <span className="text-ucl-silver font-bold uppercase tracking-wider text-[9px]">Tổng trận thắng</span>
                    <div className="flex items-center gap-3 font-black text-xs">
                       <span className="text-ucl-neon">{derbyStats.thinhWins}</span>
                       <span className="text-ucl-silver font-normal opacity-50">-</span>
                       <span className="text-ucl-blue">{derbyStats.buWins}</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-white/5 text-[11px]">
                    <span className="text-ucl-silver font-bold uppercase tracking-wider text-[9px]">Trận Hòa</span>
                    <span className="font-black text-xs text-white">{derbyStats.draws}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 text-[11px]">
                    <span className="text-ucl-silver font-bold uppercase tracking-wider text-[9px]">Tổng Bàn thắng</span>
                    <div className="flex items-center gap-3 font-black text-xs">
                       <span className="text-ucl-neon">{derbyStats.thinhGoals}</span>
                       <span className="text-ucl-silver font-normal opacity-50">-</span>
                       <span className="text-ucl-blue">{derbyStats.buGoals}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Decorative background split glow */}
           <div className="absolute top-0 left-0 w-1/2 h-full bg-[radial-gradient(circle_at_0%_0%,rgba(255,42,95,0.03),transparent_70%)] pointer-events-none" />
           <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,rgba(212,175,55,0.03),transparent_70%)] pointer-events-none" />
        </div>

        {/* Top 3 Podium Preview */}
        <div className="glass-card p-6 md:p-8 flex flex-col items-center justify-between relative overflow-hidden border-white/5">
           <div className="flex items-center gap-3 self-start mb-8">
              <Trophy className="text-yellow-400" size={20} />
              <h3 className="text-lg md:text-xl font-black italic tracking-widest uppercase">Bảng Xếp Hạng</h3>
           </div>
           
           <div className="flex items-end gap-2 h-60 w-full max-w-sm relative z-10 pt-6">
              {/* 2nd Place */}
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-10 h-10 rounded-xl bg-white/5 mb-3 border border-slate-400/30 flex items-center justify-center font-black text-ucl-dark shadow-lg group-hover:scale-110 transition-all overflow-hidden shrink-0">
                  <img src={getTeamLogo(standings[1]?.name)} alt={standings[1]?.name} className="w-8 h-8 object-contain" />
                </div>
                <div className="w-full bg-gradient-to-t from-slate-400/20 to-slate-400/5 border-t-2 border-slate-400 h-24 flex items-center justify-center rounded-t-xl shadow-xl">
                  <span className="text-3xl font-black text-slate-400 italic">2</span>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest truncate w-full text-center text-ucl-silver">{standings[1]?.name || '---'}</p>
              </div>
              
              {/* 1st Place */}
              <div className="flex-1 flex flex-col items-center group">
                <Trophy className="text-yellow-400 mb-2 animate-bounce" size={24} />
                <div className="w-14 h-14 rounded-xl bg-white/5 mb-3 border-2 border-yellow-400/30 flex items-center justify-center font-black text-ucl-dark shadow-[0_0_40px_rgba(250,204,21,0.2)] group-hover:scale-110 transition-all overflow-hidden shrink-0">
                  <img src={getTeamLogo(standings[0]?.name)} alt={standings[0]?.name} className="w-10 h-10 object-contain" />
                </div>
                <div className="w-full bg-gradient-to-t from-yellow-400/20 to-yellow-400/5 border-t-2 border-yellow-400 h-32 flex items-center justify-center rounded-t-xl shadow-2xl">
                  <span className="text-5xl font-black text-yellow-400 italic leading-none">1</span>
                </div>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.1em] truncate w-full text-center text-yellow-400">{standings[0]?.name || '---'}</p>
              </div>
              
              {/* 3rd Place */}
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-8 h-8 rounded-xl bg-white/5 mb-3 border border-orange-600/30 flex items-center justify-center font-black text-ucl-dark shadow-lg group-hover:scale-110 transition-all overflow-hidden shrink-0">
                  <img src={getTeamLogo(standings[2]?.name)} alt={standings[2]?.name} className="w-6 h-6 object-contain" />
                </div>
                <div className="w-full bg-gradient-to-t from-orange-600/20 to-orange-600/5 border-t-2 border-orange-600 h-18 flex items-center justify-center rounded-t-xl shadow-xl">
                  <span className="text-2xl font-black text-orange-600 italic">3</span>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest truncate w-full text-center text-ucl-silver">{standings[2]?.name || '---'}</p>
              </div>
           </div>

           {/* Decorative background */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(250,204,21,0.03),transparent_70%)] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
