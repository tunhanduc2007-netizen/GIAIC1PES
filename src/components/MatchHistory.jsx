import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sword, Clock, Award, Shield, ChevronRight, Search, Trash2, Edit2, Save, X } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';

const MatchHistory = ({ matches, setMatches, players }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa trận đấu này khỏi lịch sử không? Hành động này không thể hoàn tác.')) {
      setMatches(prev => prev.filter(m => m.id !== id));
    }
  };

  const startEdit = (match) => {
    setEditingId(match.id);
    setEditValues({ ...match });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSave = () => {
    setMatches(prev => prev.map(m => m.id === editingId ? editValues : m));
    setEditingId(null);
    setEditValues({});
  };

  const handleChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-ucl-neon/20 rounded-2xl border border-ucl-neon/40">
             <Clock className="text-ucl-neon" size={28} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">LỊCH SỬ <span className="text-ucl-neon">TRẬN ĐẤU</span></h2>
            <p className="text-ucl-silver text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Toàn bộ kết quả FIFA World Cup</p>
          </div>
        </div>
      </div>

      {/* History Table Container */}
      <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
        <div className="table-responsive">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full">
            <thead>
              <tr className="bg-ucl-neon/10 border-b border-white/10">
                <th className="px-4 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-ucl-neon text-center w-12">STT</th>
                <th className="px-4 md:px-6 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-ucl-neon">Thời gian</th>
                <th className="px-4 md:px-6 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-ucl-neon">Trận đấu</th>
                <th className="px-4 md:px-6 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-ucl-neon text-center">Tỉ số</th>
                <th className="px-4 md:px-6 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-ucl-neon">Ghi bàn</th>
                <th className="px-4 md:px-6 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-ucl-neon">Thẻ phạt</th>
                <th className="px-4 md:px-6 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-ucl-neon text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {matches.slice().reverse().map((match, i) => {
                const isEditing = editingId === match.id;
                const pA = players.find(p => String(p.id) === String(match.playerAId));
                const pB = players.find(p => String(p.id) === String(match.playerBId));
                
                return (
                  <motion.tr 
                    key={match.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "transition-colors group",
                      isEditing ? "bg-ucl-neon/5" : "hover:bg-white/[0.02]"
                    )}
                  >
                    <td className="px-4 py-4 md:py-6 text-center">
                       <span className="text-[10px] md:text-xs font-black text-ucl-silver/50">{matches.length - i}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[10px] md:text-xs font-bold text-white">{new Date(match.date).toLocaleDateString()}</span>
                        <span className="text-[8px] md:text-[10px] text-ucl-silver">{new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6">
                      {isEditing ? (
                        <div className="flex flex-col gap-1 min-w-[120px]">
                           <input className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-ucl-neon" value={editValues.teamA || ''} onChange={(e) => handleChange('teamA', e.target.value)} />
                           <input className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-ucl-blue" value={editValues.teamB || ''} onChange={(e) => handleChange('teamB', e.target.value)} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 md:gap-4 min-w-[180px]">
                          <div className="flex flex-col items-end flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs md:text-sm font-black italic tracking-tight truncate max-w-[80px] md:max-w-none">{pA?.name || match.teamA}</span>
                              <img src={getTeamLogo(pA?.name || match.teamA)} className="w-5 h-5 object-contain" alt="logo" />
                            </div>
                            <span className="text-[8px] text-ucl-silver font-bold uppercase tracking-tighter">{pA?.owner || 'N/A'}</span>
                          </div>
                          <div className="text-[8px] font-black text-ucl-neon opacity-30">VS</div>
                          <div className="flex flex-col items-start flex-1">
                            <div className="flex items-center gap-2">
                              <img src={getTeamLogo(pB?.name || match.teamB)} className="w-5 h-5 object-contain" alt="logo" />
                              <span className="text-xs md:text-sm font-black italic tracking-tight truncate max-w-[80px] md:max-w-none">{pB?.name || match.teamB}</span>
                            </div>
                            <span className="text-[8px] text-ucl-silver font-bold uppercase tracking-tighter">{pB?.owner || 'N/A'}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                           <input type="number" className="w-8 h-8 md:w-10 md:h-10 bg-white/10 border border-white/20 rounded-lg text-center font-black text-xs outline-none" value={editValues.scoreA} onChange={(e) => handleChange('scoreA', e.target.value)} />
                           <input type="number" className="w-8 h-8 md:w-10 md:h-10 bg-white/10 border border-white/20 rounded-lg text-center font-black text-xs outline-none" value={editValues.scoreB} onChange={(e) => handleChange('scoreB', e.target.value)} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white/5 rounded-xl border border-white/10 group-hover:border-ucl-neon transition-all">
                            <span className="text-sm md:text-xl font-black italic tracking-tighter leading-none">{match.scoreA} - {match.scoreB}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6 max-w-[150px] md:max-w-xs">
                       {isEditing ? (
                         <div className="space-y-1">
                            <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[8px] text-white outline-none" value={editValues.scorersA || ''} onChange={(e) => handleChange('scorersA', e.target.value)} />
                            <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[8px] text-white outline-none" value={editValues.scorersB || ''} onChange={(e) => handleChange('scorersB', e.target.value)} />
                         </div>
                       ) : (
                        <div className="space-y-1">
                          {match.scorersA && <p className="text-[8px] md:text-[10px] text-ucl-silver truncate"><span className="text-ucl-neon font-bold">{pA?.name || match.teamA}:</span> {match.scorersA}</p>}
                          {match.scorersB && <p className="text-[8px] md:text-[10px] text-ucl-silver truncate"><span className="text-ucl-star font-bold">{pB?.name || match.teamB}:</span> {match.scorersB}</p>}
                        </div>
                       )}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6">
                       {isEditing ? (
                          <div className="grid grid-cols-2 gap-1 min-w-[140px]">
                             <input placeholder="Thẻ vàng A" title="Thẻ vàng Đội A" className="bg-white/5 border border-white/10 rounded p-1 text-[8px] text-yellow-400" value={editValues.yellowA || ''} onChange={(e) => handleChange('yellowA', e.target.value)} />
                             <input placeholder="Thẻ đỏ A" title="Thẻ đỏ Đội A" className="bg-white/5 border border-white/10 rounded p-1 text-[8px] text-red-500" value={editValues.redA || ''} onChange={(e) => handleChange('redA', e.target.value)} />
                             <input placeholder="Thẻ vàng B" title="Thẻ vàng Đội B" className="bg-white/5 border border-white/10 rounded p-1 text-[8px] text-yellow-400" value={editValues.yellowB || ''} onChange={(e) => handleChange('yellowB', e.target.value)} />
                             <input placeholder="Thẻ đỏ B" title="Thẻ đỏ Đội B" className="bg-white/5 border border-white/10 rounded p-1 text-[8px] text-red-500" value={editValues.redB || ''} onChange={(e) => handleChange('redB', e.target.value)} />
                          </div>
                       ) : (
                          <div className="flex flex-col gap-1">
                             {match.yellowA && (
                               <div className="flex items-center gap-1">
                                 <div className="w-1.5 h-2.5 bg-yellow-400 rounded-sm" />
                                 <span className="text-[8px] text-ucl-silver">{match.yellowA}</span>
                               </div>
                             )}
                             {match.yellowB && (
                               <div className="flex items-center gap-1">
                                 <div className="w-1.5 h-2.5 bg-yellow-400 rounded-sm" />
                                 <span className="text-[8px] text-ucl-silver">{match.yellowB}</span>
                               </div>
                             )}
                             {match.redA && (
                               <div className="flex items-center gap-1">
                                 <div className="w-1.5 h-2.5 bg-red-500 rounded-sm" />
                                 <span className="text-[8px] text-ucl-silver">{match.redA}</span>
                               </div>
                             )}
                             {match.redB && (
                               <div className="flex items-center gap-1">
                                 <div className="w-1.5 h-2.5 bg-red-500 rounded-sm" />
                                 <span className="text-[8px] text-ucl-silver">{match.redB}</span>
                               </div>
                             )}
                          </div>
                       )}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6 text-right">
                       {isEditing ? (
                         <div className="flex items-center justify-end gap-1 md:gap-2">
                            <button onClick={handleSave} className="p-1.5 md:p-2 bg-green-500 text-white rounded-lg"><Save size={12} /></button>
                            <button onClick={cancelEdit} className="p-1.5 md:p-2 bg-white/10 text-white rounded-lg"><X size={12} /></button>
                         </div>
                       ) : (
                        <div className="flex items-center justify-end gap-1 md:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => startEdit(match)} className="p-1.5 md:p-2 bg-white/5 hover:bg-ucl-neon hover:text-ucl-dark rounded-lg"><Edit2 size={12} /></button>
                          <button onClick={() => handleDelete(match.id)} className="p-1.5 md:p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-lg"><Trash2 size={12} /></button>
                        </div>
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

export default MatchHistory;
