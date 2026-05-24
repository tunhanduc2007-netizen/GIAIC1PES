import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserPlus, Trash2, Edit, Save, X, Search, Star, ShieldAlert } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';
import { supabase } from '../lib/supabase';

const Players = ({ players, setPlayers }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    owner: 'BU'
  });

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    const newPlayer = {
      id: Date.now().toString(),
      name: formData.name,
      team: formData.name, // In World Cup, team and name can be aligned
      owner: formData.owner || 'BU',
      matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0
    };
    
    setPlayers([...players, newPlayer]);
    setFormData({ name: '', team: '', owner: 'BU' });
    setIsAdding(false);
  };

  const handleDeletePlayer = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn loại đội tuyển này khỏi World Cup?')) {
      try {
        const { error } = await supabase.from('players').delete().eq('id', id);
        if (error) {
          console.error('Lỗi khi xóa đội tuyển khỏi Supabase:', error);
          alert('Lỗi khi xóa đội tuyển từ Cloud: ' + error.message);
          return;
        }
        setPlayers(players.filter(p => p.id !== id));
      } catch (error) {
        console.error('Lỗi xử lý xóa đội tuyển:', error);
      }
    }
  };

  const handleEdit = (player) => {
    setEditingId(player.id);
    setFormData({
      name: player.name,
      team: player.team,
      owner: player.owner || 'BU'
    });
  };

  const handleSaveEdit = () => {
    setPlayers(players.map(p => 
      p.id === editingId ? { ...p, ...formData, team: formData.name } : p
    ));
    setEditingId(null);
    setFormData({ name: '', team: '', owner: 'BU' });
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-32">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ucl-silver" size={18} />
          <input 
            type="text" 
            placeholder="Tìm đội tuyển hoặc người chơi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-ucl-neon transition-all text-sm tracking-wide font-montserrat"
          />
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="ucl-button flex items-center gap-2 self-start sm:self-center"
        >
          {isAdding ? <X size={18} /> : <UserPlus size={18} />}
          {isAdding ? "HỦY BỎ" : "THÊM ĐỘI TUYỂN"}
        </button>
      </div>

      {/* Adding Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddPlayer} className="glass-card p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end border-ucl-neon/30">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-ucl-silver font-montserrat">Tên Quốc Gia / Đội tuyển</label>
                <input 
                  autoFocus
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-ucl-neon transition-all"
                  placeholder="VD: Brazil, France..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-ucl-silver font-montserrat">Người quản lý (Owner)</label>
                <select 
                  value={formData.owner}
                  onChange={(e) => setFormData({...formData, owner: e.target.value})}
                  className="w-full bg-ucl-dark border border-white/10 rounded-xl p-3 focus:outline-none focus:border-ucl-neon transition-all text-white"
                >
                  <option value="BU">BU</option>
                  <option value="THỊNH">THỊNH</option>
                </select>
              </div>
              <div>
                <button type="submit" className="w-full ucl-button bg-ucl-neon text-white py-3.5 hover:shadow-ucl-neon/40">
                  XÁC NHẬN THÊM
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredPlayers.map((player) => {
          // Dynamic OVR rating math: starting at 78, positive win impact, negative loss impact
          const calculatedOvr = Math.min(99, Math.max(75, 78 + (player.wins * 4) + (player.draws * 1) - (player.losses * 2)));
          
          return (
            <motion.div 
              layout
              key={player.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "fut-card relative p-6 flex flex-col items-center justify-between min-h-[380px] w-full",
                editingId === player.id && "border-ucl-neon shadow-[0_0_30px_rgba(255,42,95,0.3)]"
              )}
            >
              {/* Top FUT Badge Details */}
              <div className="w-full flex items-start justify-between">
                {/* Rating OVR & Position */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none text-ucl-blue font-bebas">
                    {calculatedOvr}
                  </span>
                  <span className="text-[8px] font-black text-ucl-neon uppercase tracking-widest leading-none mt-1 font-montserrat">
                    {player.owner === 'BU' ? 'GRP A' : 'GRP B'}
                  </span>
                </div>

                {/* Manager Name Shield */}
                <div className={cn(
                  "px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest font-montserrat",
                  player.owner === 'BU' 
                    ? "bg-ucl-neon/15 border-ucl-neon/30 text-ucl-neon" 
                    : "bg-ucl-blue/15 border-ucl-blue/30 text-ucl-blue"
                )}>
                  {player.owner}
                </div>
              </div>

              {/* Central National Flag Display */}
              <div className="my-6 relative group/flag flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group-hover/flag:scale-105 group-hover/flag:border-ucl-neon transition-all duration-300">
                  <img 
                    src={getTeamLogo(player.team)} 
                    alt={player.name} 
                    className="w-16 h-16 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" 
                  />
                </div>
                {/* Visual Glow behind Flag */}
                <div className="absolute inset-0 bg-ucl-blue/10 blur-xl rounded-full -z-10 group-hover/flag:bg-ucl-neon/10 transition-colors" />
              </div>

              {/* Roster Information Text */}
              <div className="text-center w-full">
                {editingId === player.id ? (
                  <div className="space-y-2 px-2">
                    <input 
                      className="w-full bg-white/10 border border-ucl-neon/50 rounded-xl px-3 py-1.5 text-center text-sm font-bold text-white outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Tên quốc gia"
                    />
                    <select 
                      value={formData.owner}
                      onChange={(e) => setFormData({...formData, owner: e.target.value})}
                      className="w-full bg-ucl-dark border border-ucl-neon/50 rounded-xl px-3 py-1.5 text-center text-xs text-white outline-none"
                    >
                      <option value="BU">BU</option>
                      <option value="THỊNH">THỊNH</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl md:text-2xl font-black italic tracking-tight text-white uppercase font-bebas truncate max-w-full">
                      {player.name}
                    </h3>
                    <p className="text-[9px] font-bold text-ucl-silver uppercase tracking-[0.2em] mt-0.5 font-montserrat">
                      NATIONAL TEAM
                    </p>
                  </>
                )}
              </div>

              {/* FUT Stats Attribute Box */}
              <div className="w-full mt-6 bg-black/40 border border-white/5 rounded-2xl py-3 px-4 grid grid-cols-5 gap-1 text-center font-montserrat">
                <div>
                  <span className="block text-[8px] font-bold text-ucl-silver uppercase tracking-wider">PTS</span>
                  <span className="text-xs md:text-sm font-black text-ucl-blue leading-none">{player.points || 0}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-ucl-silver uppercase tracking-wider">W</span>
                  <span className="text-xs md:text-sm font-black text-white leading-none">{player.wins || 0}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-ucl-silver uppercase tracking-wider">D</span>
                  <span className="text-xs md:text-sm font-black text-white leading-none">{player.draws || 0}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-ucl-silver uppercase tracking-wider">L</span>
                  <span className="text-xs md:text-sm font-black text-white leading-none">{player.losses || 0}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-ucl-silver uppercase tracking-wider">GD</span>
                  <span className={cn(
                    "text-xs md:text-sm font-black leading-none",
                    player.gd > 0 ? "text-green-400" : player.gd < 0 ? "text-red-400" : "text-white"
                  )}>
                    {player.gd > 0 ? `+${player.gd}` : player.gd || 0}
                  </span>
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                {editingId === player.id ? (
                  <>
                    <button 
                      onClick={handleSaveEdit} 
                      className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg"
                      title="Lưu chỉnh sửa"
                    >
                      <Save size={14} />
                    </button>
                    <button 
                      onClick={() => setEditingId(null)} 
                      className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors shadow-lg"
                      title="Hủy bỏ"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleEdit(player)} 
                      className="p-2 bg-black/40 border border-white/10 text-ucl-silver rounded-xl hover:bg-ucl-neon hover:text-white transition-all shadow-lg"
                      title="Chỉnh sửa đội"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeletePlayer(player.id)} 
                      className="p-2 bg-black/40 border border-white/10 text-ucl-silver rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      title="Xóa đội"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {filteredPlayers.length === 0 && (
        <div className="text-center py-24 glass-card">
           <ShieldAlert className="mx-auto text-ucl-silver opacity-20 mb-4" size={64} />
           <p className="text-ucl-silver italic font-montserrat text-sm uppercase tracking-widest">Không tìm thấy đội tuyển nào.</p>
        </div>
      )}
    </div>
  );
};

export default Players;
