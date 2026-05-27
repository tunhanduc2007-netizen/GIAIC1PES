import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Sword, 
  RotateCw, 
  Gift, 
  Table as TableIcon, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronRight,
  TrendingUp,
  User as UserIcon,
  Search,
  Star,
  Settings,
  Menu,
  X,
  Flame,
  Swords,
  Volume2,
  VolumeX,
  Music,
  Clock,
  History,
  Award,
  Shield,
  Film,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { cn, calculateStandings } from './lib/utils';
import { supabase } from './lib/supabase';

// --- COMPONENTS ---
import Dashboard from './components/Dashboard';
import Standings from './components/Standings';
import GroupStage from './components/GroupStage';
import Players from './components/Players';
import MatchEntry from './components/MatchEntry';
import AdvancedWheel from './components/AdvancedWheel';
import MatchHistory from './components/MatchHistory';
import Rewards from './components/Rewards';
import CustomTable from './components/CustomTable';
import BackupRestore from './components/BackupRestore';
import ParticlesBackground from './components/ParticlesBackground';
import Highlights from './components/Highlights';
import Jukebox from './components/Jukebox';

const INITIAL_PLAYERS = [
  // 24 đội của THỊNH
  { id: '1', name: 'Qatar', team: 'Qatar', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '2', name: 'Jordan', team: 'Jordan', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '3', name: 'Uzbekistan', team: 'Uzbekistan', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '4', name: 'Iran', team: 'Iran', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '5', name: 'Nhật Bản', team: 'Nhật Bản', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '6', name: 'DR Congo', team: 'DR Congo', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '7', name: 'Tunisia', team: 'Tunisia', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '8', name: 'Senegal', team: 'Senegal', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '9', name: 'Algeria', team: 'Algeria', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '10', name: 'Nam Phi', team: 'Nam Phi', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '11', name: 'Curaçao', team: 'Curaçao', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '12', name: 'Mexico', team: 'Mexico', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '13', name: 'Panama', team: 'Panama', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '14', name: 'Uruguay', team: 'Uruguay', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '15', name: 'Brazil', team: 'Brazil', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '16', name: 'Ecuador', team: 'Ecuador', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '17', name: 'Tây Ban Nha', team: 'Tây Ban Nha', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '18', name: 'Anh', team: 'Anh', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '19', name: 'Scotland', team: 'Scotland', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '20', name: 'Bỉ', team: 'Bỉ', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '21', name: 'Thổ Nhĩ Kỳ', team: 'Thổ Nhĩ Kỳ', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '22', name: 'Bosnia & Herzegovina', team: 'Bosnia & Herzegovina', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '23', name: 'Croatia', team: 'Croatia', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  
  // 24 đội của BU
  { id: '24', name: 'Iraq', team: 'Iraq', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '25', name: 'Australia', team: 'Australia', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '26', name: 'Saudi Arabia', team: 'Saudi Arabia', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '27', name: 'Hàn Quốc', team: 'Hàn Quốc', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '28', name: 'Ghana', team: 'Ghana', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '29', name: 'Cape Verde', team: 'Cape Verde', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '30', name: 'Bờ Biển Ngà', team: 'Bờ Biển Ngà', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '31', name: 'Maroc', team: 'Maroc', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '32', name: 'Ai Cập', team: 'Ai Cập', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '33', name: 'Haiti', team: 'Haiti', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '34', name: 'Mỹ', team: 'Mỹ', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '35', name: 'Canada', team: 'Canada', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '36', name: 'Đức', team: 'Đức', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '37', name: 'CH Séc', team: 'CH Séc', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '38', name: 'Hà Lan', team: 'Hà Lan', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '39', name: 'Pháp', team: 'Pháp', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '40', name: 'Thụy Sĩ', team: 'Thụy Sĩ', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '41', name: 'Áo', team: 'Áo', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '42', name: 'Na Uy', team: 'Na Uy', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '43', name: 'New Zealand', team: 'New Zealand', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '44', name: 'Bồ Đào Nha', team: 'Bồ Đào Nha', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '45', name: 'Colombia', team: 'Colombia', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '46', name: 'Thụy Điển', team: 'Thụy Điển', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '47', name: 'Paraguay', team: 'Paraguay', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '48', name: 'Argentina', team: 'Argentina', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
];

const INITIAL_MATCHES = [];

const App = () => {
  const [youtubePlaylist, setYoutubePlaylist] = useState([]);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const globalAudioRef = useRef(null);

  const fetchYoutubePlaylist = async () => {
    try {
      const response = await fetch('/api/playlist');
      if (response.ok) {
        const data = await response.json();
        setYoutubePlaylist(data);
      }
    } catch (e) {
      console.error("Error fetching jukebox playlist:", e);
    }
  };

  useEffect(() => {
    fetchYoutubePlaylist();
  }, []);

  const activePlaylist = useMemo(() => {
    const staticTracks = [
      { id: 'static-1', title: 'Magic in the Air', artist: 'Magic System', file: '/anthem.mp3', duration: 234, thumbnail: '/worldcup-bg.jpg' },
      { id: 'static-2', title: 'Raindance', artist: 'PES Raindance', file: '/raindance.mp3', duration: 247, thumbnail: '/worldcup-bg.jpg' }
    ];

    const downloadedTracks = youtubePlaylist.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      file: t.audioUrl,
      duration: t.duration,
      thumbnail: t.thumbnail
    }));

    return [...staticTracks, ...downloadedTracks];
  }, [youtubePlaylist]);

  const handlePlayTrackById = (trackId) => {
    const idx = activePlaylist.findIndex(t => t.id === trackId);
    if (idx !== -1) {
      setCurrentTrackIdx(idx);
      setIsAudioPlaying(true);
      if (globalAudioRef.current) {
        setTimeout(() => {
          if (globalAudioRef.current) {
            globalAudioRef.current.load();
            globalAudioRef.current.play().catch(err => console.log("Play error:", err));
          }
        }, 100);
      }
    }
  };

  const handleDeleteYoutubeTrack = async (id, title) => {
    if (id.startsWith('static-')) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa bài hát "${title}" khỏi danh sách?`)) return;
    try {
      const response = await fetch(`/api/playlist/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchYoutubePlaylist();
        setCurrentTrackIdx(0);
        setIsAudioPlaying(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sync times
  useEffect(() => {
    const audio = globalAudioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [globalAudioRef.current, currentTrackIdx]);

  // Load new source when track index changes
  useEffect(() => {
    if (globalAudioRef.current && isAudioPlaying) {
      globalAudioRef.current.load();
      globalAudioRef.current.play().catch(err => console.log('Play error:', err));
    }
  }, [currentTrackIdx]);

  const handleTogglePlay = () => {
    if (!globalAudioRef.current) return;
    if (isAudioPlaying) {
      globalAudioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      globalAudioRef.current.play().then(() => {
        setIsAudioPlaying(true);
      }).catch(err => console.log(err));
    }
  };

  const handleSeek = (val) => {
    setCurrentTime(val);
    if (globalAudioRef.current) {
      globalAudioRef.current.currentTime = val;
    }
  };

  const handlePlayNext = () => {
    const nextIdx = (currentTrackIdx + 1) % activePlaylist.length;
    setCurrentTrackIdx(nextIdx);
  };

  const handlePlayPrev = () => {
    const prevIdx = currentTrackIdx === 0 ? activePlaylist.length - 1 : currentTrackIdx - 1;
    setCurrentTrackIdx(prevIdx);
  };

  const handleTrackEnd = () => {
    handlePlayNext();
  };

  // Hiệu ứng confetti World Cup khi load trang
  useEffect(() => {
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#ff2a5f', '#00b8ff', '#ffffff', '#00ff7f'],
        shapes: ['circle', 'square'],
      });
    }, 800);
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedFromCloud, setHasLoadedFromCloud] = useState(false);
  const isInitialMount = useRef(true);

  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tourneyMatches, setTourneyMatches] = useState([]);
  const [customTables, setCustomTables] = useState([]);

  useEffect(() => {
    const syncData = async () => {
      if (!hasLoadedFromCloud || isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      
      try {
        if (!isLoading) {
          // Lưu vào LocalStorage làm dự phòng
          localStorage.setItem('pes_tourney_matches', JSON.stringify(tourneyMatches));
          localStorage.setItem('pes_matches', JSON.stringify(matches));
          
          await Promise.all([
            supabase.from('players').upsert(players),
            supabase.from('matches').upsert(matches),
            supabase.from('tourney_matches').upsert(tourneyMatches),
            supabase.from('custom_tables').upsert(customTables)
          ]);
        }
      } catch (error) {
        console.error('DEBUG SUPABASE Sync Error:', error);
      }
    };

    const timeoutId = setTimeout(syncData, 1000);
    return () => clearTimeout(timeoutId);
  }, [players, matches, tourneyMatches, customTables, isLoading, hasLoadedFromCloud]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [
          { data: pData },
          { data: mData },
          { data: tData },
          { data: cData }
        ] = await Promise.all([
          supabase.from('players').select('*'),
          supabase.from('matches').select('*'),
          supabase.from('tourney_matches').select('*'),
          supabase.from('custom_tables').select('*')
        ]);

        if (pData && pData.length > 0) {
          setPlayers(pData);
        } else {
          setPlayers(INITIAL_PLAYERS);
          await supabase.from('players').upsert(INITIAL_PLAYERS);
        }

        if (mData && mData.length > 0) {
          setMatches(mData);
        } else {
          setMatches(INITIAL_MATCHES);
          await supabase.from('matches').upsert(INITIAL_MATCHES);
        }
        
        if (tData && tData.length > 0) setTourneyMatches(tData);
        else {
          const localTourney = localStorage.getItem('pes_tourney_matches');
          if (localTourney) setTourneyMatches(JSON.parse(localTourney));
        }
        
        if (cData && cData.length > 0) setCustomTables(cData);
        
        setHasLoadedFromCloud(true);
      } catch (error) {
        console.error('Error fetching from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleChangeTab = (e) => {
      const tab = e.detail;
      if (tab === 'tourney') {
        setActiveTab('tournament');
      } else if (tab) {
        setActiveTab(tab);
      }
    };
    window.addEventListener('changeTab', handleChangeTab);
    return () => window.removeEventListener('changeTab', handleChangeTab);
  }, []);

  const standings = useMemo(() => {
    const { standings: s, topScorers, topCards } = calculateStandings(players, matches);
    return { standings: s, topScorers, topCards };
  }, [players, matches]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'standings', label: 'Bảng xếp hạng', icon: Trophy },
    { id: 'groupStage', label: 'Vòng bảng', icon: Users },
    { id: 'players', label: 'Đội tuyển', icon: Shield },
    { id: 'match-entry', label: 'Nhập kết quả', icon: Edit },
    { id: 'wheel', label: 'Vòng quay bốc thăm', icon: RotateCw },
    { id: 'history', label: 'Lịch sử đấu', icon: History },
    { id: 'rewards', label: 'Vinh danh', icon: Award },
    { id: 'highlights', label: 'Kỷ niệm PES', icon: Film },
    { id: 'jukebox', label: 'Nhạc YouTube', icon: Music },
    { id: 'backup', label: 'Sao lưu & Khôi phục', icon: Settings },
  ];

  if (isLoading && !hasLoadedFromCloud) {
    return (
      <div className="min-h-screen bg-ucl-dark flex items-center justify-center relative overflow-hidden">
        <ParticlesBackground />
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-ucl-neon/20 rounded-full" />
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-ucl-neon rounded-full border-t-transparent animate-spin" />
            <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-ucl-blue" size={32} />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-ucl-neon font-black italic tracking-widest text-xl uppercase">Full System Override</h2>
            <p className="text-ucl-silver text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse">Đang đồng bộ dữ liệu World Cup Tournament...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-poppins selection:bg-ucl-neon selection:text-white overflow-x-hidden relative">
      <ParticlesBackground />
      <audio ref={globalAudioRef} src={activePlaylist[currentTrackIdx]?.file} onEnded={handleTrackEnd} />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-ucl-dark/80 backdrop-blur-xl border-b border-white/5 z-[40] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-ucl-neon rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,42,95,0.4)]">
             <Trophy className="text-white" size={18} />
          </div>
          <span className="font-black italic text-lg tracking-tighter uppercase font-bebas">WORLD CUP <span className="text-ucl-neon">PES</span></span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-xl text-ucl-neon">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-black/20 backdrop-blur-3xl border-r border-white/5 z-[50] transition-all duration-500",
        isSidebarOpen ? "w-72" : "w-24",
        "hidden lg:block"
      )}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-12">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-ucl-neon rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,42,95,0.5)] cursor-pointer"
            >
              <Trophy className="text-white" size={24} />
            </motion.div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                <span className="font-black italic text-2xl tracking-tighter leading-none font-bebas text-white">FIFA WORLD CUP PES 2021</span>
                <span className="text-ucl-blue text-[10px] font-black uppercase tracking-[0.2em] mt-1 font-montserrat">Official Tournament</span>
              </motion.div>
            )}
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 relative group font-montserrat",
                  activeTab === item.id 
                    ? "bg-ucl-neon text-white shadow-[0_0_20px_rgba(255,42,95,0.3)] font-bold" 
                    : "text-ucl-silver hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", activeTab === item.id ? "scale-110 text-white" : "group-hover:scale-110 group-hover:text-ucl-neon transition-transform")} />
                {isSidebarOpen && <span className="text-xs uppercase tracking-wider font-bold">{item.label}</span>}
                {activeTab === item.id && (
                  <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-8 bg-ucl-blue rounded-full" />
                )}
              </button>
            ))}
          </nav>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mt-6 p-4 rounded-2xl bg-white/5 text-ucl-silver hover:text-ucl-neon transition-colors flex items-center justify-center shrink-0"
          >
            <ChevronRight className={cn("transition-transform duration-500", isSidebarOpen && "rotate-180")} />
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 bg-ucl-dark/95 backdrop-blur-xl z-[60] lg:hidden p-8 flex flex-col"
          >
             <div className="flex items-between justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-ucl-neon rounded-xl flex items-center justify-center">
                    <Trophy className="text-white" size={20} />
                  </div>
                  <span className="font-black italic text-xl font-bebas">WORLD CUP PES</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-xl text-ucl-neon">
                  <X size={24} />
                </button>
             </div>
             <nav className="flex-1 space-y-4 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-6 px-6 py-5 rounded-2xl transition-all font-montserrat",
                      activeTab === item.id ? "bg-ucl-neon text-white" : "text-ucl-silver"
                    )}
                  >
                    <item.icon size={24} />
                    <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
             </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={cn(
        "transition-all duration-500 min-h-screen pt-24 lg:pt-12 px-6 md:px-12 relative z-10",
        isSidebarOpen ? "lg:ml-72" : "lg:ml-24"
      )}>
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  players={players} 
                  matches={matches} 
                  standings={standings.standings}
                  topScorers={standings.topScorers}
                  onViewAllMatches={() => setActiveTab('history')}
                />
              )}
              {activeTab === 'standings' && (
                <Standings 
                  standings={standings.standings} 
                  topScorers={standings.topScorers}
                  topCards={standings.topCards}
                />
              )}
              {activeTab === 'groupStage' && (
                <GroupStage 
                  players={standings.standings} 
                />
              )}
              {activeTab === 'players' && <Players players={players} setPlayers={setPlayers} />}
              {activeTab === 'match-entry' && <MatchEntry players={players} matches={matches} setMatches={setMatches} />}
              {activeTab === 'wheel' && (
                <AdvancedWheel 
                  players={standings.standings}
                  onMatchCreated={(newMatch) => setTourneyMatches(prev => [newMatch, ...prev])} 
                />
              )}
              {activeTab === 'history' && <MatchHistory matches={matches} setMatches={setMatches} players={players} />}
              {activeTab === 'rewards' && <Rewards standings={standings.standings} players={players} />}
              {activeTab === 'backup' && (
                <BackupRestore 
                  players={players} setPlayers={setPlayers}
                  matches={matches} setMatches={setMatches}
                  tourneyMatches={tourneyMatches} setTourneyMatches={setTourneyMatches}
                  customTables={customTables} setCustomTables={setCustomTables}
                />
              )}
              {activeTab === 'highlights' && <Highlights />}
              {activeTab === 'jukebox' && (
                <Jukebox 
                  playlist={activePlaylist}
                  currentTrackIndex={currentTrackIdx}
                  isPlaying={isAudioPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  onPlayTrack={handlePlayTrackById}
                  onDeleteTrack={handleDeleteYoutubeTrack}
                  onPlaylistUpdated={fetchYoutubePlaylist}
                  onTogglePlay={handleTogglePlay}
                  onSeek={handleSeek}
                  onNext={handlePlayNext}
                  onPrev={handlePlayPrev}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className={cn(
        "py-12 border-t border-white/5 transition-all duration-500 relative z-10",
        isSidebarOpen ? "lg:ml-72" : "lg:ml-24"
      )}>
        <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
             <Trophy className="text-ucl-blue animate-bounce" size={24} />
             <div className="flex flex-col">
                <span className="font-black italic text-lg tracking-tighter uppercase leading-none font-bebas">WORLD CUP <span className="text-ucl-neon">MANAGER</span></span>
                <span className="text-[8px] font-bold uppercase tracking-[0.3em] mt-1 font-montserrat">Official Tournament System</span>
             </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ucl-silver font-montserrat">
             Designed by <span className="text-ucl-neon font-black">TNDUCK</span> • 2026 Season
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
