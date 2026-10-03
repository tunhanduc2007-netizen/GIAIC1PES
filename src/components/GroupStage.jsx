import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Shield, 
  Medal, 
  Award, 
  Shuffle, 
  Swords, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RotateCcw,
  Sparkles,
  Calendar,
  Save,
  X,
  ChevronRight,
  Filter,
  Plus,
  Minus,
  Layers,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { getClubSquad, addTransferPlayer, removeTransferPlayer } from '../lib/squads';

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

// 14 CẶP ĐẤU CHÍNH THỨC CỦA VÒNG 1 (THỊNH SÂN NHÀ 🔴 VS BU SÂN KHÁCH 🔵)
const OFFICIAL_ROUND_1_PAIRS = [
  { tA: 'Arsenal', tB: 'Porto' },
  { tA: 'Chelsea', tB: 'Villarreal' },
  { tA: 'Manchester City', tB: 'Lyon' },
  { tA: 'Barcelona', tB: 'Manchester United' },
  { tA: 'Real Madrid', tB: 'Sporting CP' },
  { tA: 'Atlético Madrid', tB: 'Liverpool' },
  { tA: 'Roma', tB: 'Aston Villa' },
  { tA: 'Inter Milan', tB: 'Bayern Munich' },
  { tA: 'Stuttgart', tB: 'Napoli' },
  { tA: 'Borussia Dortmund', tB: 'Real Betis' },
  { tA: 'Paris Saint-Germain', tB: 'RB Leipzig' },
  { tA: 'Lens', tB: 'Lille' },
  { tA: 'Galatasaray', tB: 'Como' },
  { tA: 'Fenerbahçe', tB: 'Athletic Bilbao' }
];

export const DEFAULT_ROUND_1_FIXTURES = OFFICIAL_ROUND_1_PAIRS.map((pair, idx) => ({
  id: `r1_m_${idx + 1}`,
  roundNumber: 1,
  name: `Vòng 1 - Trận ${idx + 1}`,
  teamA: pair.tA,
  teamB: pair.tB,
  ownerA: 'THỊNH',
  ownerB: 'BU',
  played: false,
  scoreA: '',
  scoreB: '',
}));

const GroupStage = ({ players = [], matches = [], setMatches, rawPlayers = [], setActiveTab }) => {
  const [viewMode, setViewMode] = useState('fixtures'); // Mặc định mở ngay tab 'fixtures' (Lịch đấu & Nhập điểm)
  const [selectedRoundTab, setSelectedRoundTab] = useState('all'); // 'all' hoặc 1, 2...
  const [editingFixture, setEditingFixture] = useState(null);
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [scorersA, setScorersA] = useState('');
  const [scorersB, setScorersB] = useState('');
  const [yellowA, setYellowA] = useState('');
  const [yellowB, setYellowB] = useState('');
  const [redA, setRedA] = useState('');
  const [redB, setRedB] = useState('');

  // Quản lý thêm cầu thủ chuyển nhượng tùy chỉnh
  const [newPlayerNameA, setNewPlayerNameA] = useState('');
  const [showAddPlayerA, setShowAddPlayerA] = useState(false);
  const [newPlayerNameB, setNewPlayerNameB] = useState('');
  const [showAddPlayerB, setShowAddPlayerB] = useState(false);
  const [squadRefreshKey, setSquadRefreshKey] = useState(0);

  // Thông báo toast thành công
  const [toastMsg, setToastMsg] = useState(null);
  const lastLocalSaveTimeRef = useRef(0);
  const editingFixtureRef = useRef(null);
  editingFixtureRef.current = editingFixture;

  // Định danh lưu lịch thi đấu C1 trên Supabase Cloud
  const FIXTURES_SYNC_TABLE_ID = 'pes_c1_league_fixtures_sync';
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState(null);

  // Lịch thi đấu vòng bảng League Phase
  const [fixtures, setFixtures] = useState(() => {
    try {
      const saved = localStorage.getItem('pes_c1_league_fixtures_official_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ROUND_1_FIXTURES;
  });

  // Tự động lưu lịch đấu vào LocalStorage
  useEffect(() => {
    localStorage.setItem('pes_c1_league_fixtures_official_v5', JSON.stringify(fixtures));
  }, [fixtures]);

  // Đẩy lịch thi đấu lên Supabase Cloud Database để máy khác nhận được ngay lập tức
  const pushFixturesToCloud = async (dataToPush) => {
    if (!dataToPush || dataToPush.length === 0) return;
    try {
      setIsSyncingCloud(true);
      await supabase.from('custom_tables').upsert({
        id: FIXTURES_SYNC_TABLE_ID,
        name: 'Lịch Thi Đấu Vòng Bảng C1',
        headers: ['fixtures_json'],
        rows: [[JSON.stringify(dataToPush)]]
      });
      setLastSyncedTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Lỗi push cloud fixtures:', e);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Kéo lịch thi đấu từ Cloud về (tự động phân giải khi có vòng mới từ máy khác)
  const fetchCloudFixtures = async () => {
    // Không đè dữ liệu khi vừa bấm lưu cục bộ trong vòng 5 giây hoặc người dùng đang mở modal nhập tỷ số
    if (Date.now() - lastLocalSaveTimeRef.current < 5000 || editingFixtureRef.current) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_tables')
        .select('*')
        .eq('id', FIXTURES_SYNC_TABLE_ID);

      if (data && data.length > 0 && data[0].rows?.[0]?.[0]) {
        const remote = JSON.parse(data[0].rows[0][0]);
        if (Array.isArray(remote) && remote.length > 0) {
          setFixtures(currentLocal => {
            const localMaxRound = Math.max(...currentLocal.map(f => f.roundNumber || 1), 0);
            const remoteMaxRound = Math.max(...remote.map(f => f.roundNumber || 1), 0);
            const localPlayed = currentLocal.filter(f => f.played).length;
            const remotePlayed = remote.filter(f => f.played).length;

            // Nếu máy hiện tại đang có nhiều vòng hơn hoặc nhiều trận đã hoàn tất hơn -> push lên cloud
            if (localMaxRound > remoteMaxRound || (localMaxRound === remoteMaxRound && localPlayed > remotePlayed)) {
              pushFixturesToCloud(currentLocal);
              return currentLocal;
            } else if (
              remoteMaxRound > localMaxRound || 
              (remoteMaxRound === localMaxRound && remotePlayed > localPlayed) || 
              (JSON.stringify(currentLocal) !== JSON.stringify(remote) && Date.now() - lastLocalSaveTimeRef.current >= 5000)
            ) {
              localStorage.setItem('pes_c1_league_fixtures_official_v5', JSON.stringify(remote));
              return remote;
            }
            return currentLocal;
          });
          setLastSyncedTime(new Date().toLocaleTimeString());
        }
      } else {
        // Nếu cloud chưa có, đẩy dữ liệu hiện tại lên
        setFixtures(currentLocal => {
          if (currentLocal && currentLocal.length > 0) {
            pushFixturesToCloud(currentLocal);
          }
          return currentLocal;
        });
      }
    } catch (err) {
      console.warn('Lỗi fetch cloud fixtures:', err);
    }
  };

  // Đồng bộ Realtime và tự động kiểm tra giữa các thiết bị
  useEffect(() => {
    fetchCloudFixtures();

    const channel = supabase
      .channel('realtime_group_fixtures_v5')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'custom_tables',
        filter: `id=eq.${FIXTURES_SYNC_TABLE_ID}`
      }, (payload) => {
        if (payload.new && payload.new.rows?.[0]?.[0]) {
          try {
            const remote = JSON.parse(payload.new.rows[0][0]);
            if (Array.isArray(remote) && remote.length > 0) {
              setFixtures(remote);
              localStorage.setItem('pes_c1_league_fixtures_official_v5', JSON.stringify(remote));
              setLastSyncedTime(new Date().toLocaleTimeString());
            }
          } catch (e) {
            console.error(e);
          }
        }
      })
      .subscribe();

    const timer = setInterval(fetchCloudFixtures, 3000);
    window.addEventListener('focus', fetchCloudFixtures);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
      window.removeEventListener('focus', fetchCloudFixtures);
    };
  }, []);

  // Danh sách các số vòng đấu hiện có (Vòng 1, Vòng 2...)
  const roundNumbers = useMemo(() => {
    const list = [...new Set(fixtures.map(f => f.roundNumber || 1))];
    return list.sort((a, b) => a - b);
  }, [fixtures]);


  // Lấy danh sách đội hình cho 2 đội đang được mở modal (tự động cập nhật khi thêm chuyển nhượng)
  const squadA = useMemo(() => {
    if (!editingFixture) return [];
    return getClubSquad(editingFixture.teamA);
  }, [editingFixture, squadRefreshKey]);

  const squadB = useMemo(() => {
    if (!editingFixture) return [];
    return getClubSquad(editingFixture.teamB);
  }, [editingFixture, squadRefreshKey]);

  // Thêm cầu thủ chuyển nhượng mới vào CLB
  const handleAddNewPlayer = (teamSide) => {
    if (!editingFixture) return;
    const isA = teamSide === 'A';
    const name = isA ? newPlayerNameA : newPlayerNameB;
    const club = isA ? editingFixture.teamA : editingFixture.teamB;
    if (!name.trim()) return;

    addTransferPlayer(club, name.trim(), 'FW');
    if (isA) {
      setNewPlayerNameA('');
      setShowAddPlayerA(false);
    } else {
      setNewPlayerNameB('');
      setShowAddPlayerB(false);
    }
    setSquadRefreshKey(k => k + 1);
  };

  // Xóa cầu thủ chuyển nhượng đã thêm thủ công
  const handleDeleteTransferPlayer = (teamSide, playerName) => {
    if (!editingFixture || !confirm(`Xóa cầu thủ ${playerName} khỏi danh sách chuyển nhượng của CLB?`)) return;
    const club = teamSide === 'A' ? editingFixture.teamA : editingFixture.teamB;
    removeTransferPlayer(club, playerName);
    setSquadRefreshKey(k => k + 1);
  };


  // Đếm số bàn thắng hiện tại của cầu thủ trong chuỗi scorers
  const getScorerCount = (scorerStr, playerName) => {
    if (!scorerStr) return 0;
    const parts = scorerStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      let name = part;
      let count = 1;
      const match = part.match(/(.+?)\s*[xX(](\d+)\)?$/);
      if (match) {
        name = match[1].trim();
        count = parseInt(match[2], 10);
      }
      if (name.toLowerCase() === playerName.toLowerCase()) {
        return count;
      }
    }
    return 0;
  };

  // Thêm bàn thắng cho cầu thủ (+1 bàn)
  const handleAddScorer = (teamSide, playerName) => {
    const isA = teamSide === 'A';
    const currentStr = isA ? scorersA : scorersB;
    const setFn = isA ? setScorersA : setScorersB;
    const currentScore = parseInt(isA ? scoreA : scoreB, 10) || 0;
    const setScoreFn = isA ? setScoreA : setScoreB;

    // Tự động tăng tỷ số đội lên nếu người dùng thêm người ghi bàn
    setScoreFn(String(currentScore + 1));

    if (!currentStr.trim()) {
      setFn(playerName);
      return;
    }

    const parts = currentStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    let found = false;
    const updated = parts.map(part => {
      let name = part;
      let count = 1;
      const match = part.match(/(.+?)\s*[xX(](\d+)\)?$/);
      if (match) {
        name = match[1].trim();
        count = parseInt(match[2], 10);
      }
      if (name.toLowerCase() === playerName.toLowerCase()) {
        found = true;
        return `${name} x${count + 1}`;
      }
      return part;
    });

    if (!found) {
      updated.push(playerName);
    }
    setFn(updated.join(', '));
  };

  // Giảm bàn thắng hoặc xóa cầu thủ khỏi danh sách
  const handleRemoveScorer = (teamSide, playerName) => {
    const isA = teamSide === 'A';
    const currentStr = isA ? scorersA : scorersB;
    const setFn = isA ? setScorersA : setScorersB;

    if (!currentStr.trim()) return;

    const parts = currentStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    const updated = [];

    parts.forEach(part => {
      let name = part;
      let count = 1;
      const match = part.match(/(.+?)\s*[xX(](\d+)\)?$/);
      if (match) {
        name = match[1].trim();
        count = parseInt(match[2], 10);
      }
      if (name.toLowerCase() === playerName.toLowerCase()) {
        if (count > 1) {
          updated.push(`${name} x${count - 1}`);
        }
      } else {
        updated.push(part);
      }
    });

    setFn(updated.join(', '));
  };

  // Bật/tắt thẻ vàng cho cầu thủ
  const handleToggleYellow = (teamSide, playerName) => {
    const isA = teamSide === 'A';
    const currentStr = isA ? yellowA : yellowB;
    const setFn = isA ? setYellowA : setYellowB;

    const parts = currentStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    const exists = parts.some(p => p.toLowerCase() === playerName.toLowerCase());

    if (exists) {
      setFn(parts.filter(p => p.toLowerCase() !== playerName.toLowerCase()).join(', '));
    } else {
      setFn([...parts, playerName].join(', '));
    }
  };

  // Kiểm tra cầu thủ đã có thẻ vàng chưa
  const hasYellow = (cardStr, playerName) => {
    if (!cardStr) return false;
    const parts = cardStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    return parts.some(p => p.toLowerCase() === playerName.toLowerCase());
  };

  // Bật/tắt thẻ đỏ cho cầu thủ
  const handleToggleRed = (teamSide, playerName) => {
    const isA = teamSide === 'A';
    const currentStr = isA ? redA : redB;
    const setFn = isA ? setRedA : setRedB;

    const parts = currentStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    const exists = parts.some(p => p.toLowerCase() === playerName.toLowerCase());

    if (exists) {
      setFn(parts.filter(p => p.toLowerCase() !== playerName.toLowerCase()).join(', '));
    } else {
      setFn([...parts, playerName].join(', '));
    }
  };

  // Kiểm tra cầu thủ dính thẻ đỏ chưa
  const hasRed = (cardStr, playerName) => {
    if (!cardStr) return false;
    const parts = cardStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    return parts.some(p => p.toLowerCase() === playerName.toLowerCase());
  };

  // Tạo thêm Vòng lượt về (Đảo sân: Bu đá sân nhà, Thịnh đá sân khách)
  const handleAddReturnLegRound = () => {
    const nextRound = Math.max(...fixtures.map(f => f.roundNumber || 1), 0) + 1;
    if (!confirm(`Tạo thêm Ô VÒNG ${nextRound} (Lượt về: Bu đá sân nhà, Thịnh đá sân khách)?`)) return;

    const returnLegMatches = OFFICIAL_ROUND_1_PAIRS.map((pair, idx) => ({
      id: `r${nextRound}_m_${idx + 1}`,
      roundNumber: nextRound,
      name: `Vòng ${nextRound} - Trận ${idx + 1}`,
      teamA: pair.tB, // Bu làm chủ nhà
      teamB: pair.tA, // Thịnh làm khách
      ownerA: 'BU',
      ownerB: 'THỊNH',
      played: false,
      scoreA: '',
      scoreB: '',
      scorersA: '',
      scorersB: '',
      yellowA: '',
      yellowB: '',
      redA: '',
      redB: '',
    }));

    const nextFixtures = [...fixtures, ...returnLegMatches];
    setFixtures(nextFixtures);
    setSelectedRoundTab(nextRound);
    pushFixturesToCloud(nextFixtures);
  };

  // Sinh thêm vòng đấu ngẫu nhiên mới
  const handleGenerateNextRandomRound = () => {
    const nextRound = Math.max(...fixtures.map(f => f.roundNumber || 1), 0) + 1;
    if (!confirm(`Bốc thăm ngẫu nhiên thêm Ô VÒNG ${nextRound} (14 cặp đấu mới giữa Thịnh & Bu)?`)) return;

    const shuffledThinh = [...THINH_TEAMS].sort(() => Math.random() - 0.5);
    const shuffledBu = [...BU_TEAMS].sort(() => Math.random() - 0.5);

    const isThinhHome = nextRound % 2 !== 0;
    const newMatches = [];

    for (let i = 0; i < 14; i++) {
      newMatches.push({
        id: `r${nextRound}_m_${i + 1}`,
        roundNumber: nextRound,
        name: `Vòng ${nextRound} - Trận ${i + 1}`,
        teamA: isThinhHome ? shuffledThinh[i] : shuffledBu[i],
        teamB: isThinhHome ? shuffledBu[i] : shuffledThinh[i],
        ownerA: isThinhHome ? 'THỊNH' : 'BU',
        ownerB: isThinhHome ? 'BU' : 'THỊNH',
        played: false,
        scoreA: '',
        scoreB: '',
        scorersA: '',
        scorersB: '',
        yellowA: '',
        yellowB: '',
        redA: '',
        redB: '',
      });
    }

    const nextFixtures = [...fixtures, ...newMatches];
    setFixtures(nextFixtures);
    setSelectedRoundTab(nextRound);
    pushFixturesToCloud(nextFixtures);
  };

  // Mở modal nhập tỷ số cho một trận đấu trong lịch
  const openScoreModal = (fixture) => {
    setEditingFixture(fixture);
    editingFixtureRef.current = fixture;
    setScoreA(fixture.scoreA !== '' && fixture.scoreA !== undefined && fixture.scoreA !== null ? String(fixture.scoreA) : '0');
    setScoreB(fixture.scoreB !== '' && fixture.scoreB !== undefined && fixture.scoreB !== null ? String(fixture.scoreB) : '0');

    // Kiểm tra xem trận này đã có thông tin bàn thắng / thẻ phạt trước đó chưa
    const existingMatch = matches.find(m => 
      m.fixtureId === fixture.id ||
      (m.teamA === fixture.teamA && m.teamB === fixture.teamB) ||
      (m.teamA === fixture.teamB && m.teamB === fixture.teamA)
    );

    if (existingMatch) {
      if (existingMatch.teamA === fixture.teamA) {
        setScorersA(existingMatch.scorersA || fixture.scorersA || '');
        setScorersB(existingMatch.scorersB || fixture.scorersB || '');
        setYellowA(existingMatch.yellowA || fixture.yellowA || '');
        setYellowB(existingMatch.yellowB || fixture.yellowB || '');
        setRedA(existingMatch.redA || fixture.redA || '');
        setRedB(existingMatch.redB || fixture.redB || '');
      } else {
        setScorersA(existingMatch.scorersB || fixture.scorersA || '');
        setScorersB(existingMatch.scorersA || fixture.scorersB || '');
        setYellowA(existingMatch.yellowB || fixture.yellowA || '');
        setYellowB(existingMatch.yellowA || fixture.yellowB || '');
        setRedA(existingMatch.redB || fixture.redA || '');
        setRedB(existingMatch.redA || fixture.redB || '');
      }
    } else {
      setScorersA(fixture.scorersA || '');
      setScorersB(fixture.scorersB || '');
      setYellowA(fixture.yellowA || '');
      setYellowB(fixture.yellowB || '');
      setRedA(fixture.redA || '');
      setRedB(fixture.redB || '');
    }
  };

  // Lưu tỷ số trận đấu & Cập nhật thẳng vào matches để recalculate bảng xếp hạng
  const handleSaveScore = () => {
    if (!editingFixture) return;

    // Chuyển đổi an toàn: nếu để trống hoặc không hợp lệ thì mặc định là 0 bàn
    const sA = isNaN(parseInt(scoreA, 10)) ? 0 : Math.max(0, parseInt(scoreA, 10));
    const sB = isNaN(parseInt(scoreB, 10)) ? 0 : Math.max(0, parseInt(scoreB, 10));

    lastLocalSaveTimeRef.current = Date.now();

    // Cập nhật trạng thái trận đấu trong fixtures
    const updatedFixtures = fixtures.map(f => {
      if (f.id === editingFixture.id) {
        return {
          ...f,
          played: true,
          scoreA: sA,
          scoreB: sB,
          scorersA: (scorersA || '').trim(),
          scorersB: (scorersB || '').trim(),
          yellowA: (yellowA || '').trim(),
          yellowB: (yellowB || '').trim(),
          redA: (redA || '').trim(),
          redB: (redB || '').trim()
        };
      }
      return f;
    });
    setFixtures(updatedFixtures);
    localStorage.setItem('pes_c1_league_fixtures_official_v5', JSON.stringify(updatedFixtures));
    pushFixturesToCloud(updatedFixtures);

    // Tìm id player tương ứng
    const pA = (rawPlayers.length > 0 ? rawPlayers : players).find(p => p.name === editingFixture.teamA || p.team === editingFixture.teamA);
    const pB = (rawPlayers.length > 0 ? rawPlayers : players).find(p => p.name === editingFixture.teamB || p.team === editingFixture.teamB);

    const matchRecord = {
      id: `match_${editingFixture.id}_${Date.now()}`,
      fixtureId: editingFixture.id,
      playerAId: pA?.id || editingFixture.ownerA.toLowerCase(),
      playerBId: pB?.id || editingFixture.ownerB.toLowerCase(),
      teamA: editingFixture.teamA,
      teamB: editingFixture.teamB,
      scoreA: sA,
      scoreB: sB,
      scorersA: (scorersA || '').trim(),
      scorersB: (scorersB || '').trim(),
      yellowA: (yellowA || '').trim(),
      yellowB: (yellowB || '').trim(),
      redA: (redA || '').trim(),
      redB: (redB || '').trim(),
      date: new Date().toISOString(),
      type: 'league'
    };

    if (setMatches) {
      setMatches(prev => {
        // Xóa kết quả cũ của trận có cùng fixtureId nếu đã từng nhập
        const filtered = prev.filter(m => (m.fixtureId ? m.fixtureId !== editingFixture.id : m.id !== `match_${editingFixture.id}`));
        const nextMatches = [matchRecord, ...filtered];
        try {
          localStorage.setItem('pes_matches', JSON.stringify(nextMatches));
        } catch (e) {}
        return nextMatches;
      });
    }

    setToastMsg(`⚽ Đã ghi nhận: ${editingFixture.teamA} ${sA} - ${sB} ${editingFixture.teamB} thành công!`);
    setTimeout(() => setToastMsg(null), 3500);

    setEditingFixture(null);
    editingFixtureRef.current = null;
  };


  // TỰ ĐỘNG CHỐT VÒNG BẢNG & PHÂN BỔ 20 ĐỘI VÀO CÂY KNOCK-OUT
  const handleAdvanceToKnockout = () => {
    const playedCount = fixtures.filter(f => f.played).length;
    if (playedCount < 10) {
      if (!confirm(`Bạn mới chỉ thi đấu ${playedCount}/${fixtures.length} trận. Bạn có chắc chắn muốn chốt bảng xếp hạng hiện tại và chuyển sang Knock-out?`)) {
        return;
      }
    } else {
      if (!confirm('Xác nhận CHỐT BẢNG XẾP HẠNG: Top 20 đội đi tiếp (Top 12 vào Vòng 1/8, Hạng 13-20 đá Play-off), 8 đội chót bị loại?')) {
        return;
      }
    }

    // Lấy danh sách 28 đội đã sắp xếp theo thứ hạng từ #1 đến #28
    const sorted = [...players];
    const top12 = sorted.slice(0, 12);
    const playoffTeams = sorted.slice(12, 20); // Hạng 13 đến 20 (8 đội)
    const eliminated = sorted.slice(20, 28); // Hạng 21 đến 28 (8 đội)

    // Tạo cấu trúc cây Knock-out mới với 20 đội
    const knockoutSetup = {
      format: '20_teams',
      matches: [
        // 4 CẶP PLAY-OFF TRANH 4 VÉ VÀO VÒNG 1/8
        { 
          id: 'po1', round: 'playoff', name: 'Play-off 1', 
          teamA: playoffTeams[0]?.name || 'Hạng 13', 
          teamB: playoffTeams[7]?.name || 'Hạng 20', 
          scoreA: '', scoreB: '', penA: '', penB: '', winner: null, 
          nextId: 'r16_4', nextSlot: 'teamB' 
        },
        { 
          id: 'po2', round: 'playoff', name: 'Play-off 2', 
          teamA: playoffTeams[1]?.name || 'Hạng 14', 
          teamB: playoffTeams[6]?.name || 'Hạng 19', 
          scoreA: '', scoreB: '', penA: '', penB: '', winner: null, 
          nextId: 'r16_3', nextSlot: 'teamB' 
        },
        { 
          id: 'po3', round: 'playoff', name: 'Play-off 3', 
          teamA: playoffTeams[2]?.name || 'Hạng 15', 
          teamB: playoffTeams[5]?.name || 'Hạng 18', 
          scoreA: '', scoreB: '', penA: '', penB: '', winner: null, 
          nextId: 'r16_2', nextSlot: 'teamB' 
        },
        { 
          id: 'po4', round: 'playoff', name: 'Play-off 4', 
          teamA: playoffTeams[3]?.name || 'Hạng 16', 
          teamB: playoffTeams[4]?.name || 'Hạng 17', 
          scoreA: '', scoreB: '', penA: '', penB: '', winner: null, 
          nextId: 'r16_1', nextSlot: 'teamB' 
        },

        // VÒNG 1/8 (8 CẶP ĐẤU)
        { id: 'r16_1', round: 'r16', name: 'Vòng 1/8 - 1', teamA: top12[0]?.name || 'Hạng 1', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf1', nextSlot: 'teamA' },
        { id: 'r16_2', round: 'r16', name: 'Vòng 1/8 - 2', teamA: top12[1]?.name || 'Hạng 2', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf1', nextSlot: 'teamB' },
        { id: 'r16_3', round: 'r16', name: 'Vòng 1/8 - 3', teamA: top12[2]?.name || 'Hạng 3', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf2', nextSlot: 'teamA' },
        { id: 'r16_4', round: 'r16', name: 'Vòng 1/8 - 4', teamA: top12[3]?.name || 'Hạng 4', teamB: '', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf2', nextSlot: 'teamB' },
        { id: 'r16_5', round: 'r16', name: 'Vòng 1/8 - 5', teamA: top12[4]?.name || 'Hạng 5', teamB: top12[11]?.name || 'Hạng 12', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf3', nextSlot: 'teamA' },
        { id: 'r16_6', round: 'r16', name: 'Vòng 1/8 - 6', teamA: top12[5]?.name || 'Hạng 6', teamB: top12[10]?.name || 'Hạng 11', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf3', nextSlot: 'teamB' },
        { id: 'r16_7', round: 'r16', name: 'Vòng 1/8 - 7', teamA: top12[6]?.name || 'Hạng 7', teamB: top12[9]?.name || 'Hạng 10', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf4', nextSlot: 'teamA' },
        { id: 'r16_8', round: 'r16', name: 'Vòng 1/8 - 8', teamA: top12[7]?.name || 'Hạng 8', teamB: top12[8]?.name || 'Hạng 9', scoreA: '', scoreB: '', penA: '', penB: '', winner: null, nextId: 'qf4', nextSlot: 'teamB' },

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

    localStorage.setItem('pes_c1_knockout_bracket', JSON.stringify(knockoutSetup));
    supabase.from('custom_tables').upsert({
      id: 'pes_c1_knockout_bracket_sync',
      name: 'Cây Knock-out C1 20 Đội',
      headers: ['bracket_json'],
      rows: [[JSON.stringify(knockoutSetup)]]
    }).catch(e => console.error(e));

    // Chuyển hướng sang tab Knock-out
    if (setActiveTab) {
      setActiveTab('knockout');
    } else {
      window.dispatchEvent(new CustomEvent('changeTab', { detail: 'knockout' }));
    }
  };

  // Xóa sạch toàn bộ kết quả thi đấu & đưa giải đấu về 0 điểm
  const handleResetAllLeagueData = () => {
    if (!confirm('XÁC NHẬN: Bạn có chắc chắn muốn XÓA SẠCH TOÀN BỘ KẾT QUẢ ĐÃ ĐẤU, đưa điểm số 28 đội về 0 và đặt lại lịch thi đấu chính thức (Vòng 1)?')) return;

    setFixtures(DEFAULT_ROUND_1_FIXTURES);
    setSelectedRoundTab('all');
    localStorage.setItem('pes_c1_league_fixtures_official_v5', JSON.stringify(DEFAULT_ROUND_1_FIXTURES));
    pushFixturesToCloud(DEFAULT_ROUND_1_FIXTURES);
    localStorage.removeItem('pes_c1_knockout_bracket');
    supabase.from('custom_tables').delete().eq('id', 'pes_c1_knockout_bracket_sync').catch(e => console.error(e));
    localStorage.setItem('pes_matches', JSON.stringify([]));
    localStorage.setItem('pes_tourney_matches', JSON.stringify([]));

    if (setMatches) {
      setMatches([]);
    }
  };

  // Cấu hình 7 bảng đấu cũ nếu người dùng muốn xem chế độ bảng con
  const groups = {
    'A': ['Arsenal', 'Porto', 'Chelsea', 'Villarreal'],
    'B': ['Manchester City', 'Lyon', 'Barcelona', 'Manchester United'],
    'C': ['Real Madrid', 'Sporting CP', 'Atlético Madrid', 'Liverpool'],
    'D': ['Roma', 'Aston Villa', 'Inter Milan', 'Bayern Munich'],
    'E': ['Stuttgart', 'Napoli', 'Borussia Dortmund', 'Real Betis'],
    'F': ['Paris Saint-Germain', 'RB Leipzig', 'Lens', 'Lille'],
    'G': ['Galatasaray', 'Como', 'Fenerbahçe', 'Athletic Bilbao'],
  };

  const getTeamStats = (teamName) => {
    const tClean = teamName.trim().toLowerCase();
    const found = players.find(p => {
      const pClean = (p.name || '').trim().toLowerCase();
      if (pClean === tClean) return true;
      if (tClean === 'psg' && pClean.includes('paris')) return true;
      if (pClean === 'psg' && tClean.includes('paris')) return true;
      return false;
    });
    return found || {
      name: teamName,
      owner: 'Chưa rõ',
      matches: 0, wins: 0, draws: 0, losses: 0,
      gf: 0, ga: 0, gd: 0, points: 0
    };
  };

  const playedFixturesCount = fixtures.filter(f => f.played).length;
  const progressPercent = Math.round((playedFixturesCount / fixtures.length) * 100);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Toast thông báo lưu kết quả thành công */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-[100] px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs sm:text-sm shadow-[0_0_30px_rgba(34,197,94,0.6)] border border-green-300 flex items-center gap-3 backdrop-blur-xl font-mono"
          >
            <CheckCircle2 size={20} className="text-white shrink-0 animate-bounce" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Header */}
      <div className="glass-card p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[10px] font-black uppercase tracking-widest text-[#00f2ff] font-mono">
            <Sparkles size={12} className="text-[#ffd700]" />
            THỂ THỨC MỚI UEFA LEAGUE PHASE (SWISS MODEL)
          </div>
          <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase font-bebas text-white">
            VÒNG BẢNG <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#ffd700]">CHAMPIONS LEAGUE 28 ĐỘI</span>
          </h2>
          <p className="text-ucl-silver text-xs font-montserrat">
            Bảng xếp hạng tổng 28 CLB • <strong className="text-[#00f2ff]">Top 1-12</strong> vào thẳng Vòng 1/8 • <strong className="text-[#ffd700]">Hạng 13-20</strong> đá Play-off • <strong className="text-red-400">8 đội chót</strong> bị loại
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* View Mode Toggle */}
          <div className="bg-black/50 p-1 rounded-xl border border-white/10 flex items-center">
            <button
              onClick={() => setViewMode('league')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                viewMode === 'league' ? "bg-[#00f2ff] text-black shadow-[0_0_15px_#00f2ff]" : "text-ucl-silver hover:text-white"
              )}
            >
              Bảng Tổng 28 Đội
            </button>
            <button
              onClick={() => setViewMode('fixtures')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                viewMode === 'fixtures' ? "bg-[#00f2ff] text-black shadow-[0_0_15px_#00f2ff]" : "text-ucl-silver hover:text-white"
              )}
            >
              Lịch Đấu & Nhập Điểm ({playedFixturesCount}/{fixtures.length})
            </button>
            <button
              onClick={() => setViewMode('groups')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                viewMode === 'groups' ? "bg-[#00f2ff] text-black shadow-[0_0_15px_#00f2ff]" : "text-ucl-silver hover:text-white"
              )}
            >
              7 Bảng Nhỏ
            </button>
          </div>

          {/* Random Draw Button */}
          <button
            onClick={() => handleGenerateRandomFixtures(1)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-bold uppercase tracking-wider hover:bg-[#ff2a5f]/20 hover:border-[#ff2a5f] hover:text-white transition-all shadow-md"
            title="Bốc thăm ngẫu nhiên các cặp đấu Thịnh vs Bu"
          >
            <Shuffle size={14} className="text-[#ff2a5f]" />
            Bốc thăm lịch đấu
          </button>

          {/* Reset All Data Button */}
          <button
            onClick={handleResetAllLeagueData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-red-500/30 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 hover:border-red-500 hover:text-white transition-all shadow-md"
            title="Xóa toàn bộ kết quả đã đấu và đưa điểm số 28 đội về 0"
          >
            <RotateCcw size={14} className="text-red-400" />
            Xóa dữ liệu
          </button>

          {/* Advance to Knockout Button */}
          <button
            onClick={handleAdvanceToKnockout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffd700] to-[#ffae00] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,215,0,0.5)] hover:scale-105 active:scale-95 transition-all"
            title="Tự động lọc 20 đội đi tiếp và đưa vào Cây Knock-out"
          >
            <Trophy size={15} className="text-black" />
            Chốt & Đẩy vào Knock-out
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Progress Metric Bar */}
      <div className="glass-card p-4 flex items-center justify-between gap-4 border-l-4 border-l-[#00f2ff]">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-[#00f2ff]" />
          <div>
            <span className="text-xs font-black uppercase text-white font-bebas">TIẾN ĐỘ VÒNG BẢNG: {playedFixturesCount} / {fixtures.length} TRẬN</span>
            <p className="text-[10px] text-ucl-silver font-mono">Đã hoàn thành {progressPercent}% tổng số trận đấu</p>
          </div>
        </div>
        <div className="w-48 h-2.5 rounded-full bg-white/10 overflow-hidden hidden sm:block p-0.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#00f2ff] to-[#ffd700] transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* VIEW 1: BẢNG XẾP HẠNG TỔNG 28 ĐỘI (LEAGUE PHASE TABLE) */}
      {viewMode === 'league' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* Legend Banner */}
          <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-[10px] font-black uppercase tracking-wider font-mono bg-black/40">
            <span className="text-ucl-silver">QUY ĐỊNH SUẤT ĐI TIẾP:</span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#00f2ff]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]" />
                Top 1 - 12: Vào thẳng Vòng 1/8 (12 Đội)
              </span>
              <span className="flex items-center gap-1.5 text-[#ffd700]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffd700] shadow-[0_0_8px_#ffd700]" />
                Hạng 13 - 20: Suất Play-off (8 Đội)
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_red]" />
                Hạng 21 - 28: Bị loại trực tiếp (8 Đội)
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="w-full text-left border-collapse text-xs font-montserrat">
              <thead>
                <tr className="bg-[#030814]/90 text-ucl-silver text-[10px] uppercase tracking-wider font-bold border-b border-white/10 font-mono">
                  <th className="py-3.5 px-3 text-center w-12">Hạng</th>
                  <th className="py-3.5 px-3">Câu Lạc Bộ</th>
                  <th className="py-3.5 px-2 text-center w-8">T</th>
                  <th className="py-3.5 px-2 text-center w-8 text-green-400">W</th>
                  <th className="py-3.5 px-2 text-center w-8 text-yellow-400">D</th>
                  <th className="py-3.5 px-2 text-center w-8 text-red-400">L</th>
                  <th className="py-3.5 px-2 text-center w-10">BT</th>
                  <th className="py-3.5 px-2 text-center w-10">BB</th>
                  <th className="py-3.5 px-2 text-center w-12">HS</th>
                  <th className="py-3.5 px-3 text-center w-14 bg-[#00f2ff]/10 text-[#00f2ff] font-black">Điểm</th>
                  <th className="py-3.5 px-3 text-center">Trạng Thái Suất Đi Tiếp</th>
                </tr>
              </thead>
              <tbody>
                {players.map((team, idx) => {
                  const rank = idx + 1;
                  const isTop12 = rank <= 12;
                  const isPlayoff = rank > 12 && rank <= 20;
                  const isEliminated = rank > 20;

                  return (
                    <tr
                      key={team.name || team.id}
                      className={cn(
                        "border-b border-white/5 transition-colors hover:bg-white/5",
                        isTop12 ? "bg-[#00f2ff]/5" : isPlayoff ? "bg-[#ffd700]/5" : "bg-red-500/5 opacity-75"
                      )}
                    >
                      {/* Rank Number with Badge */}
                      <td className="py-3 px-3 text-center font-bold">
                        <span className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center text-xs mx-auto font-mono font-black",
                          rank === 1 ? "bg-[#ffd700] text-black shadow-[0_0_12px_#ffd700]" :
                          isTop12 ? "bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/40" :
                          isPlayoff ? "bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/40" :
                          "bg-white/5 text-slate-400"
                        )}>
                          {rank}
                        </span>
                      </td>

                      {/* Team Logo & Name & Owner Badge */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-black/40 p-1 flex items-center justify-center shrink-0 border border-white/10">
                            <img src={getTeamLogo(team.name)} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <span className={cn("text-xs sm:text-sm font-black italic tracking-wide truncate block", isTop12 ? "text-white" : "text-ucl-silver")}>
                              {team.name}
                            </span>
                            <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.2 rounded font-mono uppercase inline-block",
                              team.owner === 'THỊNH' ? "bg-[#ff2a5f]/20 text-[#ff2a5f] border border-[#ff2a5f]/30" : "bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30"
                            )}>
                              {team.owner}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Stats Numbers */}
                      <td className="py-3 px-2 text-center text-white/70 font-mono">{team.matches}</td>
                      <td className="py-3 px-2 text-center text-green-400 font-mono font-bold">{team.wins}</td>
                      <td className="py-3 px-2 text-center text-yellow-400 font-mono">{team.draws}</td>
                      <td className="py-3 px-2 text-center text-red-400 font-mono">{team.losses}</td>
                      <td className="py-3 px-2 text-center text-white/60 font-mono">{team.gf}</td>
                      <td className="py-3 px-2 text-center text-white/60 font-mono">{team.ga}</td>
                      <td className={cn("py-3 px-2 text-center font-mono font-bold", team.gd > 0 ? "text-green-400" : team.gd < 0 ? "text-red-400" : "text-white/60")}>
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </td>

                      {/* Points */}
                      <td className="py-3 px-3 text-center bg-[#00f2ff]/10 text-white font-black text-sm font-mono">
                        {team.points}
                      </td>

                      {/* Status Tag */}
                      <td className="py-3 px-3 text-center">
                        {isTop12 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00f2ff]/15 text-[#00f2ff] border border-[#00f2ff]/40 text-[9px] font-black uppercase tracking-wider font-mono">
                            <CheckCircle2 size={11} />
                            Vào thẳng 1/8
                          </span>
                        )}
                        {isPlayoff && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffd700]/15 text-[#ffd700] border border-[#ffd700]/40 text-[9px] font-black uppercase tracking-wider font-mono">
                            <Swords size={11} />
                            Suất Play-off
                          </span>
                        )}
                        {isEliminated && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[9px] font-black uppercase tracking-wider font-mono">
                            <XCircle size={11} />
                            Bị loại
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* VIEW 2: LỊCH THI ĐẤU & NHẬP ĐIỂM TRỰC TIẾP (MỖI Ô LÀ TỪNG VÒNG ĐẤU) */}
      {viewMode === 'fixtures' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Thanh Chọn Vòng & Thao Tác Nhanh */}
          <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Bộ lọc Tab Vòng */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
              <span className="text-[10px] font-black uppercase tracking-wider text-ucl-silver mr-1 font-mono shrink-0 flex items-center gap-1.5">
                <Layers size={13} className="text-[#00f2ff]" />
                CHỌN VÒNG:
              </span>
              <button
                onClick={() => setSelectedRoundTab('all')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 font-mono",
                  selectedRoundTab === 'all' 
                    ? "bg-[#00f2ff] text-black shadow-[0_0_15px_#00f2ff]" 
                    : "bg-white/5 text-ucl-silver hover:text-white border border-white/5"
                )}
              >
                Tất cả các vòng ({roundNumbers.length})
              </button>
              {roundNumbers.map((rNum) => {
                const count = fixtures.filter(f => (f.roundNumber || 1) === rNum).length;
                const rPlayed = fixtures.filter(f => (f.roundNumber || 1) === rNum && f.played).length;
                return (
                  <button
                    key={rNum}
                    onClick={() => setSelectedRoundTab(rNum)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 font-mono flex items-center gap-1.5",
                      selectedRoundTab === rNum 
                        ? "bg-[#00f2ff] text-black shadow-[0_0_15px_#00f2ff]" 
                        : "bg-white/5 text-ucl-silver hover:text-white border border-white/5"
                    )}
                  >
                    <span>Vòng {rNum}</span>
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded-full",
                      selectedRoundTab === rNum ? "bg-black/30 text-black font-bold" : "bg-white/10 text-white/60"
                    )}>
                      {rPlayed}/{count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Các nút thêm vòng & Đồng bộ Cloud */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setIsSyncingCloud(true);
                  fetchCloudFixtures().finally(() => setIsSyncingCloud(false));
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider font-mono transition-all shadow-md",
                  isSyncingCloud 
                    ? "bg-[#00f2ff]/20 text-[#00f2ff] border-[#00f2ff]/50 animate-pulse" 
                    : "bg-white/5 border-white/15 text-ucl-silver hover:text-white hover:border-[#00f2ff]/40"
                )}
                title="Nhấp để đồng bộ lịch thi đấu từ máy khác qua Cloud Supabase"
              >
                <RefreshCw size={13} className={cn("text-[#00f2ff]", isSyncingCloud && "animate-spin")} />
                <span>{isSyncingCloud ? 'Đang sync...' : 'Đồng bộ Cloud'}</span>
                {lastSyncedTime && <span className="text-[9px] text-white/40 hidden sm:inline">({lastSyncedTime})</span>}
              </button>
              <button
                onClick={handleAddReturnLegRound}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00f2ff]/20 to-[#0088ff]/20 border border-[#00f2ff]/40 text-xs font-bold uppercase tracking-wider text-white hover:border-[#00f2ff] hover:shadow-[0_0_15px_rgba(0,242,255,0.35)] transition-all shadow-md"
                title="Tự động đảo sân 14 cặp đấu tạo Vòng lượt về (Bu đá sân nhà)"
              >
                <Plus size={14} className="text-[#00f2ff]" />
                + Tạo Vòng {Math.max(...fixtures.map(f => f.roundNumber || 1), 0) + 1} (Lượt về)
              </button>
              <button
                onClick={handleGenerateNextRandomRound}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-bold uppercase tracking-wider text-ucl-silver hover:text-white hover:border-white/30 transition-all shadow-md"
                title="Bốc thăm ngẫu nhiên thêm một vòng đấu mới"
              >
                <Shuffle size={13} className="text-[#ff2a5f]" />
                + Thêm Vòng bốc thăm
              </button>
            </div>
          </div>

          {/* DANH SÁCH CÁC Ô TỪNG VÒNG (MỖI Ô LÀ 1 VÒNG ĐẤU RIÊNG BIỆT) */}
          <div className="space-y-8">
            {roundNumbers
              .filter(rNum => selectedRoundTab === 'all' || selectedRoundTab === rNum)
              .map((roundNum) => {
                const roundFixtures = fixtures.filter(f => (f.roundNumber || 1) === roundNum);
                const roundPlayed = roundFixtures.filter(f => f.played).length;
                const roundPct = roundFixtures.length > 0 ? Math.round((roundPlayed / roundFixtures.length) * 100) : 0;

                return (
                  <div 
                    key={roundNum}
                    className="glass-card p-6 md:p-8 space-y-6 border-2 border-white/15 hover:border-[#00f2ff]/40 transition-all rounded-3xl relative overflow-hidden shadow-2xl bg-black/50"
                  >
                    {/* Header của Ô Vòng này */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#00f2ff] via-[#0099ff] to-[#0044ff] flex items-center justify-center font-black font-bebas text-black text-2xl sm:text-3xl shadow-[0_0_25px_rgba(0,242,255,0.45)] shrink-0">
                          {roundNum}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-2xl sm:text-3xl font-black italic uppercase font-bebas text-white tracking-wide">
                              {roundNum === 1 ? 'VÒNG 1 • 14 CẶP ĐẤU CHÍNH THỨC' : `VÒNG ${roundNum} • LƯỢT ĐẤU THỨ ${roundNum}`}
                            </h3>
                            <span className={cn(
                              "text-[10px] font-black px-2.5 py-0.5 rounded-full border font-mono uppercase tracking-wider",
                              roundPlayed === roundFixtures.length && roundFixtures.length > 0
                                ? "bg-green-500/20 text-green-400 border-green-500/40"
                                : "bg-[#00f2ff]/15 text-[#00f2ff] border-[#00f2ff]/40"
                            )}>
                              {roundPlayed} / {roundFixtures.length} TRẬN HOÀN TẤT
                            </span>
                          </div>
                          <p className="text-xs text-ucl-silver font-montserrat mt-0.5">
                            {roundNum === 1 
                              ? '14 trận lượt đi chính thức theo danh sách bốc thăm • Sân nhà Thịnh 🔴 vs Sân khách Bu 🔵' 
                              : roundNum % 2 === 0 
                              ? '14 trận lượt về đảo sân • Sân nhà Bu 🔵 vs Sân khách Thịnh 🔴' 
                              : `Lượt thi đấu thứ ${roundNum}`}
                          </p>
                        </div>
                      </div>

                      {/* Tiến độ riêng của Ô Vòng này */}
                      <div className="flex items-center gap-3 shrink-0 bg-black/60 px-4 py-2.5 rounded-2xl border border-white/10">
                        <div className="text-right">
                          <span className="text-sm font-black font-mono text-[#00f2ff]">{roundPct}%</span>
                          <span className="text-[9px] text-ucl-silver block font-montserrat uppercase">Tiến độ vòng</span>
                        </div>
                        <div className="w-24 sm:w-32 h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#00f2ff] to-[#ffd700] transition-all duration-500" 
                            style={{ width: `${roundPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Danh sách 14 trận đấu của riêng Ô Vòng này */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roundFixtures.map((fixture) => (
                        <div
                          key={fixture.id}
                          onClick={() => openScoreModal(fixture)}
                          className={cn(
                            "glass-card p-4 border transition-all duration-300 cursor-pointer hover:scale-[1.01] group relative overflow-hidden",
                            fixture.played 
                              ? "border-green-500/40 bg-black/70 shadow-[0_0_20px_rgba(34,197,94,0.15)]" 
                              : "border-white/10 hover:border-[#00f2ff]/60 bg-black/40"
                          )}
                        >
                          <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5 text-[9px] font-black uppercase tracking-widest font-mono text-ucl-silver">
                            <span className="text-white/80 font-bold">{fixture.name}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full",
                              fixture.played ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/50"
                            )}>
                              {fixture.played ? 'ĐÃ HOÀN TẤT' : 'CHỜ ĐÁ'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            {/* Team A */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <img src={getTeamLogo(fixture.teamA)} alt="" className="w-8 h-8 object-contain shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-black italic truncate text-white">{fixture.teamA}</p>
                                <span className={cn(
                                  "text-[8px] font-black px-1.5 py-0.2 rounded font-mono uppercase",
                                  fixture.ownerA === 'THỊNH' ? "bg-[#ff2a5f]/20 text-[#ff2a5f]" : "bg-[#00f2ff]/20 text-[#00f2ff]"
                                )}>
                                  {fixture.ownerA}
                                </span>
                              </div>
                            </div>

                            {/* Score Display Box */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm font-mono border",
                                fixture.played ? "bg-[#00f2ff] text-black border-[#00f2ff] shadow-[0_0_10px_#00f2ff]" : "bg-white/5 text-white/40 border-white/10"
                              )}>
                                {fixture.played ? fixture.scoreA : '-'}
                              </span>
                              <span className="text-white/30 font-black">:</span>
                              <span className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm font-mono border",
                                fixture.played ? "bg-[#00f2ff] text-black border-[#00f2ff] shadow-[0_0_10px_#00f2ff]" : "bg-white/5 text-white/40 border-white/10"
                              )}>
                                {fixture.played ? fixture.scoreB : '-'}
                              </span>
                            </div>

                            {/* Team B */}
                            <div className="flex items-center gap-3 flex-1 justify-end min-w-0 text-right">
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-black italic truncate text-white">{fixture.teamB}</p>
                                <span className={cn(
                                  "text-[8px] font-black px-1.5 py-0.2 rounded font-mono uppercase",
                                  fixture.ownerB === 'THỊNH' ? "bg-[#ff2a5f]/20 text-[#ff2a5f]" : "bg-[#00f2ff]/20 text-[#00f2ff]"
                                )}>
                                  {fixture.ownerB}
                                </span>
                              </div>
                              <img src={getTeamLogo(fixture.teamB)} alt="" className="w-8 h-8 object-contain shrink-0" />
                            </div>
                          </div>

                          {/* Tóm tắt Người ghi bàn & Thẻ phạt nếu trận đã hoàn tất */}
                          {fixture.played && (fixture.scorersA || fixture.scorersB || fixture.yellowA || fixture.yellowB || fixture.redA || fixture.redB) && (
                            <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1">
                              {(fixture.scorersA || fixture.scorersB) && (
                                <div className="flex items-center justify-between text-[11px] font-mono gap-2">
                                  <div className="text-[#00f2ff] truncate max-w-[48%] flex items-center gap-1 font-semibold">
                                    {fixture.scorersA && <span>⚽ {fixture.scorersA}</span>}
                                  </div>
                                  <div className="text-[#00f2ff] truncate max-w-[48%] text-right flex items-center justify-end gap-1 font-semibold">
                                    {fixture.scorersB && <span>⚽ {fixture.scorersB}</span>}
                                  </div>
                                </div>
                              )}
                              {(fixture.yellowA || fixture.yellowB || fixture.redA || fixture.redB) && (
                                <div className="flex items-center justify-between text-[10px] font-mono gap-2 text-ucl-silver">
                                  <div className="text-yellow-400 truncate max-w-[48%]">
                                    {fixture.yellowA && <span>🟨 {fixture.yellowA}</span>}
                                    {fixture.redA && <span className="ml-1 text-red-400">🟥 {fixture.redA}</span>}
                                  </div>
                                  <div className="text-yellow-400 truncate max-w-[48%] text-right">
                                    {fixture.yellowB && <span>🟨 {fixture.yellowB}</span>}
                                    {fixture.redB && <span className="ml-1 text-red-400">🟥 {fixture.redB}</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* VIEW 3: 7 BẢNG ĐẤU TRUYỀN THỐNG (A - G) */}
      {viewMode === 'groups' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Object.entries(groups).map(([groupLetter, groupTeams]) => {
            const sortedGroup = groupTeams
              .map(t => getTeamStats(t))
              .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

            return (
              <div key={groupLetter} className="glass-card overflow-hidden">
                <div className="p-3.5 border-b border-white/10 bg-gradient-to-r from-[#00f2ff]/10 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#00f2ff] text-black font-black flex items-center justify-center font-bebas">
                      {groupLetter}
                    </div>
                    <h3 className="font-black uppercase text-white italic font-bebas">BẢNG {groupLetter}</h3>
                  </div>
                  <span className="text-[9px] text-ucl-silver uppercase font-mono">4 ĐỘI</span>
                </div>

                <div className="p-2 space-y-1">
                  {sortedGroup.map((t, idx) => (
                    <div 
                      key={t.name}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-xl text-xs",
                        idx < 2 ? "bg-white/5 font-bold" : "opacity-70"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white/50 w-4 text-center">{idx + 1}</span>
                        <img src={getTeamLogo(t.name)} alt="" className="w-5 h-5 object-contain" />
                        <span className="truncate">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-white/60 text-[10px]">{t.gd > 0 ? `+${t.gd}` : t.gd}</span>
                        <span className="text-[#00f2ff] font-black">{t.points}đ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* MODAL NHẬP KẾT QUẢ, CẦU THỦ GHI BÀN VÀ THẺ VÀNG / ĐỎ */}
      <AnimatePresence>
        {editingFixture && (
          <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-card max-w-4xl w-full p-4 sm:p-6 border-2 border-[#00f2ff]/50 shadow-[0_0_60px_rgba(0,242,255,0.25)] relative max-h-[92vh] flex flex-col rounded-3xl"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00f2ff] font-mono flex items-center gap-1.5">
                    <Sparkles size={12} /> KẾT QUẢ & DIỄN BIẾN TRẬN ĐẤU VÒNG BẢNG
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black italic uppercase font-bebas text-white">
                    {editingFixture.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingFixture(null)}
                  className="p-2 rounded-xl bg-white/5 text-ucl-silver hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto pr-1 sm:pr-2 py-3 space-y-5 custom-scrollbar flex-1">
                {/* 1. Phần Nhập Tỷ Số Đội A & Đội B */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Team A Score Box */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={getTeamLogo(editingFixture.teamA)} alt="" className="w-12 h-12 object-contain shrink-0 drop-shadow" />
                      <div className="min-w-0">
                        <p className="font-black italic text-base sm:text-lg text-white truncate">{editingFixture.teamA}</p>
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase inline-block",
                          editingFixture.ownerA === 'THỊNH' ? "bg-[#ff2a5f]/20 text-[#ff2a5f]" : "bg-[#00f2ff]/20 text-[#00f2ff]"
                        )}>
                          HLV: {editingFixture.ownerA}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold uppercase text-ucl-silver font-mono">BÀN THẮNG</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setScoreA(prev => String(Math.max(0, (parseInt(prev, 10) || 0) - 1)))}
                          className="w-8 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-all active:scale-95"
                          title="Giảm 1 bàn"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={scoreA}
                          onChange={(e) => setScoreA(e.target.value)}
                          className="w-14 h-12 text-center text-2xl font-black font-mono bg-black/70 border-2 border-[#00f2ff]/50 rounded-xl text-white focus:border-[#00f2ff] focus:shadow-[0_0_15px_#00f2ff] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setScoreA(prev => String((parseInt(prev, 10) || 0) + 1))}
                          className="w-8 h-10 rounded-lg bg-[#00f2ff]/20 hover:bg-[#00f2ff]/30 text-[#00f2ff] border border-[#00f2ff]/40 font-bold flex items-center justify-center transition-all active:scale-95"
                          title="Tăng 1 bàn"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Team B Score Box */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={getTeamLogo(editingFixture.teamB)} alt="" className="w-12 h-12 object-contain shrink-0 drop-shadow" />
                      <div className="min-w-0">
                        <p className="font-black italic text-base sm:text-lg text-white truncate">{editingFixture.teamB}</p>
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase inline-block",
                          editingFixture.ownerB === 'THỊNH' ? "bg-[#ff2a5f]/20 text-[#ff2a5f]" : "bg-[#00f2ff]/20 text-[#00f2ff]"
                        )}>
                          HLV: {editingFixture.ownerB}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold uppercase text-ucl-silver font-mono">BÀN THẮNG</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setScoreB(prev => String(Math.max(0, (parseInt(prev, 10) || 0) - 1)))}
                          className="w-8 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-all active:scale-95"
                          title="Giảm 1 bàn"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={scoreB}
                          onChange={(e) => setScoreB(e.target.value)}
                          className="w-14 h-12 text-center text-2xl font-black font-mono bg-black/70 border-2 border-[#00f2ff]/50 rounded-xl text-white focus:border-[#00f2ff] focus:shadow-[0_0_15px_#00f2ff] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setScoreB(prev => String((parseInt(prev, 10) || 0) + 1))}
                          className="w-8 h-10 rounded-lg bg-[#00f2ff]/20 hover:bg-[#00f2ff]/30 text-[#00f2ff] border border-[#00f2ff]/40 font-bold flex items-center justify-center transition-all active:scale-95"
                          title="Tăng 1 bàn"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Chi Tiết Chọn Người Ghi Bàn & Thẻ Phạt (2 Cột A & B) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CỘT CHI TIẾT ĐỘI A */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <img src={getTeamLogo(editingFixture.teamA)} alt="" className="w-5 h-5 object-contain" />
                        <span className="font-black italic text-xs uppercase text-white truncate max-w-[160px]">
                          {editingFixture.teamA} ({editingFixture.ownerA})
                        </span>
                      </div>
                      <span className="text-[10px] text-[#00f2ff] font-bold font-mono">ĐỘI HÌNH PES/C1</span>
                    </div>

                    {/* Người ghi bàn Đội A */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase tracking-wider text-[#00f2ff] flex items-center gap-1.5 font-mono">
                          ⚽ Cầu thủ ghi bàn:
                        </label>
                        {scorersA && (
                          <button
                            type="button"
                            onClick={() => setScorersA('')}
                            className="text-[9px] text-red-400 hover:text-red-300 font-mono"
                          >
                            Xóa hết
                          </button>
                        )}
                      </div>

                      {/* Danh sách chip chọn nhanh từ Squad */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] text-white/50 uppercase font-mono">
                          <span>Click tên để +1 bàn:</span>
                          <button
                            type="button"
                            onClick={() => setShowAddPlayerA(!showAddPlayerA)}
                            className="text-[#00f2ff] hover:underline flex items-center gap-1 font-bold"
                          >
                            <Plus size={10} /> {showAddPlayerA ? 'Đóng' : '+ Thêm chuyển nhượng'}
                          </button>
                        </div>

                        {showAddPlayerA && (
                          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/5 border border-[#00f2ff]/30">
                            <input
                              type="text"
                              placeholder="Tên cầu thủ chuyển nhượng mới..."
                              value={newPlayerNameA}
                              onChange={(e) => setNewPlayerNameA(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs bg-black/60 rounded-lg text-white border border-white/10 outline-none font-mono placeholder:text-white/30"
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddNewPlayer('A'); }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddNewPlayer('A')}
                              className="px-2.5 py-1 rounded-lg bg-[#00f2ff] text-black font-black text-[10px] uppercase font-mono hover:scale-105 active:scale-95 transition-all"
                            >
                              Thêm
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 rounded-xl bg-white/5 border border-white/5 custom-scrollbar">
                          {squadA.map(player => {
                            const count = getScorerCount(scorersA, player.name);
                            const isScorer = count > 0;
                            return (
                              <div
                                key={player.name}
                                className={cn(
                                  "inline-flex items-center rounded-lg text-[10px] font-bold font-mono transition-all border",
                                  isScorer 
                                    ? "bg-[#00f2ff]/25 border-[#00f2ff] text-white shadow-[0_0_10px_rgba(0,242,255,0.3)]" 
                                    : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30"
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleAddScorer('A', player.name)}
                                  className="px-2 py-1 flex items-center gap-1"
                                  title={`Thêm bàn thắng cho ${player.name}`}
                                >
                                  <span className="text-[8px] text-ucl-silver font-normal opacity-70">[{player.pos}]</span>
                                  <span>{player.name}</span>
                                  {isScorer && (
                                    <span className="px-1 py-0.2 rounded bg-[#00f2ff] text-black font-black text-[9px] ml-0.5">
                                      x{count}
                                    </span>
                                  )}
                                </button>
                                {isScorer && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveScorer('A', player.name)}
                                    className="px-1.5 py-1 text-red-400 hover:text-red-200 border-l border-white/10"
                                    title="Giảm 1 bàn"
                                  >
                                    <Minus size={10} />
                                  </button>
                                )}
                                {player.isCustom && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTransferPlayer('A', player.name)}
                                    className="px-1 py-1 text-white/40 hover:text-red-400 border-l border-white/10"
                                    title="Xóa cầu thủ khỏi CLB"
                                  >
                                    <X size={9} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ô nhập tuỳ ý */}
                      <input
                        type="text"
                        value={scorersA}
                        onChange={(e) => setScorersA(e.target.value)}
                        placeholder="VD: Lewandowski x2, Raphinha hoặc gõ tên khác..."
                        className="w-full px-3 py-2 text-xs bg-black/70 border border-white/15 rounded-xl text-white focus:border-[#00f2ff] outline-none font-mono placeholder:text-white/30"
                      />
                    </div>

                    {/* Thẻ vàng Đội A */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5 font-mono">
                          🟨 Thẻ vàng:
                        </label>
                        {yellowA && (
                          <button
                            type="button"
                            onClick={() => setYellowA('')}
                            className="text-[9px] text-red-400 hover:text-red-300 font-mono"
                          >
                            Xóa hết
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-[9px] text-white/50 uppercase font-mono">Click tên để bật/tắt thẻ vàng:</div>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-xl bg-white/5 border border-white/5 custom-scrollbar">
                          {squadA.map(player => {
                            const booked = hasYellow(yellowA, player.name);
                            return (
                              <button
                                key={player.name}
                                type="button"
                                onClick={() => handleToggleYellow('A', player.name)}
                                className={cn(
                                  "px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border flex items-center gap-1",
                                  booked 
                                    ? "bg-yellow-400/25 border-yellow-400 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.3)]" 
                                    : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30"
                                )}
                              >
                                <span>{player.name}</span>
                                {booked && <span className="w-2 h-3 bg-yellow-400 rounded-[1px] ml-0.5 inline-block" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={yellowA}
                        onChange={(e) => setYellowA(e.target.value)}
                        placeholder="VD: Araujo, Koundé hoặc gõ tên khác..."
                        className="w-full px-3 py-2 text-xs bg-black/70 border border-white/15 rounded-xl text-white focus:border-yellow-400 outline-none font-mono placeholder:text-white/30"
                      />
                    </div>

                    {/* Thẻ đỏ Đội A (Nếu có) */}
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1 font-mono">
                          🟥 Thẻ đỏ (nếu có):
                        </label>
                        {redA && (
                          <button
                            type="button"
                            onClick={() => setRedA('')}
                            className="text-[9px] text-red-400 hover:text-red-300 font-mono"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={redA}
                        onChange={(e) => setRedA(e.target.value)}
                        placeholder="Tên cầu thủ nhận thẻ đỏ..."
                        className="w-full px-3 py-1.5 text-xs bg-black/70 border border-white/15 rounded-xl text-white focus:border-red-500 outline-none font-mono placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  {/* CỘT CHI TIẾT ĐỘI B */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <img src={getTeamLogo(editingFixture.teamB)} alt="" className="w-5 h-5 object-contain" />
                        <span className="font-black italic text-xs uppercase text-white truncate max-w-[160px]">
                          {editingFixture.teamB} ({editingFixture.ownerB})
                        </span>
                      </div>
                      <span className="text-[10px] text-[#00f2ff] font-bold font-mono">ĐỘI HÌNH PES/C1</span>
                    </div>

                    {/* Người ghi bàn Đội B */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase tracking-wider text-[#00f2ff] flex items-center gap-1.5 font-mono">
                          ⚽ Cầu thủ ghi bàn:
                        </label>
                        {scorersB && (
                          <button
                            type="button"
                            onClick={() => setScorersB('')}
                            className="text-[9px] text-red-400 hover:text-red-300 font-mono"
                          >
                            Xóa hết
                          </button>
                        )}
                      </div>

                      {/* Danh sách chip chọn nhanh từ Squad */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] text-white/50 uppercase font-mono">
                          <span>Click tên để +1 bàn:</span>
                          <button
                            type="button"
                            onClick={() => setShowAddPlayerB(!showAddPlayerB)}
                            className="text-[#00f2ff] hover:underline flex items-center gap-1 font-bold"
                          >
                            <Plus size={10} /> {showAddPlayerB ? 'Đóng' : '+ Thêm chuyển nhượng'}
                          </button>
                        </div>

                        {showAddPlayerB && (
                          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/5 border border-[#00f2ff]/30">
                            <input
                              type="text"
                              placeholder="Tên cầu thủ chuyển nhượng mới..."
                              value={newPlayerNameB}
                              onChange={(e) => setNewPlayerNameB(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs bg-black/60 rounded-lg text-white border border-white/10 outline-none font-mono placeholder:text-white/30"
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddNewPlayer('B'); }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddNewPlayer('B')}
                              className="px-2.5 py-1 rounded-lg bg-[#00f2ff] text-black font-black text-[10px] uppercase font-mono hover:scale-105 active:scale-95 transition-all"
                            >
                              Thêm
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 rounded-xl bg-white/5 border border-white/5 custom-scrollbar">
                          {squadB.map(player => {
                            const count = getScorerCount(scorersB, player.name);
                            const isScorer = count > 0;
                            return (
                              <div
                                key={player.name}
                                className={cn(
                                  "inline-flex items-center rounded-lg text-[10px] font-bold font-mono transition-all border",
                                  isScorer 
                                    ? "bg-[#00f2ff]/25 border-[#00f2ff] text-white shadow-[0_0_10px_rgba(0,242,255,0.3)]" 
                                    : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30"
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleAddScorer('B', player.name)}
                                  className="px-2 py-1 flex items-center gap-1"
                                  title={`Thêm bàn thắng cho ${player.name}`}
                                >
                                  <span className="text-[8px] text-ucl-silver font-normal opacity-70">[{player.pos}]</span>
                                  <span>{player.name}</span>
                                  {isScorer && (
                                    <span className="px-1 py-0.2 rounded bg-[#00f2ff] text-black font-black text-[9px] ml-0.5">
                                      x{count}
                                    </span>
                                  )}
                                </button>
                                {isScorer && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveScorer('B', player.name)}
                                    className="px-1.5 py-1 text-red-400 hover:text-red-200 border-l border-white/10"
                                    title="Giảm 1 bàn"
                                  >
                                    <Minus size={10} />
                                  </button>
                                )}
                                {player.isCustom && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTransferPlayer('B', player.name)}
                                    className="px-1 py-1 text-white/40 hover:text-red-400 border-l border-white/10"
                                    title="Xóa cầu thủ khỏi CLB"
                                  >
                                    <X size={9} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>


                      {/* Ô nhập tuỳ ý */}
                      <input
                        type="text"
                        value={scorersB}
                        onChange={(e) => setScorersB(e.target.value)}
                        placeholder="VD: Rashford x2, Bruno Fernandes hoặc gõ tên khác..."
                        className="w-full px-3 py-2 text-xs bg-black/70 border border-white/15 rounded-xl text-white focus:border-[#00f2ff] outline-none font-mono placeholder:text-white/30"
                      />
                    </div>

                    {/* Thẻ vàng Đội B */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5 font-mono">
                          🟨 Thẻ vàng:
                        </label>
                        {yellowB && (
                          <button
                            type="button"
                            onClick={() => setYellowB('')}
                            className="text-[9px] text-red-400 hover:text-red-300 font-mono"
                          >
                            Xóa hết
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-[9px] text-white/50 uppercase font-mono">Click tên để bật/tắt thẻ vàng:</div>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-xl bg-white/5 border border-white/5 custom-scrollbar">
                          {squadB.map(player => {
                            const booked = hasYellow(yellowB, player.name);
                            return (
                              <button
                                key={player.name}
                                type="button"
                                onClick={() => handleToggleYellow('B', player.name)}
                                className={cn(
                                  "px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border flex items-center gap-1",
                                  booked 
                                    ? "bg-yellow-400/25 border-yellow-400 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.3)]" 
                                    : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30"
                                )}
                              >
                                <span>{player.name}</span>
                                {booked && <span className="w-2 h-3 bg-yellow-400 rounded-[1px] ml-0.5 inline-block" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={yellowB}
                        onChange={(e) => setYellowB(e.target.value)}
                        placeholder="VD: Casemiro, Lisandro Martínez hoặc gõ tên khác..."
                        className="w-full px-3 py-2 text-xs bg-black/70 border border-white/15 rounded-xl text-white focus:border-yellow-400 outline-none font-mono placeholder:text-white/30"
                      />
                    </div>

                    {/* Thẻ đỏ Đội B (Nếu có) */}
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1 font-mono">
                          🟥 Thẻ đỏ (nếu có):
                        </label>
                        {redB && (
                          <button
                            type="button"
                            onClick={() => setRedB('')}
                            className="text-[9px] text-red-400 hover:text-red-300 font-mono"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={redB}
                        onChange={(e) => setRedB(e.target.value)}
                        placeholder="Tên cầu thủ nhận thẻ đỏ..."
                        className="w-full px-3 py-1.5 text-xs bg-black/70 border border-white/15 rounded-xl text-white focus:border-red-500 outline-none font-mono placeholder:text-white/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingFixture(null)}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-ucl-silver hover:text-white hover:bg-white/10 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveScore}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#0084ff] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(0,242,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  LƯU KẾT QUẢ TRẬN ĐẤU
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupStage;
