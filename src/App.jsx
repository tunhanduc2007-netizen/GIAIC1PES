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
  SkipForward,
  GitFork
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { cn, calculateStandings } from './lib/utils';
import { supabase } from './lib/supabase';

// --- COMPONENTS ---
import Dashboard from './components/Dashboard';
import Standings from './components/Standings';
import GroupStage from './components/GroupStage';
import KnockoutBracket from './components/KnockoutBracket';
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
import Qualifiers from './components/Qualifiers';
import LoadingScreen from './components/LoadingScreen';

const INITIAL_PLAYERS = [
  // 🔴 14 đội của THỊNH
  { id: '1', name: 'Arsenal', team: 'Arsenal', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '2', name: 'Chelsea', team: 'Chelsea', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '3', name: 'Manchester City', team: 'Manchester City', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '4', name: 'Barcelona', team: 'Barcelona', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '5', name: 'Real Madrid', team: 'Real Madrid', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '6', name: 'Atlético Madrid', team: 'Atlético Madrid', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '7', name: 'Roma', team: 'Roma', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '8', name: 'Inter Milan', team: 'Inter Milan', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '9', name: 'Stuttgart', team: 'Stuttgart', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '10', name: 'Borussia Dortmund', team: 'Borussia Dortmund', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '11', name: 'Paris Saint-Germain', team: 'Paris Saint-Germain', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '12', name: 'Lens', team: 'Lens', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '13', name: 'Galatasaray', team: 'Galatasaray', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '14', name: 'Fenerbahçe', team: 'Fenerbahçe', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },

  // 🔵 14 đội của BU
  { id: '15', name: 'Manchester United', team: 'Manchester United', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '16', name: 'Liverpool', team: 'Liverpool', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '17', name: 'Aston Villa', team: 'Aston Villa', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '18', name: 'Athletic Bilbao', team: 'Athletic Bilbao', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '19', name: 'Real Betis', team: 'Real Betis', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '20', name: 'Villarreal', team: 'Villarreal', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '21', name: 'Como', team: 'Como', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '22', name: 'Napoli', team: 'Napoli', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '23', name: 'RB Leipzig', team: 'RB Leipzig', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '24', name: 'Bayern Munich', team: 'Bayern Munich', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '25', name: 'Lyon', team: 'Lyon', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '26', name: 'Lille', team: 'Lille', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '27', name: 'Porto', team: 'Porto', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '28', name: 'Sporting CP', team: 'Sporting CP', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
];

const INITIAL_MATCHES = [];

const App = () => {
  const [deletedStaticTracks, setDeletedStaticTracks] = useState(() => {
    try {
      const saved = localStorage.getItem('deleted_static_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

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
    ].filter(t => !deletedStaticTracks.includes(t.id));

    const downloadedTracks = youtubePlaylist.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      file: t.audioUrl,
      duration: t.duration,
      thumbnail: t.thumbnail
    }));

    return [...staticTracks, ...downloadedTracks];
  }, [youtubePlaylist, deletedStaticTracks]);

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
    if (id.startsWith('static-')) {
      if (!confirm(`Bạn có chắc chắn muốn xóa bài hát mặc định "${title}" khỏi danh sách phát?`)) return;
      const updated = [...deletedStaticTracks, id];
      setDeletedStaticTracks(updated);
      localStorage.setItem('deleted_static_tracks', JSON.stringify(updated));
      setCurrentTrackIdx(0);
      setIsAudioPlaying(false);
      return;
    }

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
          // Lưu vào LocalStorage
          localStorage.setItem('pes_players', JSON.stringify(players));
          localStorage.setItem('pes_tourney_matches', JSON.stringify(tourneyMatches));
          localStorage.setItem('pes_matches', JSON.stringify(matches));
          localStorage.setItem('pes_custom_tables', JSON.stringify(customTables));
          localStorage.setItem('pes_tourney_edition', 'c1_pes_28');
          
          try {
            await Promise.allSettled([
              supabase.from('players').upsert(players),
              supabase.from('matches').upsert(matches),
              supabase.from('tourney_matches').upsert(tourneyMatches),
              supabase.from('custom_tables').upsert(customTables)
            ]);
          } catch (cloudErr) {
            // Cloud sync fails silently, local is preserved
          }
        }
      } catch (error) {
        console.error('DEBUG Sync Error:', error);
      }
    };

    const timeoutId = setTimeout(syncData, 1000);
    return () => clearTimeout(timeoutId);
  }, [players, matches, tourneyMatches, customTables, isLoading, hasLoadedFromCloud]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Kiểm tra phiên bản giải đấu: nếu chưa được làm sạch, xóa sạch dữ liệu mẫu
        const currentEdition = localStorage.getItem('pes_tourney_edition');
        const needsReset = currentEdition !== 'c1_pes_28_clean_v4';

        if (needsReset) {
          localStorage.removeItem('pes_players');
          localStorage.removeItem('pes_matches');
          localStorage.removeItem('pes_tourney_matches');
          localStorage.removeItem('pes_custom_tables');
          localStorage.removeItem('pes_c1_league_fixtures');
          localStorage.removeItem('pes_c1_knockout_bracket');
          localStorage.setItem('pes_tourney_edition', 'c1_pes_28_clean_v4');
          localStorage.setItem('pes_players', JSON.stringify(INITIAL_PLAYERS));
          localStorage.setItem('pes_matches', JSON.stringify([]));
          localStorage.setItem('pes_tourney_matches', JSON.stringify([]));

          setPlayers(INITIAL_PLAYERS);
          setMatches([]);
          setTourneyMatches([]);
          setCustomTables([]);
          setHasLoadedFromCloud(true);

          // Cố gắng dọn sạch trên Cloud nếu có kết nối
          try {
            await Promise.race([
              Promise.allSettled([
                supabase.from('matches').delete().neq('id', 'clear_all_wc'),
                supabase.from('tourney_matches').delete().neq('id', 'clear_all_wc'),
                supabase.from('players').delete().neq('id', 'clear_all_wc'),
                supabase.from('players').upsert(INITIAL_PLAYERS)
              ]),
              new Promise((res) => setTimeout(res, 500))
            ]);
          } catch (e) {
            // ignore cloud error
          }
          return;
        }

        // Tải từ LocalStorage TRƯỚC TIÊN NGAY LẬP TỨC (0ms)
        const isOldData = (list) => Array.isArray(list) && list.some(item => 
          ['qatar', 'jordan', 'uzbekistan', 'iran', 'brazil', 'haiti', 'curaçao', 'dr congo'].includes((item.name || '').toLowerCase())
        );

        const localP = localStorage.getItem('pes_players');
        if (localP) {
          try {
            const parsed = JSON.parse(localP);
            setPlayers(isOldData(parsed) ? INITIAL_PLAYERS : parsed);
          } catch (e) {
            setPlayers(INITIAL_PLAYERS);
          }
        } else {
          setPlayers(INITIAL_PLAYERS);
        }

        const localM = localStorage.getItem('pes_matches');
        if (localM) {
          try {
            setMatches(JSON.parse(localM));
          } catch (e) {
            setMatches(INITIAL_MATCHES);
          }
        } else {
          setMatches(INITIAL_MATCHES);
        }
        
        const localTourney = localStorage.getItem('pes_tourney_matches');
        if (localTourney) {
          try {
            setTourneyMatches(JSON.parse(localTourney));
          } catch (e) {
            setTourneyMatches([]);
          }
        } else {
          setTourneyMatches([]);
        }
        
        const localC = localStorage.getItem('pes_custom_tables');
        if (localC) {
          try {
            setCustomTables(JSON.parse(localC));
          } catch (e) {
            setCustomTables([]);
          }
        } else {
          setCustomTables([]);
        }

        // Đồng bộ ngầm với Supabase với timeout 500ms, không bao giờ chặn hay gây treo ứng dụng
        try {
          const cloudPromise = Promise.allSettled([
            supabase.from('players').select('*'),
            supabase.from('matches').select('*'),
            supabase.from('tourney_matches').select('*'),
            supabase.from('custom_tables').select('*')
          ]);
          const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), 500));
          const result = await Promise.race([cloudPromise, timeoutPromise]);
          
          if (result !== 'TIMEOUT' && Array.isArray(result)) {
            if (result[0].status === 'fulfilled' && result[0].value?.data?.length > 0 && !isOldData(result[0].value.data)) {
              setPlayers(result[0].value.data);
            }
            if (result[1].status === 'fulfilled' && result[1].value?.data?.length > 0 && !isOldData(result[1].value.data)) {
              setMatches(result[1].value.data);
            }
            if (result[2].status === 'fulfilled' && result[2].value?.data?.length > 0) {
              setTourneyMatches(result[2].value.data);
            }
            if (result[3].status === 'fulfilled' && result[3].value?.data?.length > 0) {
              setCustomTables(result[3].value.data);
            }
          }
        } catch (cloudFetchErr) {
          console.warn('Supabase offline or unreachable, using local storage mode');
        }

        setHasLoadedFromCloud(true);
      } catch (error) {
        console.error('Error fetching data:', error);
        setPlayers(INITIAL_PLAYERS);
      }
    };
    fetchData();

    // Fallback safeguard: đảm bảo trang không bao giờ bị kẹt loading quá 2.2 giây
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);
    return () => clearTimeout(fallbackTimer);
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

  const menuSections = [
    {
      title: "Tổng quan",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: "Giải đấu",
      items: [
        { id: 'qualifiers', label: 'Vòng loại', icon: Swords },
        { id: 'groupStage', label: 'Vòng bảng', icon: Users },
        { id: 'knockout', label: 'Nhánh Knock-out', icon: GitFork },
        { id: 'standings', label: 'Bảng xếp hạng', icon: Trophy },
        { id: 'history', label: 'Lịch sử đấu', icon: History },
      ]
    },
    {
      title: "Điều hành",
      items: [
        { id: 'match-entry', label: 'Nhập kết quả', icon: Edit },
        { id: 'players', label: 'Đội tuyển', icon: Shield },
        { id: 'wheel', label: 'Vòng quay bốc thăm', icon: RotateCw },
      ]
    },
    {
      title: "Giải trí & Kỷ niệm",
      items: [
        { id: 'rewards', label: 'Vinh danh', icon: Award },
        { id: 'highlights', label: 'Kỷ niệm PES', icon: Film },
        { id: 'jukebox', label: 'Nhạc YouTube', icon: Music },
      ]
    },
    {
      title: "Hệ thống",
      items: [
        { id: 'backup', label: 'Sao lưu & Khôi phục', icon: Settings },
      ]
    }
  ];

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen text-white font-poppins selection:bg-ucl-neon selection:text-white overflow-x-hidden relative">
      <ParticlesBackground />
      <audio ref={globalAudioRef} src={activePlaylist[currentTrackIdx]?.file} onEnded={handleTrackEnd} />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#030814]/90 backdrop-blur-2xl border-b border-white/10 z-[40] flex items-center justify-between px-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0056b3] via-[#00f2ff] to-[#ffd700] flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.5)]">
             <Trophy className="text-black" size={16} />
          </div>
          <span className="font-black italic text-lg tracking-tighter uppercase font-bebas text-white">CHAMPIONS LEAGUE <span className="text-[#00f2ff]">C1</span></span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-xl text-[#00f2ff] hover:bg-white/10 transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-[#020713]/85 backdrop-blur-3xl border-r border-white/10 z-[50] transition-all duration-500 shadow-2xl",
        isSidebarOpen ? "w-72" : "w-24",
        "hidden lg:block"
      )}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#003d80] via-[#00f2ff] to-[#ffd700] flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.55)] cursor-pointer shrink-0 border border-white/20"
            >
              <Trophy className="text-black" size={24} />
            </motion.div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                <span className="font-black italic text-2xl tracking-tighter leading-none font-bebas text-white">UEFA CHAMPIONS LEAGUE</span>
                <span className="text-[#00f2ff] text-[10px] font-black uppercase tracking-[0.2em] mt-1 font-montserrat">PES 2021 C1 TOURNAMENT</span>
              </motion.div>
            )}
          </div>

          <nav className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1">
            {menuSections.map((section, sectionIdx) => (
              <div key={section.title} className="space-y-1">
                {isSidebarOpen ? (
                  <div className={cn(
                    "text-[10px] font-black text-[#00f2ff]/70 uppercase tracking-[0.25em] px-4 mb-2 select-none font-mono",
                    sectionIdx > 0 ? "mt-5" : "mt-1"
                  )}>
                    {section.title}
                  </div>
                ) : (
                  sectionIdx > 0 && <div className="h-[1px] bg-white/10 my-3 mx-4" />
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group font-montserrat",
                        activeTab === item.id 
                          ? "bg-gradient-to-r from-[#00f2ff] to-[#0084ff] text-black shadow-[0_0_20px_rgba(0,242,255,0.45)] font-black" 
                          : "text-ucl-silver hover:text-white hover:bg-white/5"
                      )}
                    >
                      <item.icon size={18} className={cn("shrink-0 transition-transform", activeTab === item.id ? "scale-110 text-black" : "group-hover:scale-110 group-hover:text-[#00f2ff]")} />
                      {isSidebarOpen && <span className="text-[11px] uppercase tracking-wider font-bold truncate">{item.label}</span>}
                      {activeTab === item.id && (
                        <motion.div layoutId="nav-pill" className="absolute left-0 w-1.5 h-6 bg-[#ffd700] rounded-full shadow-[0_0_10px_#ffd700]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
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
            className="fixed inset-0 bg-[#020713]/95 backdrop-blur-2xl z-[60] lg:hidden p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-tr from-[#0056b3] via-[#00f2ff] to-[#ffd700] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)]">
                  <Trophy className="text-black" size={20} />
                </div>
                <span className="font-black italic text-xl font-bebas text-white">CHAMPIONS LEAGUE <span className="text-[#00f2ff]">C1</span></span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-xl text-[#00f2ff]">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
              {menuSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <div className="text-[10px] font-black text-[#00f2ff]/70 uppercase tracking-[0.25em] px-4 select-none font-mono">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-5 px-5 py-3.5 rounded-xl transition-all font-montserrat",
                          activeTab === item.id 
                            ? "bg-gradient-to-r from-[#00f2ff] to-[#0084ff] text-black shadow-[0_0_20px_rgba(0,242,255,0.4)] font-black" 
                            : "text-ucl-silver hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <item.icon size={20} className={activeTab === item.id ? "text-black" : "text-[#00f2ff]"} />
                        <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
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
              {activeTab === 'qualifiers' && (
                <Qualifiers 
                  players={players}
                  setPlayers={setPlayers}
                  matches={matches}
                  setMatches={setMatches}
                  setActiveTab={setActiveTab}
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
                  rawPlayers={players}
                  matches={matches}
                  setMatches={setMatches}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'knockout' && (
                <KnockoutBracket 
                  players={standings.standings} 
                  rawPlayers={players}
                  matches={matches} 
                  setMatches={setMatches}
                  setActiveTab={setActiveTab}
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
                <span className="font-black italic text-lg tracking-tighter uppercase leading-none font-bebas">UEFA CHAMPIONS LEAGUE <span className="text-ucl-neon">MANAGER</span></span>
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
