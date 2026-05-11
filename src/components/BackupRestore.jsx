import React from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2, ShieldAlert, FileJson, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

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
          window.location.reload(); // Reload to ensure all components refresh with new state
        }
      } catch (error) {
        alert('Tệp tin không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('CẢNH BÁO: Tất cả dữ liệu (Cầu thủ, Kết quả, Lịch sử...) sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác!')) {
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
          Hiện tại dữ liệu được lưu trữ trực tiếp trên trình duyệt của bạn. Để chuyển dữ liệu từ <b>localhost</b> lên <b>Netlify</b>, hãy Xuất dữ liệu từ máy cục bộ và Nhập vào trang web đã deploy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-8 border-ucl-neon/20 space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/40 text-blue-500">
              <Download size={24} />
            </div>
            <div>
              <h3 className="font-black italic uppercase tracking-widest text-lg">Xuất Dữ Liệu</h3>
              <p className="text-[10px] text-ucl-silver font-bold uppercase">Lưu file dự phòng (JSON)</p>
            </div>
          </div>
          <p className="text-xs text-ucl-silver leading-relaxed">
            Tải xuống toàn bộ dữ liệu hiện tại (Cầu thủ, Trận đấu, Cặp đấu, Bảng tùy chỉnh) thành một tệp tin .json.
          </p>
          <button 
            onClick={handleExport}
            className="w-full ucl-button flex items-center justify-center gap-3 py-4"
          >
            <Download size={18} /> Tải Xuống Ngay
          </button>
        </motion.div>

        {/* Import Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-8 border-purple-500/20 space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/40 text-purple-500">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="font-black italic uppercase tracking-widest text-lg">Khôi Phục</h3>
              <p className="text-[10px] text-ucl-silver font-bold uppercase">Nhập từ file backup</p>
            </div>
          </div>
          <p className="text-xs text-ucl-silver leading-relaxed">
            Chọn tệp tin .json đã tải về từ localhost để khôi phục dữ liệu lên phiên bản Netlify.
          </p>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
          <div>
            <p className="font-bold text-white text-sm">Xóa toàn bộ dữ liệu</p>
            <p className="text-ucl-silver text-xs mt-1">Làm mới hoàn toàn ứng dụng về trạng thái ban đầu.</p>
          </div>
          <button 
            onClick={handleReset}
            className="px-6 py-3 bg-red-500/20 text-red-500 rounded-xl font-black uppercase tracking-widest text-[10px] border border-red-500/40 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 size={14} className="inline mr-2" /> Reset Dữ Liệu
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-ucl-neon/10 rounded-xl border border-ucl-neon/20">
         <CheckCircle2 className="text-ucl-neon shrink-0" size={20} />
         <p className="text-[10px] text-ucl-neon font-bold uppercase tracking-wider">Mẹo: Bạn nên xuất dữ liệu sau mỗi buổi thi đấu để tránh mất mát dữ liệu.</p>
      </div>
    </div>
  );
};

export default BackupRestore;
