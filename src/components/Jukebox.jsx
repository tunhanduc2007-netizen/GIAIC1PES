import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Youtube, 
  Search, 
  Trash2, 
  Play, 
  Pause, 
  Download, 
  Loader2, 
  Clock, 
  Calendar,
  AlertCircle,
  FileMusic,
  CheckCircle2,
  ListMusic,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Jukebox({ 
  playlist, 
  currentTrackIndex, 
  isPlaying, 
  currentTime,
  duration,
  onPlayTrack, 
  onDeleteTrack, 
  onPlaylistUpdated,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev
}) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusSubtext, setStatusSubtext] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'error'
  
  // Search and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'name'

  // Form handle download
  const handleDownload = async (e) => {
    e.preventDefault();
    const url = youtubeUrl.trim();
    if (!url) return;

    setIsDownloading(true);
    setStatusType('info');
    setStatusText('Đang kết nối đến YouTube...');
    setStatusSubtext('Lấy thông tin luồng âm thanh chất lượng tốt nhất.');

    // Simulating loaders text update for user feedback
    const statusInterval = setInterval(() => {
      setStatusText((prev) => {
        if (prev === 'Đang kết nối đến YouTube...') {
          setStatusSubtext('Trích xuất luồng nhạc gốc. Việc này có thể mất 15-30 giây tùy thuộc độ dài video.');
          return 'Đang tải luồng âm thanh...';
        }
        return prev;
      });
    }, 5000);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      clearInterval(statusInterval);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Tải nhạc thất bại.');
      }

      setStatusType('success');
      setStatusText('Thành công!');
      setStatusSubtext(`Đã thêm bài hát: "${data.track.title}" vào playlist.`);
      setYoutubeUrl('');

      // Trigger callback in App to reload playlist
      if (onPlaylistUpdated) {
        await onPlaylistUpdated();
      }

      // Autoplay track
      if (data.track && playlist) {
        // Give brief time for state refresh
        setTimeout(() => {
          if (onPlayTrack) {
            onPlayTrack(data.track.id);
          }
        }, 500);
      }

      // Auto hide success status
      setTimeout(() => {
        setIsDownloading(false);
        setStatusText('');
        setStatusSubtext('');
      }, 5000);

    } catch (err) {
      clearInterval(statusInterval);
      console.error(err);
      setStatusType('error');
      setStatusText('Lỗi tải nhạc!');
      setStatusSubtext(err.message);

      setTimeout(() => {
        setIsDownloading(false);
        setStatusText('');
        setStatusSubtext('');
      }, 6000);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    if (isNaN(secs) || secs === null) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Filter and Sort tracks
  const processedTracks = playlist
    .filter(track => 
      track.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      } else {
        // newest added first
        return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
      }
    });

  const totalDuration = playlist.reduce((acc, t) => acc + (t.duration || 0), 0);
  const track = playlist[currentTrackIndex] || playlist[0] || { title: 'Chưa chọn bài', artist: 'PES Youtube Jukebox', thumbnail: '' };
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-ucl-dark/40 backdrop-blur-2xl rounded-3xl border border-white/5 p-6 md:p-8 min-h-[calc(100vh-200px)] relative overflow-hidden font-poppins">
      
      {/* Background neon visual overlays */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-neon-glow rounded-full -z-10 pointer-events-none opacity-40" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-glow rounded-full -z-10 pointer-events-none opacity-30" />

      {/* Header Branding */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ucl-neon rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,42,95,0.4)]">
            <Music className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bebas text-3xl italic tracking-wide text-white uppercase leading-none">
              PES <span className="text-ucl-neon">YOUTUBE JUKEBOX</span>
            </h1>
            <span className="text-ucl-silver text-[9px] font-bold uppercase tracking-[0.25em] font-montserrat mt-1 block">
              Tải nhạc YouTube trực tiếp & nghe nhạc cực đỉnh
            </span>
          </div>
        </div>

        {/* Dynamic playlist quick statistics */}
        <div className="flex gap-4 bg-white/5 border border-white/5 px-5 py-3 rounded-2xl">
          <div className="flex flex-col items-center">
            <span className="text-ucl-neon font-black font-bebas text-lg leading-none">{playlist.length}</span>
            <span className="text-ucl-silver text-[8px] font-black uppercase mt-1 tracking-wider">Bài hát</span>
          </div>
          <div className="w-px h-6 bg-white/10 self-center" />
          <div className="flex flex-col items-center">
            <span className="text-ucl-blue font-black font-bebas text-lg leading-none">{formatTime(totalDuration)}</span>
            <span className="text-ucl-silver text-[8px] font-black uppercase mt-1 tracking-wider">Tổng phút</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Paste & Download Box */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
            <h3 className="font-bebas text-lg italic tracking-wider text-white mb-3 uppercase flex items-center gap-2">
              <Youtube className="text-ucl-neon" size={18} /> Thêm bài hát mới
            </h3>
            <p className="text-ucl-silver text-xs leading-relaxed mb-6 font-montserrat">
              Nhập link YouTube (Video trận đấu, nhạc nền bốc thăm, nhạc sàn cổ vũ...) để hệ thống tự động tải luồng âm thanh cực nhẹ về máy của bạn!
            </p>

            <form onSubmit={handleDownload} className="flex flex-col gap-4">
              <div className="relative">
                <input 
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={isDownloading}
                  className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-white text-xs placeholder-white/30 focus:outline-none focus:border-ucl-neon font-montserrat transition-all"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isDownloading}
                className="w-full py-3 bg-gradient-to-r from-ucl-neon to-ucl-blue text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Đang xử lý...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Tải & thêm vào playlist
                  </>
                )}
              </button>
            </form>

            {/* Downloader States display */}
            <AnimatePresence>
              {isDownloading && statusText && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 10 }}
                  className={`mt-6 p-4 rounded-xl border flex gap-3 ${
                    statusType === 'success' 
                      ? 'bg-ucl-blue/10 border-ucl-blue/20 text-ucl-blue' 
                      : statusType === 'error' 
                        ? 'bg-ucl-neon/10 border-ucl-neon/20 text-ucl-neon' 
                        : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {statusType === 'success' ? (
                      <CheckCircle2 size={18} />
                    ) : statusType === 'error' ? (
                      <AlertCircle size={18} />
                    ) : (
                      <Loader2 className="animate-spin text-ucl-blue" size={18} />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-xs uppercase font-montserrat">{statusText}</span>
                    <span className="text-[10px] text-ucl-silver font-montserrat leading-relaxed">{statusSubtext}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Jukebox Player Box */}
          <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-4 font-montserrat select-none">
            <h3 className="font-bebas text-lg italic tracking-wider text-white mb-1 uppercase flex items-center gap-2">
              <Music className="text-ucl-blue" size={18} /> Trình phát nhạc
            </h3>
            
            {/* Row 1: Header + Track info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
                <img 
                  src={track.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150'} 
                  alt="cover" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150' }}
                />
              </div>
              <div className="flex flex-col overflow-hidden max-w-[170px] leading-tight">
                <span className="text-[8px] font-black uppercase text-ucl-neon tracking-widest leading-none">Now Playing</span>
                <span className="text-xs font-black text-white truncate w-full mt-1.5" title={track.title}>
                  {track.title || track.name}
                </span>
                <span className="text-[9px] text-ucl-silver font-semibold truncate w-full mt-0.5" title={track.artist}>
                  {track.artist || 'PES Youtube'}
                </span>
              </div>
            </div>

            {/* Row 2: Seekbar */}
            <div className="flex flex-col gap-1 w-full mt-1">
              <div className="relative w-full h-5 flex items-center cursor-pointer">
                <div className="absolute w-full h-0.5 bg-white/10 rounded-full" />
                <div 
                  className="absolute h-0.5 bg-ucl-neon rounded-full shadow-[0_0_10px_rgba(255,42,95,0.4)]" 
                  style={{ width: `${percentage}%` }}
                />
                <input 
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => onSeek(parseFloat(e.target.value))}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-ucl-silver font-bold uppercase tracking-wider">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Row 3: Buttons */}
            <div className="flex items-center justify-center gap-6 mt-1">
              <button 
                onClick={onPrev}
                className="text-ucl-silver hover:text-white transition-all scale-95 hover:scale-105 active:scale-95 p-1.5"
                title="Bài trước đó"
              >
                <SkipBack size={16} />
              </button>

              <button 
                onClick={onTogglePlay}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                  isPlaying 
                    ? "bg-ucl-neon text-white shadow-[0_0_15px_rgba(255,42,95,0.4)] hover:scale-105" 
                    : "bg-white text-ucl-dark hover:scale-105"
                }`}
                title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
              >
                {isPlaying ? (
                  <Pause size={16} className="fill-white" />
                ) : (
                  <Play size={16} className="fill-ucl-dark translate-x-0.5" />
                )}
              </button>

              <button 
                onClick={onNext}
                className="text-ucl-silver hover:text-white transition-all scale-95 hover:scale-105 active:scale-95 p-1.5"
                title="Bài tiếp theo"
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Playlist tracks collection view */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="font-bebas text-lg italic tracking-wider text-white uppercase flex items-center gap-2">
              <ListMusic className="text-ucl-blue" size={18} /> Danh sách phát cá nhân
            </h3>

            {/* Filter searching and sorting buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm bài hát, ca sĩ..."
                  className="w-full md:w-56 pl-9 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white text-xs placeholder-white/30 focus:outline-none focus:border-ucl-blue transition-all"
                />
              </div>

              <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl">
                <button 
                  onClick={() => setSortBy('date')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    sortBy === 'date' 
                      ? 'bg-ucl-neon text-white shadow-md' 
                      : 'text-ucl-silver hover:text-white'
                  }`}
                >
                  <Calendar className="inline mr-1" size={10} /> Mới nhất
                </button>
                <button 
                  onClick={() => setSortBy('name')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    sortBy === 'name' 
                      ? 'bg-ucl-neon text-white shadow-md' 
                      : 'text-ucl-silver hover:text-white'
                  }`}
                >
                  <FileMusic className="inline mr-1" size={10} /> Tên A-Z
                </button>
              </div>
            </div>
          </div>

          {/* Grid list container */}
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {processedTracks.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]"
                >
                  <Music className="mx-auto text-white/20 mb-4 animate-bounce" size={40} />
                  <h4 className="font-bold text-white text-sm">CHƯA CÓ BÀI HÁT NÀO KHỚP</h4>
                  <p className="text-ucl-silver text-xs mt-2 max-w-sm mx-auto">
                    {playlist.length === 0 
                      ? 'Dán một link YouTube bất kỳ ở cột bên trái và bấm Tải nhạc để kiến tạo không gian âm nhạc của riêng bạn.'
                      : 'Hãy thử tìm kiếm từ khóa khác xem sao nhé!'}
                  </p>
                </motion.div>
              ) : (
                processedTracks.map((track, index) => {
                  // Find index in original playlist to sync playback accurately
                  const originalIndex = playlist.findIndex(t => t.id === track.id);
                  const isCurrent = originalIndex === currentTrackIndex;

                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => onPlayTrack(track.id)}
                      className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer group ${
                        isCurrent 
                          ? 'bg-ucl-blue/10 border-ucl-blue/30 shadow-[0_0_15px_rgba(0,184,255,0.05)]' 
                          : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]'
                      }`}
                    >
                      {/* Play State Overlay indicators */}
                      <div className="w-8 shrink-0 flex items-center justify-center">
                        {isCurrent ? (
                          <div className="text-ucl-blue">
                            {isPlaying ? (
                              <div className="flex items-center justify-center gap-0.5 h-4 w-4">
                                <span className="w-0.5 h-3 bg-ucl-blue rounded-full animate-[bounce-pulse_1s_infinite_alternate]" style={{ animationDelay: '0.1s' }} />
                                <span className="w-0.5 h-4 bg-ucl-blue rounded-full animate-[bounce-pulse_1s_infinite_alternate]" style={{ animationDelay: '0.3s' }} />
                                <span className="w-0.5 h-2 bg-ucl-blue rounded-full animate-[bounce-pulse_1s_infinite_alternate]" style={{ animationDelay: '0.5s' }} />
                              </div>
                            ) : (
                              <Play size={14} className="fill-ucl-blue" />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-white/30 group-hover:hidden">{index + 1}</span>
                        )}
                        <Play size={12} className="hidden group-hover:block text-ucl-blue fill-ucl-blue shrink-0" style={{ display: isCurrent ? 'none' : '' }} />
                      </div>

                      {/* Thumbnail Cover */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/5 shrink-0 bg-black/40">
                        <img 
                          src={track.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150'} 
                          alt="cover" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150';
                          }}
                        />
                      </div>

                      {/* Metadata */}
                      <div className="flex-grow overflow-hidden">
                        <div className={`font-bold text-xs truncate ${isCurrent ? 'text-ucl-blue' : 'text-white'}`} title={track.title}>
                          {track.title}
                        </div>
                        <div className="text-[10px] text-ucl-silver truncate mt-1" title={track.artist}>
                          {track.artist}
                        </div>
                      </div>

                      {/* Duration stamp */}
                      <div className="shrink-0 flex items-center gap-4 pr-1 text-ucl-silver text-xs font-montserrat">
                        <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(track.duration)}</span>
                        
                        {/* Delete Trash Action */}
                        {!track.id.startsWith('static-') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTrack(track.id, track.title);
                            }}
                            className="p-2 rounded-xl text-white/20 hover:text-ucl-neon hover:bg-ucl-neon/10 transition-all shrink-0"
                            title="Xóa bài hát"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Styled animation keyframes injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-pulse {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.2); }
        }
      `}} />

    </div>
  );
}
