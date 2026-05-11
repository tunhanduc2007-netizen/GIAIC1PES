import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { cn, calculateStandings } from './lib/utils';
import { supabase } from './lib/supabase';

// --- COMPONENTS ---
import Dashboard from './components/Dashboard';
import Standings from './components/Standings';
import Players from './components/Players';
import MatchEntry from './components/MatchEntry';
import AdvancedWheel from './components/AdvancedWheel';
import TournamentManager from './components/TournamentManager';
import MatchHistory from './components/MatchHistory';
import Rewards from './components/Rewards';
import CustomTable from './components/CustomTable';
import BackupRestore from './components/BackupRestore';

const INITIAL_PLAYERS = [
  { id: '1', name: 'Tottenham', team: 'Tottenham', owner: 'Bu', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '2', name: 'Arsenal', team: 'Arsenal', owner: 'Thịnh', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '3', name: 'Man City', team: 'Man City', owner: 'Thịnh', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '4', name: 'Bayern', team: 'Bayern', owner: 'Bu', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '5', name: 'Newcastle', team: 'Newcastle', owner: 'Bu', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '6', name: 'Villarreal CF', team: 'Villarreal CF', owner: 'Thịnh', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '7', name: 'Man United', team: 'Man United', owner: 'Thịnh', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '8', name: 'PSV', team: 'PSV', owner: 'Bu', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '9', name: 'Olympic Lyon', team: 'Olympic Lyon', owner: 'Bu', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '10', name: 'Napoli', team: 'Napoli', owner: 'Thịnh', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '11', name: 'AC Milan', team: 'AC Milan', owner: 'Bu', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '12', name: 'Benfica', team: 'Benfica', owner: 'Thịnh', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '13', name: 'Real Betis', team: 'Real Betis', owner: 'Bu', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '14', name: 'Atletico', team: 'Atletico', owner: 'Thịnh', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '15', name: 'Real Madrid', team: 'Real Madrid', owner: 'Bu', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '16', name: 'Marshall', team: 'Marshall', owner: 'Thịnh', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
];

const INITIAL_MATCHES = [];
const INITIAL_CUSTOM_TABLES = [];

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] md:bottom-8 md:left-8 md:right-auto">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-3 flex items-center gap-4 bg-ucl-dark/90 backdrop-blur-2xl border-ucl-neon/30 shadow-[0_0_30px_rgba(0,242,255,0.2)]"
      >
        <audio ref={audioRef} loop src="/anthem.mp3" />
        <button 
          onClick={togglePlay}
          className={cn(
            "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all",
            isPlaying ? "bg-ucl-neon text-ucl-dark animate-pulse" : "bg-white/10 text-ucl-silver"
          )}
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <div className="pr-2 md:pr-4 hidden sm:block">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-ucl-neon">Now Playing</p>
          <p className="text-[10px] md:text-xs font-bold text-white truncate max-w-[100px] md:max-w-[150px]">Champions League Anthem</p>
        </div>
      </motion.div>
    </div>
  );
};

const ClockComponent = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
      <Clock className="text-ucl-neon" size={14} />
      <span className="text-[10px] font-black italic text-white tracking-tighter">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('pes_v8_players');
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('pes_v8_matches');
    const initial = saved ? JSON.parse(saved) : INITIAL_MATCHES;
    const seen = new Set();
    return initial.filter(m => {
      const key = m.id.startsWith('wheel_') ? `${m.teamA}_${m.teamB}_${m.date}` : m.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  const [tourneyMatches, setTourneyMatches] = useState(() => {
    const saved = localStorage.getItem('pes_v8_tourney');
    return saved ? JSON.parse(saved) : [];
  });

  const [customTables, setCustomTables] = useState(() => {
    const saved = localStorage.getItem('pes_v8_custom_tables');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_TABLES;
  });

  useEffect(() => {
    localStorage.setItem('pes_v8_players', JSON.stringify(players));
    localStorage.setItem('pes_v8_matches', JSON.stringify(matches));
    localStorage.setItem('pes_v8_tourney', JSON.stringify(tourneyMatches));
    localStorage.setItem('pes_v8_custom_tables', JSON.stringify(customTables));

    const syncData = async () => {
      try {
        if (!isLoading) {
          await Promise.all([
            supabase.from('players').upsert(players),
            supabase.from('matches').upsert(matches),
            supabase.from('tourney_matches').upsert(tourneyMatches),
            supabase.from('custom_tables').upsert(customTables)
          ]);
        }
      } catch (error) {
        console.error('Error syncing to Supabase:', error);
      }
    };
    syncData();
  }, [players, matches, tourneyMatches, customTables, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        if (pData && pData.length > 0) setPlayers(pData);
        if (mData && mData.length > 0) setMatches(mData);
        if (tData && tData.length > 0) setTourneyMatches(tData);
        if (cData && cData.length > 0) setCustomTables(cData);
      } catch (error) {
        console.error('Error fetching from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleTabChange = (e) => setActiveTab(e.detail);
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  const { standings, topScorers, topCards } = useMemo(() => calculateStandings(players, matches), [players, matches]);

  const handleMatchCreated = useCallback((newMatch) => {
    setTourneyMatches(prev => {
      if (prev.some(m => m.teamA === newMatch.teamA && m.teamB === newMatch.teamB && m.date === newMatch.date)) return prev;
      return [...prev, newMatch];
    });
  }, []);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'standings', name: 'Bảng xếp hạng', icon: Trophy },
    { id: 'players', name: 'Cầu thủ', icon: Shield },
    { id: 'wheel', name: 'Vòng quay', icon: RotateCw },
    { id: 'tourney', name: 'Cặp đấu & Nhánh', icon: Swords },
    { id: 'matches', name: 'Nhập kết quả', icon: Sword },
    { id: 'history', name: 'Lịch sử đấu', icon: History },
    { id: 'tables', name: 'Bảng tùy chỉnh', icon: TableIcon },
    { id: 'podium', name: 'Vinh danh', icon: Award },
    { id: 'sync', name: 'Sao lưu & Khôi phục', icon: RotateCw },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ucl-dark flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-ucl-neon border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(0,242,255,0.3)]" />
        <div className="text-center">
          <h2 className="text-2xl font-black italic text-white tracking-widest uppercase">ĐANG KẾT NỐI</h2>
          <p className="text-ucl-neon text-[10px] font-bold uppercase tracking-[0.3em] mt-2 animate-pulse">Syncing with Supabase Cloud</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ucl-dark overflow-hidden selection:bg-ucl-neon selection:text-ucl-dark">
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-ucl-dark/80 backdrop-blur-md z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Responsive Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-72 bg-ucl-dark/95 backdrop-blur-2xl border-r border-white/10 transition-transform duration-500 lg:relative lg:translate-x-0 lg:flex flex-col shadow-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-ucl-neon to-ucl-blue rounded-2xl flex items-center justify-center shadow-lg shadow-ucl-neon/20">
              <Trophy className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter leading-none">PES 2021</h1>
              <p className="text-[10px] font-black text-ucl-neon uppercase tracking-[0.2em]">Champions League</p>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="ml-auto lg:hidden p-2 text-ucl-silver hover:text-white"><X size={20} /></button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
            {navigation.map(item => (
              <button 
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all duration-300 group",
                  activeTab === item.id 
                    ? "bg-ucl-blue/40 text-ucl-neon border-l-4 border-ucl-neon" 
                    : "text-ucl-silver hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} className={cn("transition-transform group-hover:scale-110", activeTab === item.id && "text-ucl-neon")} />
                <span className="font-bold uppercase tracking-widest text-[10px]">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden bg-ucl-dark">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-ucl-dark/80 backdrop-blur-xl border-b border-white/10 p-3 md:p-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 bg-white/5 rounded-lg text-ucl-neon border border-ucl-neon/20 active:scale-90 transition-transform"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-[10px] md:text-sm font-black italic tracking-widest text-ucl-neon uppercase leading-none">UCL SEASON 2024</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-bold text-ucl-silver uppercase tracking-tighter">Tournament Live</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
             <ClockComponent />
             <div className="hidden md:flex -space-x-3">
               {players.slice(0, 3).map((p, i) => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-ucl-dark bg-ucl-blue flex items-center justify-center text-[10px] font-black italic text-white shadow-lg">
                   {p.name[0]}
                 </div>
               ))}
               <div className="w-8 h-8 rounded-full border-2 border-ucl-dark bg-white/10 flex items-center justify-center text-[10px] font-bold text-ucl-silver backdrop-blur-md">
                 +{players.length - 3}
               </div>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="responsive-container py-6 md:py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="gpu-accelerated"
              >
                {activeTab === 'dashboard' && (
                  <Dashboard players={players} matches={matches} standings={standings} topScorers={topScorers} topCards={topCards} onViewAllMatches={() => setActiveTab('history')} />
                )}
                {activeTab === 'standings' && <Standings standings={standings} topScorers={topScorers} topCards={topCards} />}
                {activeTab === 'players' && <Players players={players} setPlayers={setPlayers} />}
                {activeTab === 'matches' && <MatchEntry players={players} matches={matches} setMatches={setMatches} />}
                {activeTab === 'history' && <MatchHistory matches={matches} setMatches={setMatches} players={players} />}
                {activeTab === 'wheel' && <AdvancedWheel onMatchCreated={handleMatchCreated} />}
                {activeTab === 'tourney' && (
                  <TournamentManager tourneyMatches={tourneyMatches} setTourneyMatches={setTourneyMatches} matches={matches} setMatches={setMatches} players={players} />
                )}
                {activeTab === 'podium' && <Rewards standings={standings} />}
                {activeTab === 'tables' && <CustomTable customTables={customTables} setCustomTables={setCustomTables} />}
                {activeTab === 'sync' && (
                  <BackupRestore 
                    players={players} 
                    matches={matches} 
                    tourneyMatches={tourneyMatches} 
                    customTables={customTables}
                    setPlayers={setPlayers}
                    setMatches={setMatches}
                    setTourneyMatches={setTourneyMatches}
                    setCustomTables={setCustomTables}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <MusicPlayer />
    </div>
  );
}

export default App;
