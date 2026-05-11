import React from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2, ShieldAlert, FileJson, CheckCircle2, RotateCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const BackupRestore = ({ players, matches, tourneyMatches, customTables, setPlayers, setMatches, setTourneyMatches, setCustomTables }) => {
  
  const handleExport = () => {
    const data = {
      players,
      matches,
      tourneyMatches,
      customTables,
      exportDate: new Date().toISOString(),
      version: 'v8'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pes_ucl_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (confirm('Dữ liệu hiện tại sẽ bị ghi đè. Bạn có chắc chắn muốn tiếp tục?')) {
          if (data.players) setPlayers(data.players);
          if (data.matches) setMatches(data.matches);
          if (data.tourneyMatches) setTourneyMatches(data.tourneyMatches);
          if (data.customTables) setCustomTables(data.customTables);
          
          alert('Khôi phục dữ liệu thành công!');
          window.location.reload(); 
        }
      } catch (error) {
        alert('Tệp tin không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  const handleForceSync = async () => {
    try {
      alert('Đang tải lại dữ liệu từ Cloud...');
      window.location.reload();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleClearMatches = async () => {
    if (window.confirm('BẠN CÓ CHẮC CHẮN MUỐN XÓA TẤT CẢ TRẬN ĐẤU TRÊN CLOUD? Hành động này sẽ làm sạch lịch sử đấu để nạp lại dữ liệu mới.')) {
      try {
        const { error } = await supabase.from('matches').delete().neq('id', '0');
        if (error) throw error;
        
        setMatches([]);
        alert('Đã xóa sạch trận đấu trên Cloud! Trang web sẽ tải lại để nhận dữ liệu mới.');
        window.location.reload();
      } catch (error) {
        alert('Lỗi khi xóa dữ liệu: ' + error.message);
      }
    }
  };

  const handleReset = () => {
    if (confirm('CẢNH BÁO: Tất cả dữ liệu sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác!')) {
      if (confirm('Xác nhận xóa toàn bộ dữ liệu một lần nữa?')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-ucl-neon/20 rounded-3xl border border-ucl-neon/40 flex items-center justify-center mx-auto mb-6">
          <FileJson className="text-ucl-neon" size={40} />
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">QUẢN LÝ <span className="text-ucl-neon">DỮ LIỆU</span></h2>
        <p className="text-ucl-silver text-sm max-w-lg mx-auto">
          Công cụ sao lưu, khôi phục và dọn dẹp dữ liệu giải đấu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cloud Sync Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-8 border-ucl-neon/20 shadow-[0_0_50px_rgba(0,242,255,0.1)] md:col-span-2"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-ucl-neon/20 rounded-2xl border border-ucl-neon/40 text-ucl-neon">
              <RotateCw className="animate-spin-slow" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">ĐỒNG BỘ <span className="text-ucl-neon">CLOUD</span></h2>
              <p className="text-ucl-silver text-xs font-bold uppercase tracking-widest mt-1">Supabase Real-time Database</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleForceSync}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-ucl-neon text-ucl-dark font-black rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)]"
            >
              <RotateCw size={20} /> LÀM MỚI TỪ CLOUD
            </button>
            <button 
              onClick={handleClearMatches}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-red-500/20 border border-red-500/40 text-red-500 font-black rounded-xl hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={20} /> XÓA TẤT CẢ TRẬN ĐẤU
            </button>
          </div>
          <p className="text-[10px] text-ucl-silver italic text-center mt-4">Sử dụng nút "Xóa tất cả" nếu bạn muốn reset lịch sử đấu để nhập lại từ đầu.</p>
        </motion.div>

        {/* Export Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-8 border-white/5 space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/40 text-blue-500">
              <Download size={24} />
            </div>
            <div>
              <h3 className="font-black italic uppercase tracking-widest text-lg">Xuất Dữ Liệu</h3>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="w-full bg-blue-500/20 border border-blue-500/40 text-blue-500 font-black uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-blue-500 hover:text-white transition-all"
          >
            <Download size={18} /> Tải Xuống JSON
          </button>
        </motion.div>

        {/* Import Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-8 border-white/5 space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/40 text-purple-500">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="font-black italic uppercase tracking-widest text-lg">Khôi Phục</h3>
            </div>
          </div>
          <div className="relative">
            <input 
              type="file" 
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="w-full bg-purple-500/20 border border-purple-500/40 text-purple-500 font-black uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-purple-500 hover:text-white transition-all">
              <Upload size={18} /> Chọn Tệp Tin
            </button>
          </div>
        </motion.div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-8 border-red-500/20 space-y-6 mt-12">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
            <ShieldAlert size={20} />
          </div>
          <h3 className="font-black italic uppercase tracking-widest text-red-500">Khu Vực Nguy Hiểm</h3>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
          <div>
            <p className="font-bold text-white text-sm">Reset toàn bộ ứng dụng</p>
            <p className="text-ucl-silver text-xs mt-1">Xóa sạch tất cả dữ liệu local.</p>
          </div>
          <button 
            onClick={handleReset}
            className="px-6 py-3 bg-red-500/20 text-red-500 rounded-xl font-black uppercase tracking-widest text-[10px] border border-red-500/40 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 size={14} className="inline mr-2" /> Reset Local
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
