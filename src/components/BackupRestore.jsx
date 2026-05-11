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

  const importRounds1And2 = () => {
    if (confirm('Bạn có muốn nạp dữ liệu Round 1 & 2 từ ảnh chụp màn hình không?')) {
      const round1And2 = [
        // Round 1
        { id: 'r1_1', playerAId: '1', playerBId: '2', teamA: 'Tottenham', teamB: 'Arsenal', scoreA: 4, scoreB: 4, date: '2026-05-11T10:00:01Z' },
        { id: 'r1_2', playerAId: '3', playerBId: '4', teamA: 'Man City', teamB: 'Bayern', scoreA: 2, scoreB: 5, date: '2026-05-11T10:00:02Z' },
        { id: 'r1_3', playerAId: '5', playerBId: '6', teamA: 'Newcastle', teamB: 'Villarreal CF', scoreA: 1, scoreB: 5, date: '2026-05-11T10:00:03Z' },
        { id: 'r1_4', playerAId: '7', playerBId: '8', teamA: 'Man United', teamB: 'PSV', scoreA: 3, scoreB: 4, date: '2026-05-11T10:00:04Z' },
        { id: 'r1_5', playerAId: '9', playerBId: '10', teamA: 'Olympic Lyon', teamB: 'Napoli', scoreA: 4, scoreB: 1, date: '2026-05-11T10:00:05Z' },
        { id: 'r1_6', playerAId: '11', playerBId: '12', teamA: 'AC Milan', teamB: 'Benfica', scoreA: 2, scoreB: 2, date: '2026-05-11T10:00:06Z' },
        { id: 'r1_7', playerAId: '13', playerBId: '14', teamA: 'Real Betis', teamB: 'Atletico', scoreA: 5, scoreB: 3, date: '2026-05-11T10:00:07Z' },
        { id: 'r1_8', playerAId: '15', playerBId: '16', teamA: 'Real Madrid', teamB: 'Marshall', scoreA: 2, scoreB: 1, date: '2026-05-11T10:00:08Z' },
        
        // Round 2
        { id: 'r2_1', playerAId: '10', playerBId: '11', teamA: 'Napoli', teamB: 'AC Milan', scoreA: 2, scoreB: 0, scorersA: 'Hojlund, Neres', date: '2026-05-11T11:00:01Z' },
        { id: 'r2_2', playerAId: '3', playerBId: '1', teamA: 'Man City', teamB: 'Tottenham', scoreA: 1, scoreB: 1, scorersA: 'Doku', scorersB: 'Kudus', date: '2026-05-11T11:00:02Z' },
        { id: 'r2_3', playerAId: '12', playerBId: '8', teamA: 'Benfica', teamB: 'PSV', scoreA: 0, scoreB: 1, scorersB: 'Diouech', yellowA: 'Otamendi', date: '2026-05-11T11:00:03Z' },
        { id: 'r2_4', playerAId: '2', playerBId: '13', teamA: 'Arsenal', teamB: 'Real Betis', scoreA: 0, scoreB: 0, date: '2026-05-11T11:00:04Z' },
        { id: 'r2_5', playerAId: '16', playerBId: '5', teamA: 'Marshall', teamB: 'Newcastle', scoreA: 2, scoreB: 2, scorersA: 'Traore, Paixao', scorersB: 'Wisa, Elanga', date: '2026-05-11T11:00:05Z' },
        { id: 'r2_6', playerAId: '6', playerBId: '9', teamA: 'Villarreal CF', teamB: 'Olympic Lyon', scoreA: 0, scoreB: 0, yellowA: 'Endrick, Niakate', date: '2026-05-11T11:00:06Z' },
        { id: 'r2_7', playerAId: '7', playerBId: '15', teamA: 'Man United', teamB: 'Real Madrid', scoreA: 3, scoreB: 1, scorersA: 'Mbeumo, Cunhax2', scorersB: 'Bellingham', date: '2026-05-11T11:00:07Z' },
        { id: 'r2_8', playerAId: '14', playerBId: '4', teamA: 'Atletico', teamB: 'Bayern', scoreA: 0, scoreB: 4, scorersB: 'Diaz, Olise, Kane, Goretzka', date: '2026-05-11T11:00:08Z' },
      ];

      // Merge with current matches, avoiding duplicates by ID
      const existingIds = new Set(matches.map(m => m.id));
      const newMatches = [...matches];
      round1And2.forEach(m => {
        if (!existingIds.has(m.id)) {
          newMatches.push(m);
        }
      });

      setMatches(newMatches);
      alert('Đã nhập dữ liệu Round 1 & 2 thành công!');
    }
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
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">ĐỒNG BỘ <span className="text-ucl-neon">DỮ LIỆU CLOUD</span></h2>
              <p className="text-ucl-silver text-xs font-bold uppercase tracking-widest mt-1">Quản lý dữ liệu tập trung trên Supabase</p>
            </div>
          </div>
          <div className="space-y-4">
             <button 
              onClick={handleForceSync}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-ucl-neon text-ucl-dark font-black rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)]"
            >
              <RotateCw size={20} /> ĐỒNG BỘ CƯỠNG CHẾ TỪ CLOUD
            </button>
            <p className="text-[10px] text-ucl-silver italic text-center px-4">Nhấn nút này nếu dữ liệu ở Localhost khác với trên Web (Netlify).</p>
          </div>
        </motion.div>

        {/* Quick Import Rounds */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-8 border-ucl-neon/20 space-y-6 md:col-span-2"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-ucl-neon/20 rounded-2xl border border-ucl-neon/40 text-ucl-neon">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="font-black italic uppercase tracking-widest text-lg">Nạp nhanh Round 1 & 2</h3>
              <p className="text-[10px] text-ucl-silver font-bold uppercase">Dữ liệu từ ảnh chụp màn hình</p>
            </div>
          </div>
          <p className="text-xs text-ucl-silver leading-relaxed">
            Tự động thêm 16 trận đấu của Vòng 1 và Vòng 2 (bao gồm người ghi bàn và thẻ phạt) vào lịch sử đấu của bạn.
          </p>
          <button 
            onClick={importRounds1And2}
            className="w-full bg-ucl-neon text-ucl-dark font-black uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
          >
            <CheckCircle2 size={18} /> Nhập Ngay 16 Trận Đấu
          </button>
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
