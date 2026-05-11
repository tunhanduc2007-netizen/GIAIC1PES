import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserPlus, Trash2, Edit, Save, X, Search, Camera } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';

const Players = ({ players, setPlayers }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    avatar: ''
  });

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    const newPlayer = {
      id: Date.now().toString(),
      name: formData.name,
      team: formData.team || 'PES United',
      avatar: formData.avatar,
      matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0
    };
    
    setPlayers([...players, newPlayer]);
    setFormData({ name: '', team: '', avatar: '' });
    setIsAdding(false);
  };

  const handleDeletePlayer = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa người chơi này?')) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const handleEdit = (player) => {
    setEditingId(player.id);
    setFormData({
      name: player.name,
      team: player.team,
      avatar: player.avatar || ''
    });
  };

  const handleSaveEdit = () => {
    setPlayers(players.map(p => 
      p.id === editingId ? { ...p, ...formData } : p
    ));
    setEditingId(null);
    setFormData({ name: '', team: '', avatar: '' });
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ucl-silver" size={18} />
          <input 
            type="text" 
            placeholder="Tìm tên Đội..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-ucl-neon transition-all"
          />
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="ucl-button flex items-center gap-2"
        >
          {isAdding ? <X size={20} /> : <UserPlus size={20} />}
          {isAdding ? "Hủy" : "Thêm Đội"}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddPlayer} className="glass-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end border-ucl-neon/30">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ucl-silver">Tên Đội</label>
                <input 
                  autoFocus
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-ucl-neon transition-all"
                  placeholder="VD: Real Madrid"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ucl-silver">Đội bóng yêu thích</label>
                <input 
                  type="text" 
                  value={formData.team}
                  onChange={(e) => setFormData({...formData, team: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-ucl-neon transition-all"
                  placeholder="VD: Real Madrid"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 ucl-button bg-ucl-neon text-ucl-dark hover:bg-white border-none py-3">
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map((player) => (
          <motion.div 
            layout
            key={player.id}
            className={cn(
              "glass-card p-6 flex items-center gap-4 group hover:neon-border transition-all duration-300",
              editingId === player.id && "neon-border"
            )}
          >
            <div className="relative group/avatar">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-black border border-white/10 group-hover:border-ucl-neon transition-all overflow-hidden">
                <img src={getTeamLogo(player.team)} alt={player.name} className="w-10 h-10 object-contain" />
              </div>
              <button className="absolute -right-1 -bottom-1 bg-ucl-neon text-ucl-dark p-1 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                <Camera size={12} />
              </button>
            </div>

            <div className="flex-1">
              {editingId === player.id ? (
                <div className="space-y-2">
                  <input 
                    className="w-full bg-white/10 border border-ucl-neon/50 rounded p-1 text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    className="w-full bg-white/10 border border-ucl-neon/50 rounded p-1 text-xs"
                    value={formData.team}
                    onChange={(e) => setFormData({...formData, team: e.target.value})}
                  />
                </div>
              ) : (
                <>
                  <h4 className="font-bold text-lg group-hover:text-ucl-neon transition-colors">{player.name}</h4>
                  <p className="text-xs text-ucl-silver uppercase tracking-widest">{player.team}</p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {editingId === player.id ? (
                <>
                  <button onClick={handleSaveEdit} className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors">
                    <Save size={16} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEdit(player)} className="p-2 bg-white/5 text-ucl-silver rounded-lg hover:bg-ucl-neon hover:text-ucl-dark transition-all">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeletePlayer(player.id)} className="p-2 bg-white/5 text-ucl-silver rounded-lg hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredPlayers.length === 0 && (
        <div className="text-center py-20 glass-card">
           <Users className="mx-auto text-ucl-blue opacity-20 mb-4" size={64} />
           <p className="text-ucl-silver italic">Không tìm thấy người chơi nào.</p>
        </div>
      )}
    </div>
  );
};

export default Players;
