import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, ChevronUp, ChevronDown, Minus, Flame, ShieldAlert } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';

const Standings = ({ standings = [], topScorers = [], topCards = [] }) => {
  const [showAllScorers, setShowAllScorers] = React.useState(false);
  const [showAllCards, setShowAllCards] = React.useState(false);

  const displayedScorers = showAllScorers ? topScorers : topScorers.slice(0, 5);
  const displayedCards = showAllCards ? topCards : topCards.slice(0, 5);

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="text-ucl-neon shrink-0" size={24} />
          <h3 className="text-base md:text-xl font-bold italic tracking-tighter uppercase font-bebas">BẢNG XẾP HẠNG <span className="text-ucl-neon font-bebas">FIFA WORLD CUP</span></h3>
        </div>
        <div className="flex items-center gap-4 text-[8px] md:text-xs font-bold text-ucl-silver uppercase tracking-widest font-montserrat">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Thắng +3đ</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Hòa +1đ</span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full font-montserrat">
          <thead>
            <tr className="bg-ucl-blue/20 text-ucl-silver text-[10px] md:text-xs uppercase tracking-widest font-bold">
              <th className="px-4 md:px-6 py-4">Hạng</th>
              <th className="px-4 md:px-6 py-4">Đội tuyển quốc gia</th>
              <th className="px-2 md:px-4 py-4 text-center">T</th>
              <th className="px-2 md:px-4 py-4 text-center text-green-400">W</th>
              <th className="px-2 md:px-4 py-4 text-center text-yellow-400">D</th>
              <th className="px-2 md:px-4 py-4 text-center text-red-400">L</th>
              <th className="px-2 md:px-4 py-4 text-center">HS</th>
              <th className="px-2 md:px-4 py-4 text-center w-28">Phong độ</th>
              <th className="px-4 md:px-6 py-4 text-center bg-ucl-neon/10 text-ucl-neon">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((player, index) => {
              const isTop3 = index < 3;
              
              return (
                <motion.tr 
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "border-b border-white/5 hover:bg-white/5 transition-colors group",
                    index === 0 && "bg-ucl-neon/5",
                    isTop3 && "font-bold"
                  )}
                >
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-sm shrink-0",
                        index === 0 ? "bg-yellow-400 text-ucl-dark font-black font-bebas" :
                        index === 1 ? "bg-slate-400 text-ucl-dark font-black font-bebas" :
                        index === 2 ? "bg-orange-600 text-ucl-dark font-black font-bebas" :
                        "bg-white/10 text-ucl-silver font-bebas"
                      )}>
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center text-[8px] md:text-xs font-bold border border-white/10 shrink-0 shadow-lg group-hover:scale-110 transition-transform overflow-hidden">
                        <img src={getTeamLogo(player.name)} alt={player.name} className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-xs md:text-sm truncate uppercase", isTop3 ? "text-white font-black italic" : "text-ucl-silver font-bold")}>{player.name}</p>
                        <p className="text-[8px] md:text-[10px] text-ucl-silver uppercase tracking-tighter truncate font-montserrat">
                           Manager: <span className="text-ucl-neon font-bold">{player.owner}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 md:px-4 py-4 text-center text-[10px] md:text-sm font-bold">{player.matches}</td>
                  <td className="px-2 md:px-4 py-4 text-center text-[10px] md:text-sm text-green-400 font-bold">{player.wins}</td>
                  <td className="px-2 md:px-4 py-4 text-center text-[10px] md:text-sm text-yellow-400 font-bold">{player.draws}</td>
                  <td className="px-2 md:px-4 py-4 text-center text-[10px] md:text-sm text-red-400 font-bold">{player.losses}</td>
                  <td className="px-2 md:px-4 py-4 text-center text-[10px] md:text-sm">
                    <span className={cn(player.gd > 0 ? "text-ucl-neon font-bold" : player.gd < 0 ? "text-red-400 font-bold" : "text-ucl-silver")}>
                      {player.gd > 0 ? `+${player.gd}` : player.gd}
                    </span>
                  </td>
                  <td className="px-2 md:px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {player.form && player.form.length > 0 ? (
                        player.form.map((f, i) => (
                          <span 
                            key={i} 
                            className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-sm",
                              f === 'W' ? "bg-green-500 shadow-green-500/20" :
                              f === 'D' ? "bg-yellow-500 shadow-yellow-500/20 text-ucl-dark" :
                              "bg-red-500 shadow-red-500/20"
                            )}
                            title={f === 'W' ? 'Thắng' : f === 'D' ? 'Hòa' : 'Thua'}
                          >
                            {f}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-ucl-silver opacity-30 font-bold uppercase tracking-wider">Mới</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center bg-ucl-neon/5">
                    <span className="text-base md:text-xl font-black italic text-ucl-neon tracking-tighter leading-none font-bebas">{player.points}</span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {standings.length === 0 && (
          <div className="text-center py-20 bg-white/5">
             <Trophy className="mx-auto text-ucl-blue opacity-20 mb-4" size={64} />
             <p className="text-ucl-silver italic font-montserrat">Chưa có dữ liệu xếp hạng. Hãy thêm người chơi và kết quả trận đấu.</p>
          </div>
        )}
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8 px-4 md:px-0">
        {/* Top Scorers */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex flex-col font-montserrat">
          <div className="p-3 md:p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-ucl-neon animate-pulse" />
              <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">Vua Phá Lưới</h3>
            </div>
            {topScorers.length > 5 && (
              <button 
                onClick={() => setShowAllScorers(!showAllScorers)}
                className="text-[8px] md:text-[10px] font-black text-ucl-neon uppercase hover:underline"
              >
                {showAllScorers ? 'Thu gọn' : 'Xem tất cả'}
              </button>
            )}
          </div>
          <div className="p-2 flex-1">
            {displayedScorers.length > 0 ? displayedScorers.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 md:p-3 hover:bg-white/5 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-[8px] md:text-[10px] font-black text-ucl-silver w-4">{idx + 1}</span>
                  <span className="text-xs md:text-sm font-medium text-white group-hover:text-ucl-neon transition-colors truncate max-w-[140px] md:max-w-none">{s.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs md:text-sm font-black italic text-ucl-neon">{s.goals}</span>
                  <span className="text-[8px] md:text-[10px] text-ucl-silver uppercase font-bold ml-1">Goals</span>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-ucl-silver text-[8px] md:text-[10px] italic uppercase tracking-widest">
                Chưa có bàn thắng
              </div>
            )}
          </div>
        </div>

        {/* Discipline (Cards) */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex flex-col font-montserrat">
          <div className="p-3 md:p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-yellow-400" />
              <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">Kỷ Luật</h3>
            </div>
            {topCards.length > 5 && (
              <button 
                onClick={() => setShowAllCards(!showAllCards)}
                className="text-[8px] md:text-[10px] font-black text-ucl-neon uppercase hover:underline"
              >
                {showAllCards ? 'Thu gọn' : 'Xem tất cả'}
              </button>
            )}
          </div>
          <div className="p-2 flex-1">
            {displayedCards.length > 0 ? displayedCards.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 md:p-3 hover:bg-white/5 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-[8px] md:text-[10px] font-black text-ucl-silver w-4">{idx + 1}</span>
                  <span className="text-xs md:text-sm font-medium text-white group-hover:text-yellow-400 transition-colors truncate max-w-[140px] md:max-w-none">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {s.yellow > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-2.5 bg-yellow-400 rounded-sm" />
                      <span className="text-xs font-black italic text-yellow-400">{s.yellow}</span>
                    </div>
                  )}
                  {s.red > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-2.5 bg-red-500 rounded-sm" />
                      <span className="text-xs font-black italic text-red-500">{s.red}</span>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-ucl-silver text-[8px] md:text-[10px] italic uppercase tracking-widest">
                Chưa có thẻ phạt
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-white/5 text-[10px] text-ucl-silver flex items-center justify-center gap-6 uppercase tracking-widest mt-8 font-montserrat">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-ucl-neon" /> FIFA World Cup Tournament 2026</div>
      </div>
    </div>
  );
};

export default Standings;
