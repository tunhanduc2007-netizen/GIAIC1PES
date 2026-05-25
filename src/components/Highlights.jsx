import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, 
  Scissors, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Star, 
  Search, 
  Trash2, 
  Plus, 
  Tag, 
  Calendar, 
  User, 
  Tv, 
  Gamepad2, 
  CheckCircle,
  Volume1,
  X,
  Sparkles,
  Info,
  CirclePlay,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Web Audio API Synthesizer (Genuine Retro Sound effects) ---
class PESSoundSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'whistle':
        // Double-tone Referee Whistle
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2000, now);
        osc1.frequency.linearRampToValueAtTime(2050, now + 0.1);
        osc1.frequency.linearRampToValueAtTime(2000, now + 0.2);
        osc1.frequency.exponentialRampToValueAtTime(100, now + 0.35);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2030, now);
        osc2.frequency.linearRampToValueAtTime(2080, now + 0.12);
        osc2.frequency.exponentialRampToValueAtTime(100, now + 0.35);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
        break;

      case 'horn':
        // Low stadium vuvuzela/horn
        const oscH = this.ctx.createOscillator();
        const filterH = this.ctx.createBiquadFilter();
        const gainH = this.ctx.createGain();

        oscH.type = 'sawtooth';
        oscH.frequency.setValueAtTime(115, now);
        oscH.frequency.linearRampToValueAtTime(120, now + 0.4);
        oscH.frequency.exponentialRampToValueAtTime(90, now + 1.0);

        filterH.type = 'bandpass';
        filterH.frequency.setValueAtTime(900, now);
        filterH.frequency.exponentialRampToValueAtTime(2200, now + 0.4);
        filterH.Q.setValueAtTime(3, now);

        gainH.gain.setValueAtTime(0, now);
        gainH.gain.linearRampToValueAtTime(0.08, now + 0.1);
        gainH.gain.linearRampToValueAtTime(0.06, now + 0.7);
        gainH.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

        oscH.connect(filterH);
        filterH.connect(gainH);
        gainH.connect(this.ctx.destination);

        oscH.start(now);
        oscH.stop(now + 1.0);
        break;

      case 'cheer':
        // Stadium Crowd roar (Filtered white noise)
        const bufferSize = this.ctx.sampleRate * 2.0;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
        filter.frequency.exponentialRampToValueAtTime(500, now + 1.2);

        const gainC = this.ctx.createGain();
        gainC.gain.setValueAtTime(0, now);
        gainC.gain.linearRampToValueAtTime(0.12, now + 0.4);
        gainC.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        noise.connect(filter);
        filter.connect(gainC);
        gainC.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 2.0);
        break;

      case 'goal':
        // Goal fanfare + crowd cheer
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gainN = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          gainN.gain.setValueAtTime(0, now + i * 0.08);
          gainN.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.02);
          gainN.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.25);

          osc.connect(gainN);
          gainN.connect(this.ctx.destination);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.25);
        });

        setTimeout(() => this.play('cheer'), 150);
        break;

      case 'strike':
        // Whoosh laser/kick sound
        const oscS = this.ctx.createOscillator();
        const gainS = this.ctx.createGain();

        oscS.type = 'triangle';
        oscS.frequency.setValueAtTime(70, now);
        oscS.frequency.exponentialRampToValueAtTime(900, now + 0.25);
        oscS.frequency.exponentialRampToValueAtTime(100, now + 0.5);

        gainS.gain.setValueAtTime(0, now);
        gainS.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gainS.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        oscS.connect(gainS);
        gainS.connect(this.ctx.destination);

        oscS.start(now);
        oscS.stop(now + 0.5);
        break;

      case 'miss':
        // Sad chord descending
        const oscM = this.ctx.createOscillator();
        const gainM = this.ctx.createGain();

        oscM.type = 'sawtooth';
        oscM.frequency.setValueAtTime(293.66, now); // D4
        oscM.frequency.linearRampToValueAtTime(196.00, now + 0.3); // G3
        oscM.frequency.linearRampToValueAtTime(146.83, now + 0.6); // D3

        const filterM = this.ctx.createBiquadFilter();
        filterM.type = 'lowpass';
        filterM.frequency.setValueAtTime(350, now);

        gainM.gain.setValueAtTime(0, now);
        gainM.gain.linearRampToValueAtTime(0.06, now + 0.1);
        gainM.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

        oscM.connect(filterM);
        filterM.connect(gainM);
        gainM.connect(this.ctx.destination);

        oscM.start(now);
        oscM.stop(now + 0.7);
        break;
    }
  }
}

const synth = new PESSoundSynth();

// --- IndexedDB Handler ---
const dbName = 'PESRetroReelDB';
const dbVersion = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onerror = (e) => reject(e);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('highlights')) {
        db.createObjectStore('highlights', { keyPath: 'id' });
      }
    };
  });
}

export default function Highlights() {
  const [playlist, setPlaylist] = useState([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(-1);
  const [highlights, setHighlights] = useState([]);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTag, setActiveFilterTag] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clipTitle, setClipTitle] = useState('');
  const [clipPlayer, setClipPlayer] = useState('');
  const [clipOpponent, setClipOpponent] = useState('');
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(0);
  const [clipTag, setClipTag] = useState('super-goal');
  const [clipRating, setClipRating] = useState(5);
  const [clipNotes, setClipNotes] = useState('');

  // Memory Reel state
  const [isMemoryReelMode, setIsMemoryReelMode] = useState(false);
  const [memoryReelIndex, setMemoryReelIndex] = useState(-1);
  const [memoryReelPlaylist, setMemoryReelPlaylist] = useState([]);
  const [transitionActive, setTransitionActive] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const dropzoneRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load database highlights on mount
  useEffect(() => {
    loadAllHighlights();
  }, []);

  const loadAllHighlights = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['highlights'], 'readonly');
      const store = transaction.objectStore('highlights');
      const request = store.getAll();
      request.onsuccess = () => {
        setHighlights(request.result || []);
      };
    } catch (e) {
      console.error("IndexedDB load highlights error", e);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent triggers when inside inputs/modals
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 5);
            showToast("Tua nhanh +5s ⏩");
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
            showToast("Tua lùi -5s ⏪");
          }
          break;
        case 'KeyH':
          e.preventDefault();
          triggerClipper();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playlist, activeVideoIndex]);

  // Handle Memory Reel Timeline loop
  useEffect(() => {
    if (!isMemoryReelMode || memoryReelIndex === -1) return;
    const highlight = memoryReelPlaylist[memoryReelIndex];
    if (!highlight || !videoRef.current) return;

    const checkTime = () => {
      if (videoRef.current.currentTime >= highlight.end) {
        videoRef.current.pause();
        playNextInReel();
      }
    };

    videoRef.current.addEventListener('timeupdate', checkTime);
    return () => {
      if (videoRef.current) videoRef.current.removeEventListener('timeupdate', checkTime);
    };
  }, [isMemoryReelMode, memoryReelIndex, memoryReelPlaylist]);

  const showToast = (msg, isSuccess = true) => {
    setToastMessage({ text: msg, isSuccess });
    setTimeout(() => setToastMessage(null), 2500);
  };

  // --- File Select Logic ---
  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    ingestFiles(e.target.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e) => {
    e.preventDefault();
    ingestFiles(e.dataTransfer.files);
  };

  const ingestFiles = (files) => {
    if (!files.length) return;
    let added = 0;
    const newPlaylist = [...playlist];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('video/')) continue;
      if (newPlaylist.some(v => v.name === f.name)) continue;

      const blobUrl = URL.createObjectURL(f);
      newPlaylist.push({
        name: f.name,
        url: blobUrl,
        size: f.size
      });
      added++;
    }

    if (added > 0) {
      setPlaylist(newPlaylist);
      showToast(`Đã nhận ${added} video trận đấu! ⚽`);
      synth.play('goal');

      if (activeVideoIndex === -1) {
        setActiveVideoIndex(newPlaylist.length - added);
      }
    }
  };

  const removeVideo = (idx, e) => {
    e.stopPropagation();
    const video = playlist[idx];
    URL.revokeObjectURL(video.url);

    const newPlaylist = playlist.filter((_, i) => i !== idx);
    setPlaylist(newPlaylist);

    if (newPlaylist.length === 0) {
      setActiveVideoIndex(-1);
      setIsPlaying(false);
      if (videoRef.current) videoRef.current.removeAttribute('src');
    } else if (activeVideoIndex === idx) {
      const nextPlay = Math.max(0, idx - 1);
      setActiveVideoIndex(nextPlay);
    } else if (activeVideoIndex > idx) {
      setActiveVideoIndex(prev => prev - 1);
    }
  };

  const handlePlayPause = () => {
    synth.init();
    if (playlist.length === 0) {
      showToast("Vui lòng kéo thả video trận đấu vào trước nhé!", false);
      return;
    }
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log(e));
    }
  };

  const handleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = (v === 0);
      setIsMuted(v === 0);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
    else if (videoRef.current.webkitRequestFullscreen) videoRef.current.webkitRequestFullscreen();
  };

  const formatTimeStr = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Highlight Clipper Logic ---
  const triggerClipper = () => {
    if (activeVideoIndex === -1 || !videoRef.current) {
      showToast("Hãy kéo thả video vào phát trước khi đánh dấu kỉ niệm!", false);
      return;
    }

    videoRef.current.pause();
    setIsPlaying(false);
    synth.play('whistle');

    const nowTime = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 100;
    const start = Math.max(0, nowTime - 10);
    const end = Math.min(dur, nowTime);

    setClipStart(parseFloat(start.toFixed(1)));
    setClipEnd(parseFloat(end.toFixed(1)));
    setClipTitle(`Pha bóng ghi bàn phút ${formatTimeStr(nowTime)}`);
    setClipPlayer('');
    setClipOpponent('');
    setClipNotes('');
    setClipTag('super-goal');
    setClipRating(5);
    setIsModalOpen(true);
  };

  const saveHighlight = async (e) => {
    e.preventDefault();
    const activeVideo = playlist[activeVideoIndex];

    const newHighlight = {
      id: Date.now().toString(),
      videoName: activeVideo.name,
      title: clipTitle.trim(),
      player: clipPlayer.trim() || 'Vô danh',
      opponent: clipOpponent.trim() || 'Không rõ',
      start: parseFloat(clipStart),
      end: parseFloat(clipEnd),
      tag: clipTag,
      rating: parseInt(clipRating),
      notes: clipNotes.trim(),
      dateAdded: new Date().toLocaleDateString('vi-VN')
    };

    try {
      const db = await openDB();
      const transaction = db.transaction(['highlights'], 'readwrite');
      const store = transaction.objectStore('highlights');
      await store.put(newHighlight);
      
      synth.play('goal');
      setIsModalOpen(false);
      showToast("⚽ Đã ghi vào sử sách kỷ niệm!");
      
      await loadAllHighlights();
      if (videoRef.current) videoRef.current.play().then(() => setIsPlaying(true));
    } catch (err) {
      console.error(err);
      showToast("Không thể lưu kỉ niệm, hãy thử lại!", false);
    }
  };

  const deleteHighlight = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa kỷ niệm này khỏi sử sách không?")) return;

    try {
      const db = await openDB();
      const transaction = db.transaction(['highlights'], 'readwrite');
      const store = transaction.objectStore('highlights');
      await store.delete(id);
      
      synth.play('miss');
      showToast("Đã xóa kỷ niệm thành công!");
      await loadAllHighlights();
    } catch (e) {
      console.error(e);
      showToast("Lỗi khi xóa kỷ niệm", false);
    }
  };

  const playSingleHighlight = (h) => {
    const idx = playlist.findIndex(v => v.name === h.videoName);
    if (idx === -1) {
      showToast(`Hãy kéo thả video "${h.videoName}" vào trước để phát!`, false);
      synth.play('horn');
      return;
    }

    if (isMemoryReelMode) exitMemoryReel();

    setActiveVideoIndex(idx);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = h.start;
        videoRef.current.play().then(() => setIsPlaying(true));
        showToast(`▶️ Đang chiếu kỉ niệm: ${h.title}`);
      }
    }, 400);
  };

  // --- Memory Reel Theater ---
  const activeHighlightsList = highlights.filter(h => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ = h.title.toLowerCase().includes(q) || 
                   h.player.toLowerCase().includes(q) || 
                   h.opponent.toLowerCase().includes(q) || 
                   h.notes.toLowerCase().includes(q);
    const matchTag = activeFilterTag === 'all' || h.tag === activeFilterTag;
    return matchQ && matchTag;
  }).sort((a,b) => b.rating - a.rating);

  const startMemoryReel = () => {
    synth.init();
    if (activeHighlightsList.length === 0) {
      showToast("Chưa có kỷ niệm nào để trình chiếu!", false);
      return;
    }

    setIsMemoryReelMode(true);
    setMemoryReelPlaylist(activeHighlightsList);
    setMemoryReelIndex(0);
    showToast("🍿 Đang chiếu Rạp Phim Kỷ Niệm... Hãy tận hưởng!");
    playHighlightIndex(0, activeHighlightsList);
  };

  const playHighlightIndex = (idx, list) => {
    if (idx >= list.length) {
      showToast("🏆 Kết thúc rạp phim kỷ niệm!");
      synth.play('goal');
      exitMemoryReel();
      return;
    }

    setMemoryReelIndex(idx);
    const highlight = list[idx];
    const videoIdx = playlist.findIndex(v => v.name === highlight.videoName);

    if (videoIdx === -1) {
      showToast(`Bỏ qua: Thiếu tệp video "${highlight.videoName}"`, false);
      setTimeout(() => {
        playHighlightIndex(idx + 1, list);
      }, 1500);
      return;
    }

    if (activeVideoIndex !== videoIdx) {
      setActiveVideoIndex(videoIdx);
    }

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = highlight.start;
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
            showToast(`🎬 [${idx + 1}/${list.length}]: ${highlight.title}`);
          })
          .catch(() => playHighlightIndex(idx + 1, list));
      }
    }, 450);
  };

  const playNextInReel = () => {
    setTransitionActive(true);
    const transitionSounds = ['success-save', 'horn', 'whistle'];
    const randomSound = transitionSounds[Math.floor(Math.random() * transitionSounds.length)];
    synth.play(randomSound);

    setTimeout(() => {
      setTransitionActive(false);
      playHighlightIndex(memoryReelIndex + 1, memoryReelPlaylist);
    }, 1200);
  };

  const exitMemoryReel = () => {
    setIsMemoryReelMode(false);
    setMemoryReelIndex(-1);
    setTransitionActive(false);
    if (videoRef.current) videoRef.current.pause();
    setIsPlaying(false);
  };

  const handleActiveVideoChange = (idx) => {
    if (isMemoryReelMode) exitMemoryReel();
    setActiveVideoIndex(idx);
  };

  return (
    <div className="bg-ucl-dark/40 backdrop-blur-2xl rounded-3xl border border-white/5 p-6 md:p-8 min-h-[calc(100vh-200px)] relative overflow-hidden font-poppins">
      {/* Background radial overlays to match App design */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-neon-glow rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-glow rounded-full -z-10 pointer-events-none" />

      {/* Header Branding Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ucl-neon rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,42,95,0.4)]">
              <Film className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bebas text-3xl italic tracking-wide text-white uppercase leading-none">
                PES <span className="text-ucl-neon">HIGHLIGHTS HUB</span>
              </h1>
              <span className="text-ucl-silver text-[9px] font-bold uppercase tracking-[0.25em] font-montserrat mt-1 block">
                Khắc Ghi Khoảnh Khắc Huyền Thoại
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {isMemoryReelMode ? (
            <button
              onClick={exitMemoryReel}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-ucl-neon hover:bg-ucl-neon/90 border border-ucl-neon text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,42,95,0.3)] animate-pulse"
            >
              <RotateCcw size={16} /> Dừng Trình Chiếu
            </button>
          ) : (
            <button
              onClick={startMemoryReel}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-ucl-blue to-ucl-star text-ucl-dark hover:scale-105 font-bold text-xs uppercase tracking-wider transition-all shadow-xl"
            >
              <CirclePlay size={16} /> Rạp Chiếu Kỷ Niệm
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Video Player & Control Console */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center">
            
            {/* Cinematic Transition Screen Overlay */}
            <AnimatePresence>
              {transitionActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-ucl-dark/95 z-40 flex flex-col justify-center items-center gap-4"
                >
                  <Sparkles className="text-ucl-neon animate-pulse" size={42} />
                  <span className="font-bebas italic text-xl tracking-widest text-white uppercase">
                    SIÊU PHẨM TIẾP THEO...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Video Player Toast Notifications */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: -20, x: '-50%' }}
                  className={`absolute top-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider z-50 shadow-2xl backdrop-blur-xl ${
                    toastMessage.isSuccess 
                      ? "bg-ucl-blue/90 text-ucl-dark border border-ucl-blue/20" 
                      : "bg-ucl-neon/90 text-white border border-ucl-neon/20"
                  }`}
                >
                  {toastMessage.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Video Element */}
            {playlist.length > 0 && activeVideoIndex !== -1 ? (
              <video
                ref={videoRef}
                src={playlist[activeVideoIndex].url}
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => {
                  if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                    setCurrentTime(0);
                  }
                }}
                onClick={handlePlayPause}
              />
            ) : (
              <div 
                ref={dropzoneRef}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={triggerFileInput}
                className="flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-white/[0.02] w-full h-full transition-colors group"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5 group-hover:border-ucl-neon group-hover:text-ucl-neon transition-colors">
                  <Film size={26} className="text-ucl-silver group-hover:text-ucl-neon group-hover:scale-110 transition-all" />
                </div>
                <h3 className="font-bold text-white text-base">CHƯA CÓ TRẬN ĐẤU ĐƯỢC CHỌN</h3>
                <p className="text-ucl-silver text-xs mt-2 max-w-sm">
                  Kéo thả tệp video (.mp4, .webm) từ máy tính của bạn vào đây hoặc click để chọn file!
                </p>
                <button className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold uppercase tracking-wider group-hover:bg-ucl-neon group-hover:border-ucl-neon transition-all">
                  Duyệt Tệp Video
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
            
            {/* Custom Control overlay bar inside player */}
            {playlist.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-3 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity z-30">
                {/* Timeline Scrubber & custom markers */}
                <div className="relative w-full flex items-center group">
                  {/* Timeline Highlight markers ticks */}
                  <div className="absolute left-0 right-0 h-1.5 pointer-events-none">
                    {duration > 0 && highlights
                      .filter(h => h.videoName === playlist[activeVideoIndex].name)
                      .map((h, i) => {
                        const leftPct = (h.start / duration) * 100;
                        let color = '#ffd700'; // gold
                        if (h.tag === 'super-goal') color = '#ff2a5f'; // neon pink
                        else if (h.tag === 'dribble') color = '#00ff7f'; // neon green
                        else if (h.tag === 'assist') color = '#00b8ff'; // neon blue
                        else if (h.tag === 'funny') color = '#ffffff';

                        return (
                          <div
                            key={h.id}
                            className="absolute w-2.5 h-2.5 rounded-full border border-black -translate-x-1/2 -translate-y-[2px]"
                            style={{ 
                              left: `${leftPct}%`, 
                              backgroundColor: color,
                              boxShadow: `0 0 8px ${color}`
                            }}
                            title={`${h.title} (${h.player})`}
                          />
                        );
                      })}
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.05"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full accent-ucl-neon h-1 bg-white/20 rounded-lg appearance-none cursor-pointer group-hover:h-2 transition-all"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button onClick={handlePlayPause} className="text-white hover:text-ucl-neon transition-colors">
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    
                    <button onClick={handleMute} className="text-white hover:text-ucl-neon transition-colors">
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />

                    <span className="text-[10px] font-mono text-ucl-silver">
                      {formatTimeStr(currentTime)} / {formatTimeStr(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={triggerClipper}
                      className="px-3 py-1.5 bg-ucl-neon hover:scale-105 rounded-xl text-[10px] font-black text-white flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,42,95,0.4)]"
                    >
                      <Scissors size={10} /> CẮT SIÊU PHẨM (H)
                    </button>

                    <button onClick={handleFullscreen} className="text-white hover:text-ucl-neon transition-colors">
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tips panel & Keyboard shortcuts */}
          <div className="flex flex-wrap gap-2.5 p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[11px] text-ucl-silver items-center justify-center">
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <kbd className="text-ucl-neon font-black font-mono">SPACE</kbd> Play/Pause
            </span>
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <kbd className="text-ucl-neon font-black font-mono">← / →</kbd> Tua 5s
            </span>
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <kbd className="text-ucl-neon font-black font-mono">H</kbd> Đánh dấu nhanh 10s vừa qua
            </span>
          </div>

          {/* Soundboard Panel (Gamer elements) */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5">
            <h3 className="font-bebas text-lg italic text-white uppercase mb-4 flex items-center gap-2">
              <Volume1 className="text-ucl-neon" size={18} /> PES Ambient Soundboard
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <button
                onClick={() => synth.play('whistle')}
                className="py-2.5 bg-white/5 hover:bg-ucl-neon hover:text-white border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-ucl-silver transition-all"
              >
                📢 Trọng Tài
              </button>
              <button
                onClick={() => synth.play('cheer')}
                className="py-2.5 bg-white/5 hover:bg-ucl-neon hover:text-white border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-ucl-silver transition-all"
              >
                🔊 Hò Réu
              </button>
              <button
                onClick={() => synth.play('goal')}
                className="py-2.5 bg-white/5 hover:bg-gradient-to-r hover:from-ucl-blue hover:to-ucl-star hover:text-ucl-dark border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-ucl-silver transition-all"
              >
                ⚽ GOALLLL!
              </button>
              <button
                onClick={() => synth.play('strike')}
                className="py-2.5 bg-white/5 hover:bg-ucl-neon hover:text-white border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-ucl-silver transition-all"
              >
                ⚡ SÚT BÚA BỔ
              </button>
              <button
                onClick={() => synth.play('miss')}
                className="py-2.5 bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-ucl-silver transition-all"
              >
                🤪 Oh Tiếc Quá
              </button>
              <button
                onClick={() => synth.play('horn')}
                className="py-2.5 bg-white/5 hover:bg-ucl-neon hover:text-white border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-ucl-silver transition-all"
              >
                🎺 Kèn Sân
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: File list & Highlight cards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Active files playlist */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col gap-4 max-h-[300px]">
            <h3 className="font-bebas text-base italic text-white uppercase flex items-center gap-2">
              <Tv className="text-ucl-neon" size={16} /> DANH SÁCH VIDEO ({playlist.length})
            </h3>
            
            {playlist.length === 0 ? (
              <div className="py-8 text-center text-ucl-silver text-[11px] bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                Kéo thả video vào trình phát để nạp danh sách
              </div>
            ) : (
              <div className="overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
                {playlist.map((video, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleActiveVideoChange(idx)}
                    className={`flex justify-between items-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      activeVideoIndex === idx 
                        ? "bg-ucl-neon/10 border-ucl-neon text-white font-bold" 
                        : "bg-white/[0.01] border-white/5 text-ucl-silver hover:bg-white/[0.03] hover:text-white"
                    }`}
                  >
                    <span className="text-xs truncate max-w-[200px]" title={video.name}>{video.name}</span>
                    <button 
                      onClick={(e) => removeVideo(idx, e)}
                      className="p-1.5 bg-transparent hover:bg-ucl-neon/20 hover:text-ucl-neon rounded-lg text-ucl-silver transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Library Search & Filter Cards */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col gap-4 flex-grow max-h-[500px]">
            <h3 className="font-bebas text-base italic text-white uppercase flex items-center gap-2">
              <Star className="text-ucl-blue" size={16} /> THƯ VIỆN KỶ NIỆM ({highlights.length})
            </h3>

            {/* Filter Search Bar */}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ucl-silver" />
                <input
                  type="text"
                  placeholder="Tìm kiếm kỷ niệm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 focus:border-ucl-neon rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none transition-colors"
                />
              </div>

              <select
                value={activeFilterTag}
                onChange={(e) => setActiveFilterTag(e.target.value)}
                className="bg-white/5 border border-white/5 focus:border-ucl-neon rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
              >
                <option value="all" className="bg-ucl-dark text-white">Tất cả nhãn</option>
                <option value="super-goal" className="bg-ucl-dark text-white">⚽ Siêu phẩm sút xa</option>
                <option value="dribble" className="bg-ucl-dark text-white">⚡ Rê bóng đỉnh cao</option>
                <option value="assist" className="bg-ucl-dark text-white">🎯 Kiến tạo dọn cỗ</option>
                <option value="funny" className="bg-ucl-dark text-white">🤪 Tấu hài tột độ</option>
              </select>
            </div>

            {/* Highlight list */}
            {activeHighlightsList.length === 0 ? (
              <div className="py-12 text-center text-ucl-silver text-xs bg-white/[0.01] border border-white/5 rounded-2xl">
                Chưa có kỷ niệm nào phù hợp. Click nút cắt trên video player để lưu!
              </div>
            ) : (
              <div className="overflow-y-auto flex flex-col gap-3 pr-1 custom-scrollbar">
                {activeHighlightsList.map((h) => {
                  let tagText = '⚽ Siêu phẩm';
                  let tagBg = 'bg-ucl-neon/10 text-ucl-neon';
                  if (h.tag === 'dribble') { tagText = '⚡ Rê bóng'; tagBg = 'bg-green-500/10 text-green-400'; }
                  else if (h.tag === 'assist') { tagText = '🎯 Kiến tạo'; tagBg = 'bg-blue-500/10 text-blue-400'; }
                  else if (h.tag === 'funny') { tagText = '🤪 Hài hước'; tagBg = 'bg-yellow-500/10 text-yellow-400'; }

                  return (
                    <div
                      key={h.id}
                      className="p-3 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl flex flex-col gap-2 group transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span 
                          onClick={() => playSingleHighlight(h)}
                          className="font-bold text-[11px] text-white hover:text-ucl-neon cursor-pointer hover:underline line-clamp-2"
                        >
                          {h.title}
                        </span>
                        
                        <button
                          onClick={(e) => deleteHighlight(h.id, e)}
                          className="p-1 bg-transparent hover:bg-ucl-neon/10 hover:text-ucl-neon rounded-lg text-ucl-silver transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[9px] text-ucl-silver font-montserrat font-bold">
                        <span className="bg-white/5 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <User size={8} /> {h.player}
                        </span>
                        <span className="bg-white/5 px-2 py-0.5 rounded-lg">
                          vs {h.opponent}
                        </span>
                        <span className="bg-white/5 px-2 py-0.5 rounded-lg">
                          ⏱️ {formatTimeStr(h.start)} - {formatTimeStr(h.end)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-1.5 border-t border-white/[0.03]">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${tagBg}`}>
                          {tagText}
                        </span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star 
                              key={idx} 
                              size={8} 
                              className={idx < h.rating ? "text-ucl-star fill-ucl-star" : "text-white/10"} 
                            />
                          ))}
                        </div>
                      </div>

                      {h.notes && (
                        <p className="text-[9px] text-ucl-silver/70 italic border-l border-white/10 pl-2 mt-1">
                          "{h.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialog Form */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-poppins"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-ucl-dark border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bebas text-lg italic text-white uppercase flex items-center gap-2">
                  <Sparkles className="text-ucl-blue" size={18} /> KHẮC GHI KỶ NIỆM PES
                </h3>
                <button onClick={() => { setIsModalOpen(false); if (videoRef.current) videoRef.current.play().then(() => setIsPlaying(true)); }} className="text-ucl-silver hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={saveHighlight} className="p-6 flex flex-col gap-4 text-xs">
                
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ucl-silver uppercase tracking-wider text-[10px]">Tên Khoảnh Khắc *</label>
                  <input
                    type="text"
                    required
                    value={clipTitle}
                    onChange={(e) => setClipTitle(e.target.value)}
                    placeholder="Ví dụ: Ronaldo sút phạt hàng rào 35m..."
                    className="w-full bg-white/5 border border-white/5 focus:border-ucl-neon rounded-xl px-4 py-2.5 text-white outline-none transition-colors"
                  />
                </div>

                {/* Player vs Opponent */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-ucl-silver uppercase tracking-wider text-[10px]">Cầu Thủ Ghi Bàn</label>
                    <input
                      type="text"
                      value={clipPlayer}
                      onChange={(e) => setClipPlayer(e.target.value)}
                      placeholder="Cristiano Ronaldo,..."
                      className="w-full bg-white/5 border border-white/5 focus:border-ucl-neon rounded-xl px-4 py-2.5 text-white outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-ucl-silver uppercase tracking-wider text-[10px]">Đối Thủ / Bạn Chơi</label>
                    <input
                      type="text"
                      value={clipOpponent}
                      onChange={(e) => setClipOpponent(e.target.value)}
                      placeholder="Thằng Bạn A, CPU..."
                      className="w-full bg-white/5 border border-white/5 focus:border-ucl-neon rounded-xl px-4 py-2.5 text-white outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-ucl-silver uppercase tracking-wider text-[10px]">Giây Bắt Đầu</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={clipStart}
                      onChange={(e) => setClipStart(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 focus:border-ucl-neon rounded-xl px-4 py-2.5 text-white outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-ucl-silver uppercase tracking-wider text-[10px]">Giây Kết Thúc</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={clipEnd}
                      onChange={(e) => setClipEnd(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 focus:border-ucl-neon rounded-xl px-4 py-2.5 text-white outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Tag & Star ratings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-ucl-silver uppercase tracking-wider text-[10px]">Nhãn Phân Loại</label>
                    <select
                      value={clipTag}
                      onChange={(e) => setClipTag(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 focus:border-ucl-neon rounded-xl px-4 py-2.5 text-white outline-none transition-colors"
                    >
                      <option value="super-goal" className="bg-ucl-dark text-white">⚽ Siêu phẩm sút xa</option>
                      <option value="dribble" className="bg-ucl-dark text-white">⚡ Rê bóng đỉnh cao</option>
                      <option value="assist" className="bg-ucl-dark text-white">🎯 Kiến tạo dọn cỗ</option>
                      <option value="funny" className="bg-ucl-dark text-white">🤪 Tấu hài cực mạnh</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-ucl-silver uppercase tracking-wider text-[10px]">Độ Đẹp (Sao)</label>
                    <div className="flex gap-2 items-center h-10">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const score = idx + 1;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setClipRating(score)}
                            className="text-ucl-silver hover:scale-125 transition-transform"
                          >
                            <Star 
                              size={18} 
                              className={score <= clipRating ? "text-ucl-star fill-ucl-star" : "text-white/10"} 
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ucl-silver uppercase tracking-wider text-[10px]">Nhật Ký Trận Đấu / Kỷ Niệm</label>
                  <textarea
                    rows="2"
                    value={clipNotes}
                    onChange={(e) => setClipNotes(e.target.value)}
                    placeholder="Nhập thêm kỷ niệm (Trận bán kết kịch tính bù giờ, cả phòng hét toáng...)"
                    className="w-full bg-white/5 border border-white/5 focus:border-ucl-neon rounded-xl px-4 py-2.5 text-white outline-none transition-colors resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); if (videoRef.current) videoRef.current.play().then(() => setIsPlaying(true)); }}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white font-bold uppercase tracking-wider transition-all"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-ucl-blue to-ucl-star hover:scale-105 text-ucl-dark font-black uppercase tracking-wider rounded-xl transition-all shadow-lg"
                  >
                    KHẮC GHI KỶ NIỆM
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
