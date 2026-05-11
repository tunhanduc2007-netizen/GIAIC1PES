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
  { id: '1', name: 'Tottenham', team: 'Tottenham', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '2', name: 'Arsenal', team: 'Arsenal', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '3', name: 'Man City', team: 'Man City', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '4', name: 'Bayern', team: 'Bayern', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '5', name: 'Newcastle', team: 'Newcastle', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '6', name: 'Villarreal CF', team: 'Villarreal CF', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '7', name: 'Man United', team: 'Man United', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '8', name: 'PSV', team: 'PSV', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '9', name: 'Olympic Lyon', team: 'Olympic Lyon', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '10', name: 'Napoli', team: 'Napoli', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '11', name: 'AC Milan', team: 'AC Milan', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '12', name: 'Benfica', team: 'Benfica', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '13', name: 'Real Betis', team: 'Real Betis', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '14', name: 'Atletico', team: 'Atletico', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '15', name: 'Real Madrid', team: 'Real Madrid', owner: 'BU', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { id: '16', name: 'Marshall', team: 'Marshall', owner: 'THỊNH', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
];

const INITIAL_MATCHES = [
  // ROUND 1
  { id: '1', playerAId: '1', playerBId: '2', teamA: 'Tottenham', teamB: 'Arsenal', scoreA: 4, scoreB: 4, date: '2026-05-11T10:00:01Z' },
  { id: '2', playerAId: '3', playerBId: '4', teamA: 'Man City', teamB: 'Bayern', scoreA: 2, scoreB: 5, date: '2026-05-11T10:00:02Z' },
  { id: '3', playerAId: '5', playerBId: '6', teamA: 'Newcastle', teamB: 'Villarreal CF', scoreA: 1, scoreB: 5, date: '2026-05-11T10:00:03Z' },
  { id: '4', playerAId: '7', playerBId: '8', teamA: 'Man United', teamB: 'PSV', scoreA: 3, scoreB: 4, date: '2026-05-11T10:00:04Z' },
  { id: '5', playerAId: '9', playerBId: '10', teamA: 'Olympic Lyon', teamB: 'Napoli', scoreA: 4, scoreB: 1, date: '2026-05-11T10:00:05Z' },
  { id: '6', playerAId: '11', playerBId: '12', teamA: 'AC Milan', teamB: 'Benfica', scoreA: 2, scoreB: 2, date: '2026-05-11T10:00:06Z' },
  { id: '7', playerAId: '13', playerBId: '14', teamA: 'Real Betis', teamB: 'Atletico', scoreA: 5, scoreB: 3, date: '2026-05-11T10:00:07Z' },
  { id: '8', playerAId: '15', playerBId: '16', teamA: 'Real Madrid', teamB: 'Marshall', scoreA: 2, scoreB: 1, date: '2026-05-11T10:00:08Z' },

  // ROUND 2
  { id: '9', playerAId: '10', playerBId: '11', teamA: 'Napoli', teamB: 'AC Milan', scoreA: 2, scoreB: 0, scorersA: 'Hojlund, Neres', date: '2026-05-11T11:00:01Z' },
  { id: '10', playerAId: '3', playerBId: '1', teamA: 'Man City', teamB: 'Tottenham', scoreA: 1, scoreB: 1, scorersA: 'Doku', scorersB: 'Kudus', date: '2026-05-11T11:00:02Z' },
  { id: '11', playerAId: '12', playerBId: '8', teamA: 'Benfica', teamB: 'PSV', scoreA: 0, scoreB: 1, scorersB: 'Diouech', yellowA: 'Otamendi', date: '2026-05-11T11:00:03Z' },
  { id: '12', playerAId: '2', playerBId: '13', teamA: 'Arsenal', teamB: 'Real Betis', scoreA: 0, scoreB: 0, date: '2026-05-11T11:00:04Z' },
  { id: '13', playerAId: '16', playerBId: '5', teamA: 'Marshall', teamB: 'Newcastle', scoreA: 2, scoreB: 2, scorersA: 'Traore, Paixao', scorersB: 'Wisa, Elanga', date: '2026-05-11T11:00:05Z' },
  { id: '14', playerAId: '6', playerBId: '9', teamA: 'Villarreal CF', teamB: 'Olympic Lyon', scoreA: 0, scoreB: 0, yellowA: 'Endrick, Niakate', date: '2026-05-11T11:00:06Z' },
  { id: '15', playerAId: '7', playerBId: '15', teamA: 'Man United', teamB: 'Real Madrid', scoreA: 3, scoreB: 1, scorersA: 'Mbeumo, Cunha x2', scorersB: 'Bellingham', date: '2026-05-11T11:00:07Z' },
  { id: '16', playerAId: '14', playerBId: '4', teamA: 'Atletico', teamB: 'Bayern', scoreA: 0, scoreB: 4, scorersB: 'Diaz, Olise, Kane, Goretzka', date: '2026-05-11T11:00:08Z' },
];

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
    <div className="fixed bottom-6 left-6 z-50">
      <audio ref={audioRef} loop src="/music.mp3" />
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay}
        className={cn(
          "flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all shadow-2xl",
          isPlaying 
            ? "bg-ucl-neon border-ucl-neon text-ucl-dark" 
            : "bg-ucl-dark/80 border-white/10 text-white"
        )}
      >
        <div className="relative">
          {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
          {isPlaying && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-ucl-dark rounded-full -z-10"
            />
          )}
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Now Playing</span>
          <span className="text-[10px] font-black uppercase tracking-tight">Champions League Anth...</span>
        </div>
      </motion.button>
    </div>
  );
};

const App = () => {
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

    const timeoutId = setTimeout(syncData, 2000);
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

        if (pData && pData.length > 0) setPlayers(pData);
        else setPlayers(INITIAL_PLAYERS);

        // NẠP LẠI DỮ LIỆU CHUẨN NẾU DATABASE KHÁC BIỆT
        if (mData && mData.length === 16) {
           setMatches(mData);
        } else {
           setMatches(INITIAL_MATCHES);
        }
        
        if (tData && tData.length > 0) setTourneyMatches(tData);
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

  const standings = useMemo(() => {
    const { standings: s, topScorers, topCards } = calculateStandings(players, matches);
    return { standings: s, topScorers, topCards };
  }, [players, matches]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'standings', label: 'Bảng xếp hạng', icon: Trophy },
    { id: 'players', label: 'Đội', icon: Shield },
    { id: 'wheel', label: 'Vòng quay', icon: RotateCw },
    { id: 'tournament', label: 'Cặp đấu & Nhánh', icon: Swords },
    { id: 'match-entry', label: 'Nhập kết quả', icon: Sword },
    { id: 'history', label: 'Lịch sử đấu', icon: History },
    { id: 'rewards', label: 'Vinh danh', icon: Award },
    { id: 'backup', label: 'Sao lưu & Khôi phục', icon: Settings },
  ];

  if (isLoading && !hasLoadedFromCloud) {
    return (
      <div className="min-h-screen bg-ucl-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-ucl-neon/20 rounded-full" />
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-ucl-neon rounded-full border-t-transparent animate-spin" />
            <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-ucl-neon" size={32} />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-ucl-neon font-black italic tracking-widest text-xl uppercase">Initial Sync</h2>
            <p className="text-ucl-silver text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse">Đang đồng bộ dữ liệu chuẩn...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ucl-dark text-white font-inter selection:bg-ucl-neon selection:text-ucl-dark overflow-x-hidden">
      <MusicPlayer />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-ucl-dark/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-ucl-neon rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.3)]">
             <Trophy className="text-ucl-dark" size={18} />
          </div>
          <span className="font-black italic text-lg tracking-tighter">UCL <span className="text-ucl-neon">PES</span></span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-xl text-ucl-neon">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-ucl-dark/40 backdrop-blur-3xl border-r border-white/5 z-50 transition-all duration-500",
        isSidebarOpen ? "w-72" : "w-24",
        "hidden lg:block"
      )}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-12">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-ucl-neon rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.4)] cursor-pointer"
            >
              <Trophy className="text-ucl-dark" size={24} />
            </motion.div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                <span className="font-black italic text-2xl tracking-tighter leading-none">PES 2021</span>
                <span className="text-ucl-neon text-[10px] font-black uppercase tracking-[0.2em] mt-1">Champions League</span>
              </motion.div>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 relative group",
                  activeTab === item.id 
                    ? "bg-ucl-neon text-ucl-dark shadow-[0_0_20px_rgba(0,242,255,0.2)]" 
                    : "text-ucl-silver hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={22} className={cn("shrink-0", activeTab === item.id ? "scale-110" : "group-hover:scale-110 transition-transform")} />
                {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                {activeTab === item.id && (
                  <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-8 bg-ucl-neon rounded-full" />
                )}
              </button>
            ))}
          </nav>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mt-auto p-4 rounded-2xl bg-white/5 text-ucl-silver hover:text-ucl-neon transition-colors flex items-center justify-center"
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
            className="fixed inset-0 bg-ucl-dark z-[60] lg:hidden p-8 flex flex-col"
          >
             <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-ucl-neon rounded-xl flex items-center justify-center">
                    <Trophy className="text-ucl-dark" size={20} />
                  </div>
                  <span className="font-black italic text-xl">UCL PES</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-xl text-ucl-neon">
                  <X size={24} />
                </button>
             </div>
             <nav className="flex-1 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-6 px-6 py-5 rounded-2xl transition-all",
                      activeTab === item.id ? "bg-ucl-neon text-ucl-dark" : "text-ucl-silver"
                    )}
                  >
                    <item.icon size={24} />
                    <span className="font-black text-lg uppercase italic tracking-tighter">{item.label}</span>
                  </button>
                ))}
             </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={cn(
        "transition-all duration-500 min-h-screen pt-24 lg:pt-12 px-6 md:px-12",
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
              {activeTab === 'players' && <Players players={players} setPlayers={setPlayers} />}
              {activeTab === 'match-entry' && <MatchEntry players={players} matches={matches} setMatches={setMatches} />}
              {activeTab === 'wheel' && <AdvancedWheel players={players} matches={matches} setMatches={setMatches} />}
              {activeTab === 'tournament' && (
                <TournamentManager 
                  tourneyMatches={tourneyMatches} 
                  setTourneyMatches={setTourneyMatches}
                  matches={matches}
                  setMatches={setMatches}
                  players={players}
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
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className={cn(
        "py-12 border-t border-white/5 transition-all duration-500",
        isSidebarOpen ? "lg:ml-72" : "lg:ml-24"
      )}>
        <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
             <Trophy className="text-ucl-neon" size={24} />
             <div className="flex flex-col">
                <span className="font-black italic text-lg tracking-tighter uppercase leading-none">UCL PES <span className="text-ucl-neon">MANAGER</span></span>
                <span className="text-[8px] font-bold uppercase tracking-[0.3em] mt-1">Official Tournament System</span>
             </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ucl-silver">
             Designed by <span className="text-ucl-neon">Antigravity AI</span> • 2026 Season
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
