import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Sword, TrendingUp, DollarSign, Target, Activity, Zap, Star } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, color, delay, subValue }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-4 md:p-8 flex items-center gap-4 md:gap-6 overflow-hidden relative group hover:border-ucl-neon/40 transition-all"
  >
    <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center bg-opacity-20 shadow-lg shrink-0", color)}>
      <Icon className={cn("transition-all", color.replace('bg-', 'text-').replace('bg-opacity-20', ''), "w-6 h-6 md:w-8 md:h-8")} />
    </div>
    <div>
      <p className="text-ucl-silver text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-xl md:text-3xl font-black mt-1 italic tracking-tighter">{value}</h3>
      {subValue && <p className="text-[8px] md:text-[10px] text-ucl-neon font-bold uppercase mt-1">{subValue}</p>}
    </div>
    <div className={cn("absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity", color)}>
      <Icon size={120} />
    </div>
  </motion.div>
);

const Dashboard = ({ players, matches, standings, topScorers = [], onViewAllMatches }) => {
  const totalMatches = matches.length;
  const topPlayer = standings[0];
  const topWinner = standings.reduce((prev, current) => (prev.wins > current.wins) ? prev : current, { wins: 0, name: 'N/A' });
  const topGoalScorer = topScorers[0];

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      {/* Hero Section */}
      <div className="relative rounded-[2rem] overflow-hidden min-h-[240px] md:min-h-[300px] flex items-center px-6 md:px-12 bg-ucl-gradient border border-white/10 shadow-2xl">
        <div className="relative z-10 space-y-4 md:space-y-6 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1 bg-ucl-neon/20 border border-ucl-neon/40 rounded-full w-fit"
          >
            <Zap size={12} className="text-ucl-neon fill-ucl-neon" />
            <span className="text-ucl-neon text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Champions League Session 2024</span>
          </motion.div>
          
          <div className="space-y-1 md:space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="responsive-title"
            >
              UCL <span className="text-ucl-neon">PES 2021</span><br/>
              <span className="text-white">MANAGER</span>
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
                <span className="text-[8px] md:text-[10px] text-ucl-silver font-bold uppercase tracking-widest mt-1">Matches Played</span>
             </div>
             <div className="w-px h-8 md:h-10 bg-white/10" />
             <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-ucl-neon italic leading-none">{players.length}</span>
                <span className="text-[8px] md:text-[10px] text-ucl-silver font-bold uppercase tracking-widest mt-1">Active Teams</span>
             </div>
          </motion.div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 md:opacity-40 pointer-events-none overflow-hidden">
          <img 
            src="/logo.jpg" 
            alt="UCL Logo" 
            className="absolute -right-20 -top-20 w-[400px] h-[400px] md:w-[600px] md:h-[600px] object-contain rotate-12 drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] grayscale opacity-50" 
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,242,255,0.15),transparent_50%)]" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Vòng đấu hiện tại" 
          value="Group Stage" 
          icon={Activity} 
          color="bg-blue-500" 
          delay={0.1}
          subValue="8 Matches Left"
        />
        <StatCard 
          title="Người đứng đầu" 
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
          color="bg-ucl-neon" 
          delay={0.6}
          subValue="Grand Prize Pool"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Matches */}
        <div className="glass-card p-8 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <Sword className="text-ucl-neon" size={20} />
               <h3 className="text-xl font-black italic tracking-widest uppercase">Trận đấu gần đây</h3>
            </div>
            <button 
              onClick={onViewAllMatches}
              className="text-ucl-neon text-[10px] font-black uppercase tracking-widest hover:underline px-4 py-1.5 bg-ucl-neon/10 rounded-full border border-ucl-neon/20"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {matches.slice(-5).reverse().map((match, i) => {
              const pA = players.find(p => String(p.id) === String(match.playerAId));
              const pB = players.find(p => String(p.id) === String(match.playerBId));
              const teamAName = pA?.name || match.teamA || 'Unknown';
              const teamBName = pB?.name || match.teamB || 'Unknown';
              
              return (
                <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-ucl-neon/30 transition-all group relative overflow-hidden">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-sm font-black border border-white/10 group-hover:border-ucl-neon transition-colors shadow-lg overflow-hidden">
                      <img src={getTeamLogo(teamAName)} alt={teamAName} className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block tracking-tight">{teamAName}</span>
                      <span className="text-[10px] text-ucl-silver font-black uppercase tracking-tighter">{pA?.owner || '---'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center px-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-black italic tracking-tighter">{match.scoreA}</span>
                      <div className="w-2 h-2 rounded-full bg-ucl-neon/30" />
                      <span className="text-3xl font-black italic tracking-tighter">{match.scoreB}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="text-right">
                      <span className="font-bold text-sm block tracking-tight">{teamBName}</span>
                      <span className="text-[10px] text-ucl-silver font-black uppercase tracking-tighter">{pB?.owner || '---'}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-sm font-black border border-white/10 group-hover:border-ucl-neon transition-colors shadow-lg overflow-hidden">
                      <img src={getTeamLogo(teamBName)} alt={teamBName} className="w-8 h-8 object-contain" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 3 Podium Preview */}
        <div className="glass-card p-8 flex flex-col items-center justify-center relative overflow-hidden border-white/5">
           <div className="flex items-center gap-3 self-start mb-12">
              <Trophy className="text-yellow-400" size={20} />
              <h3 className="text-xl font-black italic tracking-widest uppercase">Podium Bảng Xếp Hạng</h3>
           </div>
           
           <div className="flex items-end gap-2 h-64 w-full max-w-sm relative z-10">
              {/* 2nd Place */}
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 mb-3 border-2 border-slate-400/30 flex items-center justify-center font-black text-ucl-dark shadow-lg group-hover:scale-110 transition-transform overflow-hidden">
                  <img src={getTeamLogo(standings[1]?.name)} alt={standings[1]?.name} className="w-10 h-10 object-contain" />
                </div>
                <div className="w-full bg-gradient-to-t from-slate-400/20 to-slate-400/5 border-t-4 border-slate-400 h-28 flex items-center justify-center rounded-t-2xl shadow-xl">
                  <span className="text-4xl font-black text-slate-400 italic">2</span>
                </div>
                <p className="mt-4 text-xs font-black uppercase tracking-widest truncate w-full text-center text-ucl-silver">{standings[1]?.name || '---'}</p>
              </div>
              
              {/* 1st Place */}
              <div className="flex-1 flex flex-col items-center group">
                <Trophy className="text-yellow-400 mb-3 animate-bounce" size={36} />
                <div className="w-20 h-20 rounded-2xl bg-white/5 mb-3 border-4 border-yellow-400/30 flex items-center justify-center font-black text-ucl-dark shadow-[0_0_40px_rgba(250,204,21,0.2)] group-hover:scale-110 transition-transform overflow-hidden">
                  <img src={getTeamLogo(standings[0]?.name)} alt={standings[0]?.name} className="w-14 h-14 object-contain" />
                </div>
                <div className="w-full bg-gradient-to-t from-yellow-400/20 to-yellow-400/5 border-t-4 border-yellow-400 h-40 flex items-center justify-center rounded-t-2xl shadow-2xl">
                  <span className="text-6xl font-black text-yellow-400 italic">1</span>
                </div>
                <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] truncate w-full text-center text-yellow-400">{standings[0]?.name || '---'}</p>
              </div>
              
              {/* 3rd Place */}
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 mb-3 border-2 border-orange-600/30 flex items-center justify-center font-black text-ucl-dark shadow-lg group-hover:scale-110 transition-transform overflow-hidden">
                  <img src={getTeamLogo(standings[2]?.name)} alt={standings[2]?.name} className="w-8 h-8 object-contain" />
                </div>
                <div className="w-full bg-gradient-to-t from-orange-600/20 to-orange-600/5 border-t-4 border-orange-600 h-20 flex items-center justify-center rounded-t-2xl shadow-xl">
                  <span className="text-3xl font-black text-orange-600 italic">3</span>
                </div>
                <p className="mt-4 text-xs font-black uppercase tracking-widest truncate w-full text-center text-ucl-silver">{standings[2]?.name || '---'}</p>
              </div>
           </div>

           {/* Decorative background */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(250,204,21,0.05),transparent_70%)] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
