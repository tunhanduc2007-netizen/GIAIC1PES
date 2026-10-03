import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Swords, 
  Shuffle, 
  RotateCcw, 
  Save, 
  Edit3, 
  X, 
  Check, 
  Sparkles, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Users,
  Shield,
  Medal,
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn, getTeamLogo } from '../lib/utils';
import { supabase } from '../lib/supabase';

// Danh sách đội Thịnh & Bu
const THINH_TEAMS = [
  'Arsenal', 'Chelsea', 'Manchester City', 'Barcelona', 'Real Madrid',
  'Atlético Madrid', 'Roma', 'Inter Milan', 'Stuttgart', 'Borussia Dortmund',
  'Paris Saint-Germain', 'Lens', 'Galatasaray', 'Fenerbahçe'
];

const BU_TEAMS = [
  'Manchester United', 'Liverpool', 'Aston Villa', 'Athletic Bilbao',
  'Real Betis', 'Villarreal', 'Como', 'Napoli', 'RB Leipzig',
  'Bayern Munich', 'Lyon', 'Lille', 'Porto', 'Sporting CP'
];

const getTeamOwner = (teamName) => {
  if (!teamName) return '';
  const clean = teamName.trim().toLowerCase();
  const isThinh = THINH_TEAMS.some(t => t.toLowerCase() === clean || clean.includes(t.toLowerCase()) || t.toLowerCase().includes(clean));
  if (isThinh) return 'THỊNH';
  const isBu = BU_TEAMS.some(t => t.toLowerCase() === clean || clean.includes(t.toLowerCase()) || t.toLowerCase().includes(clean));
  if (isBu) return 'BU';
  return '';
};

// Cấu hình cây 8 đội (Tứ kết -> Bán kết -> Chung kết)
const DEFAULT_BRACKET_8 = {
  format: '8_teams',
  matches: [
    // Tứ kết
    { id: 'qf1', round: 'qf', name: 'Tứ kết 1 (Hạng 1 vs 8)', teamA: 'Hạng 1 (Vòng bảng)', teamB: 'Hạng 8 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf1', nextSlot: 'teamA' },
    { id: 'qf2', round: 'qf', name: 'Tứ kết 2 (Hạng 2 vs 7)', teamA: 'Hạng 2 (Vòng bảng)', teamB: 'Hạng 7 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf1', nextSlot: 'teamB' },
    { id: 'qf3', round: 'qf', name: 'Tứ kết 3 (Hạng 3 vs 6)', teamA: 'Hạng 3 (Vòng bảng)', teamB: 'Hạng 6 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf2', nextSlot: 'teamA' },
    { id: 'qf4', round: 'qf', name: 'Tứ kết 4 (Hạng 4 vs 5)', teamA: 'Hạng 4 (Vòng bảng)', teamB: 'Hạng 5 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf2', nextSlot: 'teamB' },
    
    // Bán kết
    { id: 'sf1', round: 'sf', name: 'Bán kết 1', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'final', nextSlot: 'teamA', loserId: 'third', loserSlot: 'teamA' },
    { id: 'sf2', round: 'sf', name: 'Bán kết 2', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'final', nextSlot: 'teamB', loserId: 'third', loserSlot: 'teamB' },
    
    // Chung kết & Tranh Hạng 3
    { id: 'final', round: 'final', name: 'Chung kết C1', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, isChampionship: true },
    { id: 'third', round: 'third', name: 'Tranh Hạng 3', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null }
  ]
};

// Cấu hình cây 16 đội (Vòng 1/8 -> Tứ kết -> Bán kết -> Chung kết)
const DEFAULT_BRACKET_16 = {
  format: '16_teams',
  matches: [
    // Vòng 1/8
    { id: 'r16_1', round: 'r16', name: 'Vòng 1/8 - 1 (Hạng 1 vs 16)', teamA: 'Hạng 1 (Vòng bảng)', teamB: 'Hạng 16 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf1', nextSlot: 'teamA' },
    { id: 'r16_2', round: 'r16', name: 'Vòng 1/8 - 2 (Hạng 2 vs 15)', teamA: 'Hạng 2 (Vòng bảng)', teamB: 'Hạng 15 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf1', nextSlot: 'teamB' },
    { id: 'r16_3', round: 'r16', name: 'Vòng 1/8 - 3 (Hạng 3 vs 14)', teamA: 'Hạng 3 (Vòng bảng)', teamB: 'Hạng 14 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf2', nextSlot: 'teamA' },
    { id: 'r16_4', round: 'r16', name: 'Vòng 1/8 - 4 (Hạng 4 vs 13)', teamA: 'Hạng 4 (Vòng bảng)', teamB: 'Hạng 13 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf2', nextSlot: 'teamB' },
    { id: 'r16_5', round: 'r16', name: 'Vòng 1/8 - 5 (Hạng 5 vs 12)', teamA: 'Hạng 5 (Vòng bảng)', teamB: 'Hạng 12 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf3', nextSlot: 'teamA' },
    { id: 'r16_6', round: 'r16', name: 'Vòng 1/8 - 6 (Hạng 6 vs 11)', teamA: 'Hạng 6 (Vòng bảng)', teamB: 'Hạng 11 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf3', nextSlot: 'teamB' },
    { id: 'r16_7', round: 'r16', name: 'Vòng 1/8 - 7 (Hạng 7 vs 10)', teamA: 'Hạng 7 (Vòng bảng)', teamB: 'Hạng 10 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf4', nextSlot: 'teamA' },
    { id: 'r16_8', round: 'r16', name: 'Vòng 1/8 - 8 (Hạng 8 vs 9)', teamA: 'Hạng 8 (Vòng bảng)', teamB: 'Hạng 9 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf4', nextSlot: 'teamB' },

    // Tứ kết
    { id: 'qf1', round: 'qf', name: 'Tứ kết 1', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf1', nextSlot: 'teamA' },
    { id: 'qf2', round: 'qf', name: 'Tứ kết 2', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf1', nextSlot: 'teamB' },
    { id: 'qf3', round: 'qf', name: 'Tứ kết 3', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf2', nextSlot: 'teamA' },
    { id: 'qf4', round: 'qf', name: 'Tứ kết 4', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf2', nextSlot: 'teamB' },

    // Bán kết
    { id: 'sf1', round: 'sf', name: 'Bán kết 1', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'final', nextSlot: 'teamA', loserId: 'third', loserSlot: 'teamA' },
    { id: 'sf2', round: 'sf', name: 'Bán kết 2', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'final', nextSlot: 'teamB', loserId: 'third', loserSlot: 'teamB' },

    // Chung kết & Tranh Hạng 3
    { id: 'final', round: 'final', name: 'Chung kết C1', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, isChampionship: true },
    { id: 'third', round: 'third', name: 'Tranh Hạng 3', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null }
  ]
};

// Cấu hình cây 20 đội (Play-off 4 cặp -> Vòng 1/8 -> Tứ kết -> Bán kết -> Chung kết)
const DEFAULT_BRACKET_20 = {
  format: '20_teams',
  matches: [
    // 4 CẶP PLAY-OFF TRANH 4 VÉ VÀO 1/8 (Dành cho hạng 13 đến 20)
    { id: 'po1', round: 'playoff', name: 'Play-off 1 (Hạng 13 vs 20)', teamA: 'Hạng 13 (Vòng bảng)', teamB: 'Hạng 20 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'r16_4', nextSlot: 'teamB' },
    { id: 'po2', round: 'playoff', name: 'Play-off 2 (Hạng 14 vs 19)', teamA: 'Hạng 14 (Vòng bảng)', teamB: 'Hạng 19 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'r16_3', nextSlot: 'teamB' },
    { id: 'po3', round: 'playoff', name: 'Play-off 3 (Hạng 15 vs 18)', teamA: 'Hạng 15 (Vòng bảng)', teamB: 'Hạng 18 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'r16_2', nextSlot: 'teamB' },
    { id: 'po4', round: 'playoff', name: 'Play-off 4 (Hạng 16 vs 17)', teamA: 'Hạng 16 (Vòng bảng)', teamB: 'Hạng 17 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'r16_1', nextSlot: 'teamB' },

    // VÒNG 1/8 (8 CẶP ĐẤU: TOP 1-12 + 4 ĐỘI THẮNG PLAY-OFF)
    { id: 'r16_1', round: 'r16', name: 'Vòng 1/8 - 1 (Hạng 1 vs Thắng PO 4)', teamA: 'Hạng 1 (Vòng bảng)', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf1', nextSlot: 'teamA' },
    { id: 'r16_2', round: 'r16', name: 'Vòng 1/8 - 2 (Hạng 2 vs Thắng PO 3)', teamA: 'Hạng 2 (Vòng bảng)', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf1', nextSlot: 'teamB' },
    { id: 'r16_3', round: 'r16', name: 'Vòng 1/8 - 3 (Hạng 3 vs Thắng PO 2)', teamA: 'Hạng 3 (Vòng bảng)', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf2', nextSlot: 'teamA' },
    { id: 'r16_4', round: 'r16', name: 'Vòng 1/8 - 4 (Hạng 4 vs Thắng PO 1)', teamA: 'Hạng 4 (Vòng bảng)', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf2', nextSlot: 'teamB' },
    { id: 'r16_5', round: 'r16', name: 'Vòng 1/8 - 5 (Hạng 5 vs Hạng 12)', teamA: 'Hạng 5 (Vòng bảng)', teamB: 'Hạng 12 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf3', nextSlot: 'teamA' },
    { id: 'r16_6', round: 'r16', name: 'Vòng 1/8 - 6 (Hạng 6 vs Hạng 11)', teamA: 'Hạng 6 (Vòng bảng)', teamB: 'Hạng 11 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf3', nextSlot: 'teamB' },
    { id: 'r16_7', round: 'r16', name: 'Vòng 1/8 - 7 (Hạng 7 vs Hạng 10)', teamA: 'Hạng 7 (Vòng bảng)', teamB: 'Hạng 10 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf4', nextSlot: 'teamA' },
    { id: 'r16_8', round: 'r16', name: 'Vòng 1/8 - 8 (Hạng 8 vs Hạng 9)', teamA: 'Hạng 8 (Vòng bảng)', teamB: 'Hạng 9 (Vòng bảng)', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf4', nextSlot: 'teamB' },

    // TỨ KẾT (4 CẶP ĐẤU)
    { id: 'qf1', round: 'qf', name: 'Tứ kết 1', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf1', nextSlot: 'teamA' },
    { id: 'qf2', round: 'qf', name: 'Tứ kết 2', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf1', nextSlot: 'teamB' },
    { id: 'qf3', round: 'qf', name: 'Tứ kết 3', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf2', nextSlot: 'teamA' },
    { id: 'qf4', round: 'qf', name: 'Tứ kết 4', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf2', nextSlot: 'teamB' },

    // BÁN KẾT (2 CẶP ĐẤU)
    { id: 'sf1', round: 'sf', name: 'Bán kết 1', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'final', nextSlot: 'teamA', loserId: 'third', loserSlot: 'teamA' },
    { id: 'sf2', round: 'sf', name: 'Bán kết 2', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'final', nextSlot: 'teamB', loserId: 'third', loserSlot: 'teamB' },

    // CHUNG KẾT & TRANH HẠNG 3
    { id: 'final', round: 'final', name: 'Chung kết C1', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, isChampionship: true },
    { id: 'third', round: 'third', name: 'Tranh Hạng 3', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null }
  ]
};

const KnockoutBracket = ({ players = [], matches = [], setMatches, onMatchHistoryAdd, setActiveTab }) => {
  const [bracketData, setBracketData] = useState(() => {
    try {
      const saved = localStorage.getItem('pes_c1_knockout_bracket');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.matches && parsed.matches.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_BRACKET_20;
  });

  const [format, setFormat] = useState(() => {
    try {
      const saved = localStorage.getItem('pes_c1_knockout_bracket');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.format) return parsed.format;
      }
    } catch (e) {}
    return '20_teams';
  });

  const [activeTabRound, setActiveTabRound] = useState('all'); // 'all', 'playoff', 'r16', 'qf', 'sf', 'final'
  const [editingMatch, setEditingMatch] = useState(null);
  const [scoreAInput, setScoreAInput] = useState('');
  const [scoreBInput, setScoreBInput] = useState('');
  const [penAInput, setPenAInput] = useState('');
  const [penBInput, setPenBInput] = useState('');
  const [zoomScale, setZoomScale] = useState(1);
  const containerRef = useRef(null);

  // Sync format changes
  useEffect(() => {
    if (bracketData.format !== format) {
      let template = DEFAULT_BRACKET_20;
      if (format === '16_teams') template = DEFAULT_BRACKET_16;
      else if (format === '8_teams') template = DEFAULT_BRACKET_8;
      setBracketData(template);
    }
  }, [format]);

  // Đẩy cây Knock-out lên Supabase Cloud để các máy khác cập nhật
  const pushBracketToCloud = async (dataToPush) => {
    if (!dataToPush || !dataToPush.matches) return;
    try {
      await supabase.from('custom_tables').upsert({
        id: 'pes_c1_knockout_bracket_sync',
        name: 'Cây Knock-out C1 20 Đội',
        headers: ['bracket_json'],
        rows: [[JSON.stringify(dataToPush)]]
      });
    } catch (e) {
      console.warn('Lỗi push cloud bracket:', e);
    }
  };

  // Đồng bộ Realtime Cây Knock-out từ Cloud giữa các máy
  useEffect(() => {
    const fetchCloudBracket = async () => {
      try {
        const { data } = await supabase.from('custom_tables').select('*').eq('id', 'pes_c1_knockout_bracket_sync');
        if (data && data[0]?.rows?.[0]?.[0]) {
          const remote = JSON.parse(data[0].rows[0][0]);
          if (remote?.matches && remote.matches.length > 0) {
            setBracketData(local => {
              const localPlayed = local.matches.filter(m => m.winner).length;
              const remotePlayed = remote.matches.filter(m => m.winner).length;
              if (remotePlayed > localPlayed || JSON.stringify(local) !== JSON.stringify(remote)) {
                localStorage.setItem('pes_c1_knockout_bracket', JSON.stringify(remote));
                return remote;
              }
              return local;
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCloudBracket();

    const channel = supabase
      .channel('realtime_knockout_bracket_v2')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'custom_tables',
        filter: 'id=eq.pes_c1_knockout_bracket_sync'
      }, (payload) => {
        if (payload.new && payload.new.rows?.[0]?.[0]) {
          try {
            const remote = JSON.parse(payload.new.rows[0][0]);
            if (remote?.matches) {
              setBracketData(remote);
              localStorage.setItem('pes_c1_knockout_bracket', JSON.stringify(remote));
            }
          } catch (e) {
            console.error(e);
          }
        }
      })
      .subscribe();

    const timer = setInterval(fetchCloudBracket, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, []);

  // Persist to local storage and push to cloud
  useEffect(() => {
    if (bracketData && bracketData.matches) {
      localStorage.setItem('pes_c1_knockout_bracket', JSON.stringify(bracketData));
      pushBracketToCloud(bracketData);
    }
  }, [bracketData]);

  // Tìm nhà vô địch
  const championMatch = bracketData.matches.find(m => m.id === 'final');
  const championTeam = championMatch?.winner ? (championMatch.winner === 'teamA' ? championMatch.teamA : championMatch.teamB) : null;
  const runnerUpTeam = championMatch?.winner ? (championMatch.winner === 'teamA' ? championMatch.teamB : championMatch.teamA) : null;

  const thirdMatch = bracketData.matches.find(m => m.id === 'third');
  const thirdTeam = thirdMatch?.winner ? (thirdMatch.winner === 'teamA' ? thirdMatch.teamA : thirdMatch.teamB) : null;

  // Xử lý mở Modal chỉnh sửa kết quả
  const openEditModal = (match) => {
    setEditingMatch(match);
    setScoreAInput(match.scoreA !== '' ? String(match.scoreA) : '');
    setScoreBInput(match.scoreB !== '' ? String(match.scoreB) : '');
    setPenAInput(match.penA !== '' ? String(match.penA) : '');
    setPenBInput(match.penB !== '' ? String(match.penB) : '');
  };

  // Lưu kết quả & Tự động đẩy đội thắng lên vòng tiếp theo
  const handleSaveMatch = () => {
    if (!editingMatch) return;

    const sA = scoreAInput !== '' ? parseInt(scoreAInput) : '';
    const sB = scoreBInput !== '' ? parseInt(scoreBInput) : '';
    const pA = penAInput !== '' ? parseInt(penAInput) : '';
    const pB = penBInput !== '' ? parseInt(penBInput) : '';

    let winner = null;
    let loser = null;

    if (sA !== '' && sB !== '') {
      if (sA > sB) {
        winner = 'teamA';
        loser = 'teamB';
      } else if (sB > sA) {
        winner = 'teamB';
        loser = 'teamA';
      } else if (pA !== '' && pB !== '') {
        if (pA > pB) {
          winner = 'teamA';
          loser = 'teamB';
        } else if (pB > pA) {
          winner = 'teamB';
          loser = 'teamA';
        }
      }
    }

    const updatedMatches = bracketData.matches.map(m => {
      if (m.id === editingMatch.id) {
        return {
          ...m,
          scoreA: sA,
          scoreB: sB,
          penA: pA,
          penB: pB,
          winner
        };
      }
      return m;
    });

    const winningTeamName = winner ? (winner === 'teamA' ? editingMatch.teamA : editingMatch.teamB) : '';
    const losingTeamName = loser ? (loser === 'teamA' ? editingMatch.teamA : editingMatch.teamB) : '';

    // Cập nhật đội thắng vào nhánh đấu kế tiếp
    if (editingMatch.nextId && winningTeamName) {
      const targetMatchIndex = updatedMatches.findIndex(m => m.id === editingMatch.nextId);
      if (targetMatchIndex !== -1) {
        updatedMatches[targetMatchIndex] = {
          ...updatedMatches[targetMatchIndex],
          [editingMatch.nextSlot]: winningTeamName
        };
      }
    }

    // Nếu là bán kết, đẩy đội thua vào trận tranh Hạng 3
    if (editingMatch.loserId && losingTeamName) {
      const loserMatchIndex = updatedMatches.findIndex(m => m.id === editingMatch.loserId);
      if (loserMatchIndex !== -1) {
        updatedMatches[loserMatchIndex] = {
          ...updatedMatches[loserMatchIndex],
          [editingMatch.loserSlot]: losingTeamName
        };
      }
    }

    // Tự động ghi nhận trận đấu vào lịch sử chung nếu có setMatches
    if (setMatches && winningTeamName && editingMatch.teamA && editingMatch.teamB) {
      const matchRecord = {
        id: `ko_${editingMatch.id}_${Date.now()}`,
        playerAId: editingMatch.teamA.toLowerCase(),
        playerBId: editingMatch.teamB.toLowerCase(),
        teamA: editingMatch.teamA,
        teamB: editingMatch.teamB,
        scoreA: sA,
        scoreB: sB,
        date: new Date().toISOString(),
        type: 'knockout',
        round: editingMatch.name
      };
      setMatches(prev => [matchRecord, ...prev.filter(m => m.id !== matchRecord.id)]);
    }

    setBracketData({
      ...bracketData,
      matches: updatedMatches
    });

    // Nếu trận Chung kết vừa hoàn tất và có nhà vô địch, bắn pháo hoa vàng vinh danh
    if (editingMatch.id === 'final' && winner) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#ffd700', '#00f2ff', '#ffffff']
        });
      }, 200);
    }

    setEditingMatch(null);
  };

  // Đặt lại nhánh đấu về mặc định
  const handleResetBracket = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại sơ đồ nhánh đấu Knock-out về ban đầu?')) {
      let template = DEFAULT_BRACKET_20;
      if (format === '16_teams') template = DEFAULT_BRACKET_16;
      else if (format === '8_teams') template = DEFAULT_BRACKET_8;
      setBracketData(template);
      localStorage.setItem('pes_c1_knockout_bracket', JSON.stringify(template));
    }
  };

  // Tự động đồng bộ các đội vào Cây Knock-out trực tiếp từ Bảng Xếp Hạng Vòng Bảng (KHÔNG BỐC THĂM)
  const handleSyncFromGroupStage = () => {
    if (!players || players.length === 0) {
      alert('Chưa có dữ liệu Bảng xếp hạng Vòng bảng!');
      return;
    }

    if (!confirm('Đồng bộ tự động các đội vào nhánh Knock-out theo đúng thứ hạng Vòng bảng (Top 12 vào Vòng 1/8, Hạng 13-20 đá Play-off, 8 đội chót bị loại)?')) return;

    const sorted = [...players];
    const top12 = sorted.slice(0, 12);
    const playoffTeams = sorted.slice(12, 20);

    const newBracket = {
      format: '20_teams',
      matches: [
        // 4 CẶP PLAY-OFF TRANH 4 VÉ VÀO VÒNG 1/8 (Dành cho hạng 13 đến 20)
        { 
          id: 'po1', round: 'playoff', name: 'Play-off 1 (Hạng 13 vs 20)', 
          teamA: playoffTeams[0]?.name || 'Hạng 13', 
          teamB: playoffTeams[7]?.name || 'Hạng 20', 
          scoreA: '', scoreB: '', penA: '', penB: '', winner: null, 
          nextId: 'r16_4', nextSlot: 'teamB' 
        },
        { 
          id: 'po2', round: 'playoff', name: 'Play-off 2 (Hạng 14 vs 19)', 
          teamA: playoffTeams[1]?.name || 'Hạng 14', 
          teamB: playoffTeams[6]?.name || 'Hạng 19', 
          scoreA: '', scoreB: '', penA: '', penB: '', winner: null, 
          nextId: 'r16_3', nextSlot: 'teamB' 
        },
        { 
          id: 'po3', round: 'playoff', name: 'Play-off 3 (Hạng 15 vs 18)', 
          teamA: playoffTeams[2]?.name || 'Hạng 15', 
          teamB: playoffTeams[5]?.name || 'Hạng 18', 
          scoreA: '', scoreB: '', penA: '', penB: '', winner: null, 
          nextId: 'r16_2', nextSlot: 'teamB' 
        },
        { 
          id: 'po4', round: 'playoff', name: 'Play-off 4 (Hạng 16 vs 17)', 
          teamA: playoffTeams[3]?.name || 'Hạng 16', 
          teamB: playoffTeams[4]?.name || 'Hạng 17', 
          scoreA: '', scoreB: '', penA: '', penB: '', winner: null, 
          nextId: 'r16_1', nextSlot: 'teamB' 
        },

        // VÒNG 1/8 (8 CẶP ĐẤU)
        { id: 'r16_1', round: 'r16', name: 'Vòng 1/8 - 1 (Hạng 1 vs Thắng PO 4)', teamA: top12[0]?.name || 'Hạng 1', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf1', nextSlot: 'teamA' },
        { id: 'r16_2', round: 'r16', name: 'Vòng 1/8 - 2 (Hạng 2 vs Thắng PO 3)', teamA: top12[1]?.name || 'Hạng 2', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf1', nextSlot: 'teamB' },
        { id: 'r16_3', round: 'r16', name: 'Vòng 1/8 - 3 (Hạng 3 vs Thắng PO 2)', teamA: top12[2]?.name || 'Hạng 3', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf2', nextSlot: 'teamA' },
        { id: 'r16_4', round: 'r16', name: 'Vòng 1/8 - 4 (Hạng 4 vs Thắng PO 1)', teamA: top12[3]?.name || 'Hạng 4', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf2', nextSlot: 'teamB' },
        { id: 'r16_5', round: 'r16', name: 'Vòng 1/8 - 5 (Hạng 5 vs Hạng 12)', teamA: top12[4]?.name || 'Hạng 5', teamB: top12[11]?.name || 'Hạng 12', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf3', nextSlot: 'teamA' },
        { id: 'r16_6', round: 'r16', name: 'Vòng 1/8 - 6 (Hạng 6 vs Hạng 11)', teamA: top12[5]?.name || 'Hạng 6', teamB: top12[10]?.name || 'Hạng 11', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf3', nextSlot: 'teamB' },
        { id: 'r16_7', round: 'r16', name: 'Vòng 1/8 - 7 (Hạng 7 vs Hạng 10)', teamA: top12[6]?.name || 'Hạng 7', teamB: top12[9]?.name || 'Hạng 10', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf4', nextSlot: 'teamA' },
        { id: 'r16_8', round: 'r16', name: 'Vòng 1/8 - 8 (Hạng 8 vs Hạng 9)', teamA: top12[7]?.name || 'Hạng 8', teamB: top12[8]?.name || 'Hạng 9', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf4', nextSlot: 'teamB' },

        // TỨ KẾT (4 CẶP ĐẤU)
        { id: 'qf1', round: 'qf', name: 'Tứ kết 1', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf1', nextSlot: 'teamA' },
        { id: 'qf2', round: 'qf', name: 'Tứ kết 2', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf1', nextSlot: 'teamB' },
        { id: 'qf3', round: 'qf', name: 'Tứ kết 3', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf2', nextSlot: 'teamA' },
        { id: 'qf4', round: 'qf', name: 'Tứ kết 4', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'sf2', nextSlot: 'teamB' },

        // BÁN KẾT (2 CẶP ĐẤU)
        { id: 'sf1', round: 'sf', name: 'Bán kết 1', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'final', nextSlot: 'teamA', loserId: 'third', loserSlot: 'teamA' },
        { id: 'sf2', round: 'sf', name: 'Bán kết 2', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'final', nextSlot: 'teamB', loserId: 'third', loserSlot: 'teamB' },

        // CHUNG KẾT & TRANH HẠNG 3
        { id: 'final', round: 'final', name: 'Chung kết C1', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, isChampionship: true },
        { id: 'third', round: 'third', name: 'Tranh Hạng 3', teamA: '', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null }
      ]
    };

    setBracketData(newBracket);
    setFormat('20_teams');
    localStorage.setItem('pes_c1_knockout_bracket', JSON.stringify(newBracket));
  };

  // Nhóm các trận đấu theo vòng
  const playoffMatches = useMemo(() => bracketData.matches.filter(m => m.round === 'playoff'), [bracketData]);
  const r16Matches = useMemo(() => bracketData.matches.filter(m => m.round === 'r16'), [bracketData]);
  const qfMatches = useMemo(() => bracketData.matches.filter(m => m.round === 'qf'), [bracketData]);
  const sfMatches = useMemo(() => bracketData.matches.filter(m => m.round === 'sf'), [bracketData]);
  const finalMatch = useMemo(() => bracketData.matches.find(m => m.round === 'final'), [bracketData]);
  const thirdPlaceMatch = useMemo(() => bracketData.matches.find(m => m.round === 'third'), [bracketData]);

  // Match Card Component
  const MatchCard = ({ match, stageLabel }) => {
    const hasA = Boolean(match.teamA);
    const hasB = Boolean(match.teamB);
    const ownerA = getTeamOwner(match.teamA);
    const ownerB = getTeamOwner(match.teamB);
    const isCompleted = match.winner !== null;
    const isFinal = match.round === 'final';

    return (
      <div 
        onClick={() => openEditModal(match)}
        className={cn(
          "w-72 sm:w-80 rounded-2xl p-3 sm:p-4 border backdrop-blur-xl transition-all duration-300 cursor-pointer group relative overflow-hidden",
          isFinal 
            ? "bg-gradient-to-b from-[#ffd700]/15 via-black/80 to-black/95 border-[#ffd700]/50 shadow-[0_0_30px_rgba(255,215,0,0.25)] hover:border-[#ffd700] hover:shadow-[0_0_40px_rgba(255,215,0,0.4)]"
            : isCompleted
            ? "bg-black/60 border-white/15 hover:border-[#00f2ff]/60 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            : "bg-black/40 border-white/10 hover:border-white/30"
        )}
      >
        {/* Match Header Badge */}
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/5 text-[10px] font-black uppercase tracking-widest font-mono">
          <span className={cn(
            "flex items-center gap-1.5",
            isFinal ? "text-[#ffd700]" : "text-ucl-silver"
          )}>
            {isFinal ? <Crown size={12} className="text-[#ffd700]" /> : <Swords size={12} className="text-[#00f2ff]" />}
            {match.name}
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/60 group-hover:text-white transition-colors">
            {isCompleted ? 'HOÀN TẤT' : 'CHỜ ĐẤU'}
          </span>
        </div>

        {/* Team A Row */}
        <div className={cn(
          "flex items-center justify-between p-2 rounded-xl transition-colors mb-1.5",
          match.winner === 'teamA' 
            ? "bg-gradient-to-r from-[#00f2ff]/20 via-[#00f2ff]/10 to-transparent border-l-4 border-l-[#00f2ff] font-bold" 
            : match.winner === 'teamB' 
            ? "opacity-50" 
            : "hover:bg-white/5"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-black/40 p-1 flex items-center justify-center shrink-0 border border-white/10">
              {hasA ? (
                <img src={getTeamLogo(match.teamA)} alt={match.teamA} className="w-full h-full object-contain" />
              ) : (
                <Shield size={16} className="text-white/20" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-black italic tracking-wide truncate text-white">
                  {match.teamA || 'Chờ đội thắng...'}
                </p>
                {ownerA && (
                  <span className={cn(
                    "text-[8px] font-black px-1.5 py-0.2 rounded font-mono shrink-0",
                    ownerA === 'THỊNH' ? "bg-[#ff2a5f]/20 text-[#ff2a5f] border border-[#ff2a5f]/40" : "bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/40"
                  )}>
                    {ownerA}
                  </span>
                )}
              </div>
              {match.penA !== '' && (
                <span className="text-[9px] text-[#ffd700] font-mono">Pen: {match.penA}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm font-mono border",
              match.winner === 'teamA'
                ? "bg-[#00f2ff] text-black border-[#00f2ff] shadow-[0_0_10px_#00f2ff]"
                : "bg-white/5 text-white border-white/10"
            )}>
              {match.scoreA !== '' ? match.scoreA : '-'}
            </span>
          </div>
        </div>

        {/* Team B Row */}
        <div className={cn(
          "flex items-center justify-between p-2 rounded-xl transition-colors",
          match.winner === 'teamB' 
            ? "bg-gradient-to-r from-[#00f2ff]/20 via-[#00f2ff]/10 to-transparent border-l-4 border-l-[#00f2ff] font-bold" 
            : match.winner === 'teamA' 
            ? "opacity-50" 
            : "hover:bg-white/5"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-black/40 p-1 flex items-center justify-center shrink-0 border border-white/10">
              {hasB ? (
                <img src={getTeamLogo(match.teamB)} alt={match.teamB} className="w-full h-full object-contain" />
              ) : (
                <Shield size={16} className="text-white/20" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-black italic tracking-wide truncate text-white">
                  {match.teamB || 'Chờ đội thắng...'}
                </p>
                {ownerB && (
                  <span className={cn(
                    "text-[8px] font-black px-1.5 py-0.2 rounded font-mono shrink-0",
                    ownerB === 'THỊNH' ? "bg-[#ff2a5f]/20 text-[#ff2a5f] border border-[#ff2a5f]/40" : "bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/40"
                  )}>
                    {ownerB}
                  </span>
                )}
              </div>
              {match.penB !== '' && (
                <span className="text-[9px] text-[#ffd700] font-mono">Pen: {match.penB}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm font-mono border",
              match.winner === 'teamB'
                ? "bg-[#00f2ff] text-black border-[#00f2ff] shadow-[0_0_10px_#00f2ff]"
                : "bg-white/5 text-white border-white/10"
            )}>
              {match.scoreB !== '' ? match.scoreB : '-'}
            </span>
          </div>
        </div>

        {/* Hover Hint */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit3 size={13} className="text-ucl-silver hover:text-white" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#ffd700]/10 via-[#00f2ff]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#00f2ff]">
            <Crown size={12} className="text-[#ffd700]" />
            SƠ ĐỒ PHÂN NHÁNH TRỰC TIẾP
          </div>
          <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase font-bebas text-white">
            CÂY NHÁNH ĐẤU <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#00f2ff] to-[#ff2a5f]">KNOCK-OUT C1</span>
          </h2>
          <p className="text-ucl-silver text-xs font-montserrat uppercase tracking-wider">
            Tự động đẩy đội thắng lên vòng trong • Tính điểm & Penalty • Vinh danh Quán quân
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* Format Selector */}
          <div className="bg-black/50 p-1 rounded-xl border border-white/10 flex items-center">
            <button
              onClick={() => setFormat('20_teams')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                format === '20_teams' ? "bg-[#ffd700] text-black shadow-[0_0_15px_#ffd700]" : "text-ucl-silver hover:text-white"
              )}
            >
              20 Đội (Luật mới C1)
            </button>
            <button
              onClick={() => setFormat('16_teams')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                format === '16_teams' ? "bg-[#00f2ff] text-black shadow-[0_0_15px_#00f2ff]" : "text-ucl-silver hover:text-white"
              )}
            >
              16 Đội (Vòng 1/8)
            </button>
            <button
              onClick={() => setFormat('8_teams')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                format === '8_teams' ? "bg-[#00f2ff] text-black shadow-[0_0_15px_#00f2ff]" : "text-ucl-silver hover:text-white"
              )}
            >
              8 Đội (Tứ kết)
            </button>
          </div>

          {/* Đồng bộ từ BXH Vòng Bảng (Thay vì bốc thăm) */}
          <button
            onClick={handleSyncFromGroupStage}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00f2ff]/20 to-[#ffd700]/20 border border-[#00f2ff]/40 text-xs font-bold uppercase tracking-wider text-white hover:border-[#00f2ff] hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] transition-all"
            title="Tự động xếp 20 đội theo thứ hạng BXH Vòng Bảng (Top 1-12 vào 1/8, Hạng 13-20 đá Play-off)"
          >
            <Trophy size={14} className="text-[#ffd700]" />
            Lấy từ BXH Vòng Bảng
          </button>

          {/* Reset Button */}
          <button
            onClick={handleResetBracket}
            className="p-2 rounded-xl bg-white/5 border border-white/15 text-ucl-silver hover:text-red-400 hover:border-red-500/50 transition-all"
            title="Đặt lại sơ đồ nhánh đấu"
          >
            <RotateCcw size={16} />
          </button>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-black/40 rounded-xl border border-white/10 p-1">
            <button
              onClick={() => setZoomScale(prev => Math.max(0.7, prev - 0.1))}
              className="p-1.5 text-ucl-silver hover:text-white"
              title="Thu nhỏ"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-[10px] font-mono px-2 text-white/70">{Math.round(zoomScale * 100)}%</span>
            <button
              onClick={() => setZoomScale(prev => Math.min(1.3, prev + 0.1))}
              className="p-1.5 text-ucl-silver hover:text-white"
              title="Phóng to"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Champion Podium Spotlight (Khi đã có nhà vô địch) */}
      <AnimatePresence>
        {championTeam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card p-6 md:p-8 bg-gradient-to-r from-[#ffd700]/15 via-black/80 to-[#00f2ff]/15 border-2 border-[#ffd700] shadow-[0_0_50px_rgba(255,215,0,0.3)] relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#ffd700] to-[#ffae00] p-1 shadow-[0_0_30px_#ffd700] flex items-center justify-center">
                    <img src={getTeamLogo(championTeam)} alt={championTeam} className="w-16 h-16 object-contain" />
                  </div>
                  <Crown size={24} className="absolute -top-3 -right-2 text-[#ffd700] animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-[#ffd700] font-mono">
                      🏆 NHÀ VÔ ĐỊCH CHAMPIONS LEAGUE PES 2021
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/40">
                      {getTeamOwner(championTeam)}
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase font-bebas text-white mt-1">
                    {championTeam}
                  </h3>
                  <p className="text-ucl-silver text-xs font-montserrat mt-1">
                    Đã xuất sắc vượt qua mọi vòng đấu loại trực tiếp để giành lấy Chiếc Cúp Tai Voi danh giá!
                  </p>
                </div>
              </div>

              {/* Runner-up & 3rd Place Badges */}
              <div className="flex items-center gap-3">
                {runnerUpTeam && (
                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Á QUÂN (HẠNG 2)</span>
                    <span className="text-sm font-black italic text-white flex items-center gap-1.5 mt-0.5">
                      <Medal size={14} className="text-slate-300" />
                      {runnerUpTeam}
                    </span>
                  </div>
                )}
                {thirdTeam && (
                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#d97706] block font-mono">HẠNG 3</span>
                    <span className="text-sm font-black italic text-white flex items-center gap-1.5 mt-0.5">
                      <Medal size={14} className="text-[#d97706]" />
                      {thirdTeam}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive View Tabs (Cho thiết bị di động / Màn hình nhỏ) */}
      <div className="flex md:hidden items-center justify-between gap-1 overflow-x-auto p-1 bg-black/40 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider font-mono">
        <button
          onClick={() => setActiveTabRound('all')}
          className={cn("px-3 py-2 rounded-lg shrink-0", activeTabRound === 'all' ? "bg-[#00f2ff] text-black" : "text-ucl-silver")}
        >
          Tất cả
        </button>
        {format === '20_teams' && (
          <button
            onClick={() => setActiveTabRound('playoff')}
            className={cn("px-3 py-2 rounded-lg shrink-0", activeTabRound === 'playoff' ? "bg-[#ffd700] text-black" : "text-ucl-silver")}
          >
            Play-off
          </button>
        )}
        {(format === '20_teams' || format === '16_teams') && (
          <button
            onClick={() => setActiveTabRound('r16')}
            className={cn("px-3 py-2 rounded-lg shrink-0", activeTabRound === 'r16' ? "bg-[#00f2ff] text-black" : "text-ucl-silver")}
          >
            Vòng 1/8
          </button>
        )}
        <button
          onClick={() => setActiveTabRound('qf')}
          className={cn("px-3 py-2 rounded-lg shrink-0", activeTabRound === 'qf' ? "bg-[#00f2ff] text-black" : "text-ucl-silver")}
        >
          Tứ kết
        </button>
        <button
          onClick={() => setActiveTabRound('sf')}
          className={cn("px-3 py-2 rounded-lg shrink-0", activeTabRound === 'sf' ? "bg-[#00f2ff] text-black" : "text-ucl-silver")}
        >
          Bán kết
        </button>
        <button
          onClick={() => setActiveTabRound('final')}
          className={cn("px-3 py-2 rounded-lg shrink-0", activeTabRound === 'final' ? "bg-[#ffd700] text-black" : "text-ucl-silver")}
        >
          Chung kết
        </button>
      </div>

      {/* Main Bracket Tree Container with Horizontal Scrolling */}
      <div 
        ref={containerRef}
        className="w-full overflow-x-auto custom-scrollbar pb-8 pt-4 rounded-3xl"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div 
          className="min-w-fit flex items-stretch gap-8 lg:gap-12 px-4 transition-transform duration-200"
          style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top left' }}
        >
          {/* CỘT 0: VÒNG PLAY-OFF (NẾU CHỌN 20 ĐỘI) */}
          {format === '20_teams' && (activeTabRound === 'all' || activeTabRound === 'playoff') && (
            <div className="flex flex-col space-y-4">
              <div className="text-center pb-2 border-b border-[#ffd700]/30">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ffd700] font-mono flex items-center justify-center gap-1.5">
                  <Flame size={12} className="text-amber-400" />
                  PLAY-OFF (4 CẶP)
                </span>
                <span className="text-[9px] text-ucl-silver block font-mono">Hạng 13-20 tranh 4 vé vào 1/8</span>
              </div>
              <div className="flex flex-col justify-around h-full space-y-6">
                {playoffMatches.map(m => (
                  <MatchCard key={m.id} match={m} stageLabel="Play-off" />
                ))}
              </div>
            </div>
          )}

          {/* CỘT 1: VÒNG 1/8 (NẾU CHỌN 20 ĐỘI HOẶC 16 ĐỘI) */}
          {(format === '20_teams' || format === '16_teams') && (activeTabRound === 'all' || activeTabRound === 'r16') && (
            <div className="flex flex-col space-y-4">
              <div className="text-center pb-2 border-b border-white/10">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00f2ff] font-mono">VÒNG 1/8 (8 CẶP)</span>
                {format === '20_teams' && (
                  <span className="text-[9px] text-ucl-silver block font-mono">Top 1-12 + 4 Đội thắng Play-off</span>
                )}
              </div>
              <div className="flex flex-col justify-around h-full space-y-6">
                {r16Matches.map(m => (
                  <MatchCard key={m.id} match={m} stageLabel="1/8" />
                ))}
              </div>
            </div>
          )}

          {/* CỘT 2: TỨ KẾT (QUARTER-FINALS) */}
          {(activeTabRound === 'all' || activeTabRound === 'qf') && (
            <div className="flex flex-col space-y-4">
              <div className="text-center pb-2 border-b border-white/10">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ff2a5f] font-mono">TỨ KẾT (4 CẶP)</span>
              </div>
              <div className="flex flex-col justify-around h-full space-y-8">
                {qfMatches.map(m => (
                  <MatchCard key={m.id} match={m} stageLabel="Tứ kết" />
                ))}
              </div>
            </div>
          )}

          {/* CỘT 3: BÁN KẾT (SEMI-FINALS) */}
          {(activeTabRound === 'all' || activeTabRound === 'sf') && (
            <div className="flex flex-col space-y-4">
              <div className="text-center pb-2 border-b border-white/10">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00f2ff] font-mono">BÁN KẾT (2 CẶP)</span>
              </div>
              <div className="flex flex-col justify-around h-full space-y-16">
                {sfMatches.map(m => (
                  <MatchCard key={m.id} match={m} stageLabel="Bán kết" />
                ))}
              </div>
            </div>
          )}

          {/* CỘT 4: CHUNG KẾT & TRANH HẠNG 3 */}
          {(activeTabRound === 'all' || activeTabRound === 'final') && (
            <div className="flex flex-col space-y-4">
              <div className="text-center pb-2 border-b border-[#ffd700]/30">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ffd700] font-mono">CHUNG KẾT & TRANH HẠNG 3</span>
              </div>
              <div className="flex flex-col justify-around h-full space-y-10">
                {/* Trận Chung kết */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-[#ffd700] text-[10px] font-black uppercase tracking-widest font-mono">
                    <Trophy size={14} />
                    TRANH CÚP TAI VOI
                  </div>
                  {finalMatch && <MatchCard match={finalMatch} stageLabel="Chung kết" />}
                </div>

                {/* Trận Tranh Hạng 3 */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-center gap-1.5 text-ucl-silver text-[10px] font-bold uppercase tracking-widest font-mono">
                    <Medal size={14} className="text-[#d97706]" />
                    TRANH HẠNG 3
                  </div>
                  {thirdPlaceMatch && <MatchCard match={thirdPlaceMatch} stageLabel="Hạng 3" />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Result Editor Modal */}
      <AnimatePresence>
        {editingMatch && (
          <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-md w-full p-6 space-y-6 border-2 border-[#00f2ff]/40 shadow-[0_0_50px_rgba(0,242,255,0.25)] relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setEditingMatch(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 text-ucl-silver hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00f2ff] font-mono">
                  NHẬP TỶ SỐ TRẬN ĐẤU
                </span>
                <h3 className="text-2xl font-black italic uppercase font-bebas text-white">
                  {editingMatch.name}
                </h3>
              </div>

              {/* Score Input Grid */}
              <div className="space-y-4">
                {/* Team A */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <img src={getTeamLogo(editingMatch.teamA)} alt="" className="w-10 h-10 object-contain" />
                    <div>
                      <p className="font-black italic text-sm text-white">{editingMatch.teamA || 'Chưa xác định'}</p>
                      <span className="text-[9px] font-bold text-ucl-silver">{getTeamOwner(editingMatch.teamA)}</span>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={scoreAInput}
                    onChange={(e) => setScoreAInput(e.target.value)}
                    className="w-14 h-12 text-center text-xl font-black font-mono bg-black/60 border border-white/20 rounded-xl text-white focus:border-[#00f2ff] outline-none"
                  />
                </div>

                {/* Team B */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <img src={getTeamLogo(editingMatch.teamB)} alt="" className="w-10 h-10 object-contain" />
                    <div>
                      <p className="font-black italic text-sm text-white">{editingMatch.teamB || 'Chưa xác định'}</p>
                      <span className="text-[9px] font-bold text-ucl-silver">{getTeamOwner(editingMatch.teamB)}</span>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={scoreBInput}
                    onChange={(e) => setScoreBInput(e.target.value)}
                    className="w-14 h-12 text-center text-xl font-black font-mono bg-black/60 border border-white/20 rounded-xl text-white focus:border-[#00f2ff] outline-none"
                  />
                </div>

                {/* Luân lưu Penalty (nếu hòa) */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ucl-silver text-center font-mono">
                    Loạt sút luân lưu Penalty (Nếu hòa)
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/70">{editingMatch.teamA || 'Đội A'}:</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Pen"
                        value={penAInput}
                        onChange={(e) => setPenAInput(e.target.value)}
                        className="w-12 h-9 text-center text-sm font-bold font-mono bg-black/60 border border-white/20 rounded-lg text-white focus:border-[#ffd700] outline-none"
                      />
                    </div>
                    <span className="text-white/40 font-black">-</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Pen"
                        value={penBInput}
                        onChange={(e) => setPenBInput(e.target.value)}
                        className="w-12 h-9 text-center text-sm font-bold font-mono bg-black/60 border border-white/20 rounded-lg text-white focus:border-[#ffd700] outline-none"
                      />
                      <span className="text-xs font-bold text-white/70">:{editingMatch.teamB || 'Đội B'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setEditingMatch(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-ucl-silver hover:text-white transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveMatch}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#ff2a5f] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,242,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={15} />
                  Lưu & Đi tiếp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnockoutBracket;
