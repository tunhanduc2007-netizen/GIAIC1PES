import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Shield, Medal, Award, ChevronUp } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';

const GroupStage = ({ players = [] }) => {
  // Chia đội thành 12 bảng (A-L), mỗi bảng 4 đội
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

  const getTeamStats = (teamName) => {
    // Tìm kiếm thống kê từ danh sách người chơi/đội tuyển đã tính toán điểm từ lịch sử
    const found = players.find(p => p.name.trim().toLowerCase() === teamName.trim().toLowerCase());
    return found || {
      name: teamName,
      owner: 'Chưa rõ',
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0
    };
  };

  const GroupTable = ({ groupName, teams }) => {
    // Lấy thông tin thống kê và sắp xếp theo Điểm -> Hiệu số -> Bàn thắng
    const sortedTeams = teams
      .map(team => getTeamStats(team))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden flex flex-col h-full hover:border-ucl-blue/30 transition-colors border border-white/5"
      >
        {/* Group Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-ucl-neon/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ucl-neon flex items-center justify-center shadow-[0_0_15px_rgba(255,42,95,0.4)]">
              <span className="text-white font-black text-sm font-bebas">{groupName}</span>
            </div>
            <h3 className="text-base md:text-lg font-black uppercase text-white italic tracking-tighter font-bebas">BẢNG {groupName}</h3>
          </div>
          <span className="text-[9px] font-bold text-ucl-silver uppercase tracking-wider font-montserrat">Vòng bảng</span>
        </div>

        {/* Table representation */}
        <div className="table-responsive flex-1">
          <table className="w-full text-left border-collapse text-[11px] font-montserrat">
            <thead>
              <tr className="bg-ucl-blue/10 text-ucl-silver text-[9px] uppercase tracking-wider font-bold border-b border-white/5">
                <th className="py-3 px-3 text-center w-10">Hạng</th>
                <th className="py-3 px-2">Đội tuyển</th>
                <th className="py-3 px-2 text-center w-6">T</th>
                <th className="py-3 px-2 text-center w-6 text-green-400">W</th>
                <th className="py-3 px-2 text-center w-6 text-yellow-400">D</th>
                <th className="py-3 px-2 text-center w-6 text-red-400">L</th>
                <th className="py-3 px-2 text-center w-8">HS</th>
                <th className="py-3 px-2 text-center w-16">Phong độ</th>
                <th className="py-3 px-3 text-center w-10 bg-ucl-neon/5 text-ucl-neon font-black">Điểm</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, idx) => {
                const isTop2 = idx < 2; // Suất đi tiếp
                return (
                  <tr 
                    key={team.name} 
                    className={cn(
                      "border-b border-white/5 hover:bg-white/5 transition-colors group",
                      isTop2 ? "bg-green-500/5 font-bold" : "opacity-80"
                    )}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center">
                      <span className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] mx-auto font-bold font-bebas",
                        idx === 0 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                        idx === 1 ? "bg-slate-400/20 text-slate-300 border border-slate-400/30" :
                        "bg-white/5 text-ucl-silver"
                      )}>
                        {idx + 1}
                      </span>
                    </td>

                    {/* Team Name & logo */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shrink-0 overflow-hidden group-hover:scale-110 transition-transform">
                          <img src={getTeamLogo(team.name)} alt={team.name} className="w-4 h-4 object-contain" />
                        </div>
                        <div className="min-w-0">
                          <p className={cn("text-[11px] truncate uppercase font-bold", isTop2 ? "text-white" : "text-ucl-silver")}>
                            {team.name}
                          </p>
                          <p className="text-[7px] text-ucl-silver uppercase tracking-tighter truncate opacity-70">
                            {team.owner}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Stats columns */}
                    <td className="py-3 px-2 text-center text-ucl-silver">{team.matches}</td>
                    <td className="py-3 px-2 text-center font-bold text-green-400/80">{team.wins}</td>
                    <td className="py-3 px-2 text-center font-bold text-yellow-400/80">{team.draws}</td>
                    <td className="py-3 px-2 text-center font-bold text-red-400/80">{team.losses}</td>
                    
                    {/* Goal difference */}
                    <td className="py-3 px-2 text-center">
                      <span className={cn(
                        "font-semibold",
                        team.gd > 0 ? "text-ucl-neon" : team.gd < 0 ? "text-red-400" : "text-ucl-silver"
                      )}>
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </span>
                    </td>

                    {/* Team Form */}
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {team.form && team.form.length > 0 ? (
                          team.form.map((f, i) => (
                            <span 
                              key={i} 
                              className={cn(
                                "w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-black text-white shrink-0 shadow-sm",
                                f === 'W' ? "bg-green-500 shadow-green-500/10" :
                                f === 'D' ? "bg-yellow-500 shadow-yellow-500/10 text-ucl-dark" :
                                "bg-red-500 shadow-red-500/10"
                              )}
                              title={f === 'W' ? 'Thắng' : f === 'D' ? 'Hòa' : 'Thua'}
                            >
                              {f}
                            </span>
                          ))
                        ) : (
                          <span className="text-[7px] text-ucl-silver opacity-30 font-bold uppercase">Mới</span>
                        )}
                      </div>
                    </td>

                    {/* Points column highlighted */}
                    <td className="py-3 px-3 text-center bg-ucl-neon/5">
                      <span className="text-[12px] font-black italic text-ucl-neon font-bebas tracking-tighter">
                        {team.points}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Qualification notice at the bottom of each group */}
        <div className="px-4 py-2 border-t border-white/5 bg-black/10 flex items-center justify-center text-[8px] text-ucl-silver uppercase tracking-wider font-montserrat">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Top 2 đội dẫn đầu sẽ đi tiếp
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-ucl-neon/20 border border-ucl-neon/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,42,95,0.2)]">
            <Users className="text-ucl-neon" size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white font-bebas">
              VÒNG BẢNG <span className="text-ucl-neon">FIFA WORLD CUP</span>
            </h2>
            <p className="text-ucl-silver text-xs font-bold uppercase tracking-[0.2em] mt-1 font-montserrat">
              12 BẢNG ĐẤU CHÍNH THỨC • ĐỒNG BỘ ĐIỂM SỐ THỰC TẾ TỪ LỊCH SỬ ĐẤU
            </p>
          </div>
        </div>
        
        {/* Quick Rule Info */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-[10px] text-ucl-silver uppercase tracking-wider font-montserrat">
          <Trophy size={14} className="text-yellow-500 animate-bounce" />
          <span>Lọc & Sắp xếp tự động theo luật FIFA</span>
        </div>
      </div>

      {/* Grid of 12 Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groups).map(([groupName, teams]) => (
          <GroupTable key={groupName} groupName={groupName} teams={teams} />
        ))}
      </div>
    </div>
  );
};

export default GroupStage;
