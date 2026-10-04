export const cn = (...inputs) => {
  return inputs.filter(Boolean).join(' ');
};

export const normalizeTeamKey = (name) => {
  if (!name) return '';
  let s = String(name).toLowerCase().trim();
  // Bỏ dấu tiếng Việt / Latinh / Thổ Nhĩ Kỳ (ç -> c, é -> e, etc.)
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (s === 'psg' || s.includes('paris')) return 'parissaintgermain';
  if (s === 'barca' || s.includes('barcelona')) return 'barcelona';
  if (s === 'real' || s.includes('real madrid')) return 'realmadrid';
  if (s.includes('atletico')) return 'atleticomadrid';
  if (s.includes('man city') || s.includes('manchester city') || s === 'mancity') return 'manchestercity';
  if (s.includes('man utd') || s.includes('manchester united') || s === 'mu' || s.includes('man united')) return 'manchesterunited';
  if (s.includes('dortmund') || s === 'bvb' || s.includes('borussia')) return 'borussiadortmund';
  if (s.includes('inter')) return 'intermilan';
  if (s.includes('bayern')) return 'bayernmunich';
  if (s.includes('bilbao') || s.includes('athletic')) return 'athleticbilbao';
  if (s.includes('sporting')) return 'sportingcp';
  if (s.includes('roma') && !s.includes('como')) return 'roma';
  if (s.includes('stuttgart')) return 'stuttgart';
  if (s.includes('fenerbahce') || s.includes('fenerbahce')) return 'fenerbahce';
  if (s.includes('galatasaray')) return 'galatasaray';
  if (s.includes('lens')) return 'lens';
  if (s.includes('arsenal')) return 'arsenal';
  if (s.includes('chelsea')) return 'chelsea';
  if (s.includes('liverpool')) return 'liverpool';
  if (s.includes('aston villa') || s.includes('villa')) return 'astonvilla';
  if (s.includes('betis')) return 'realbetis';
  if (s.includes('villarreal')) return 'villarreal';
  if (s.includes('como')) return 'como';
  if (s.includes('napoli')) return 'napoli';
  if (s.includes('leipzig')) return 'rbleipzig';
  if (s.includes('lyon')) return 'lyon';
  if (s.includes('lille')) return 'lille';
  if (s.includes('porto')) return 'porto';

  return s.replace(/[^a-z0-9]/g, '');
};

// Chuyển đổi và đồng bộ danh sách fixtures đã đá của Vòng bảng sang matches
export const syncLeagueFixturesToMatches = (fixtures = [], allPlayers = [], currentMatches = []) => {
  if (!Array.isArray(fixtures) || fixtures.length === 0) return currentMatches;

  const playerMap = {};
  allPlayers.forEach(p => {
    playerMap[normalizeTeamKey(p.name)] = p.id;
    playerMap[normalizeTeamKey(p.team)] = p.id;
  });

  const matchMap = new Map();
  // Đưa các matches hiện tại vào map
  (currentMatches || []).forEach(m => {
    const key = m.fixtureId || `${normalizeTeamKey(m.teamA)}_${normalizeTeamKey(m.teamB)}`;
    matchMap.set(key, m);
  });

  // Duyệt qua các fixture đã hoàn thành
  fixtures.forEach(f => {
    if (!f.played && f.scoreA === '' && f.scoreB === '') return;
    if (f.scoreA === '' || f.scoreA === null || f.scoreA === undefined) return;
    if (f.scoreB === '' || f.scoreB === null || f.scoreB === undefined) return;

    const sA = parseInt(f.scoreA, 10);
    const sB = parseInt(f.scoreB, 10);
    if (isNaN(sA) || isNaN(sB)) return;

    const pAId = playerMap[normalizeTeamKey(f.teamA)] || f.teamA;
    const pBId = playerMap[normalizeTeamKey(f.teamB)] || f.teamB;
    const fixtureKey = f.id || `${normalizeTeamKey(f.teamA)}_${normalizeTeamKey(f.teamB)}`;

    matchMap.set(fixtureKey, {
      id: `match_${f.id || fixtureKey}`,
      fixtureId: f.id,
      playerAId: pAId,
      playerBId: pBId,
      teamA: f.teamA,
      teamB: f.teamB,
      scoreA: sA,
      scoreB: sB,
      scorersA: (f.scorersA || '').trim(),
      scorersB: (f.scorersB || '').trim(),
      yellowA: (f.yellowA || '').trim(),
      yellowB: (f.yellowB || '').trim(),
      redA: (f.redA || '').trim(),
      redB: (f.redB || '').trim(),
      date: f.date || new Date().toISOString(),
      roundNumber: f.roundNumber || 1,
      type: 'league'
    });
  });

  return Array.from(matchMap.values());
};

export const calculateStandings = (players = [], matches = [], leagueFixtures = null) => {
  // Khởi tạo bảng thống kê sạch cho từng CLB
  const stats = {};
  const teamKeyToId = {};

  players.forEach(p => {
    const id = String(p.id);
    stats[id] = { 
      ...p, 
      matches: 0, wins: 0, draws: 0, losses: 0, 
      gf: 0, ga: 0, gd: 0, points: 0,
      form: [] // Mảng phong độ gần đây: 'W', 'D', 'L'
    };
    teamKeyToId[normalizeTeamKey(p.name)] = id;
    teamKeyToId[normalizeTeamKey(p.team)] = id;
    teamKeyToId[id] = id;
  });

  // Tự động gộp các trận đã đấu từ Vòng bảng (GroupStage Fixtures) nếu có
  let allFixtures = leagueFixtures;
  if (!allFixtures && typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem('pes_c1_league_fixtures_official_v5');
      if (saved) allFixtures = JSON.parse(saved);
    } catch (e) {}
  }

  // Gộp các trận đấu không trùng lặp
  const matchMap = new Map();
  (matches || []).forEach(m => {
    const key = m.fixtureId || `${normalizeTeamKey(m.teamA)}_${normalizeTeamKey(m.teamB)}`;
    matchMap.set(key, m);
  });

  if (Array.isArray(allFixtures)) {
    allFixtures.forEach(f => {
      if (!f.played && f.scoreA === '' && f.scoreB === '') return;
      if (f.scoreA === '' || f.scoreA === null || f.scoreA === undefined) return;
      if (f.scoreB === '' || f.scoreB === null || f.scoreB === undefined) return;

      const key = f.id || `${normalizeTeamKey(f.teamA)}_${normalizeTeamKey(f.teamB)}`;
      if (!matchMap.has(key)) {
        matchMap.set(key, {
          id: `match_${f.id}`,
          fixtureId: f.id,
          playerAId: teamKeyToId[normalizeTeamKey(f.teamA)] || f.teamA,
          playerBId: teamKeyToId[normalizeTeamKey(f.teamB)] || f.teamB,
          teamA: f.teamA,
          teamB: f.teamB,
          scoreA: Number(f.scoreA),
          scoreB: Number(f.scoreB),
          scorersA: f.scorersA || '',
          scorersB: f.scorersB || '',
          yellowA: f.yellowA || '',
          yellowB: f.yellowB || '',
          redA: f.redA || '',
          redB: f.redB || '',
          date: f.date || '2026-01-01',
          type: 'league'
        });
      }
    });
  }

  const allMatchesList = Array.from(matchMap.values());
  const scorers = {};
  const cards = {};

  // Sắp xếp trận đấu theo thời gian để tính toán chuỗi phong độ chính xác
  const sortedMatches = allMatchesList.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  sortedMatches.forEach(m => {
    const sA = parseInt(m.scoreA, 10);
    const sB = parseInt(m.scoreB, 10);
    if (isNaN(sA) || isNaN(sB)) return;

    // Tìm id chính xác của Đội A và Đội B
    const pAId = teamKeyToId[String(m.playerAId)] || 
                 teamKeyToId[normalizeTeamKey(m.teamA)] || 
                 teamKeyToId[normalizeTeamKey(m.nameA)];

    const pBId = teamKeyToId[String(m.playerBId)] || 
                 teamKeyToId[normalizeTeamKey(m.teamB)] || 
                 teamKeyToId[normalizeTeamKey(m.nameB)];
    
    if (!pAId || !pBId || !stats[pAId] || !stats[pBId]) return;

    // Cập nhật số trận và bàn thắng
    stats[pAId].matches++;
    stats[pBId].matches++;
    stats[pAId].gf += sA;
    stats[pAId].ga += sB;
    stats[pBId].gf += sB;
    stats[pBId].ga += sA;

    // QUY TẮC TÍNH ĐIỂM CHUẨN BÓNG ĐÁ C1:
    // Thắng = +3 điểm | Hòa = +1 điểm (cả 2 đội) | Thua = 0 điểm
    if (sA > sB) {
      stats[pAId].wins++;
      stats[pAId].points += 3;
      stats[pAId].form.push('W');

      stats[pBId].losses++;
      stats[pBId].form.push('L');
    } else if (sA < sB) {
      stats[pBId].wins++;
      stats[pBId].points += 3;
      stats[pBId].form.push('W');

      stats[pAId].losses++;
      stats[pAId].form.push('L');
    } else {
      // HÒA: CẢ 2 ĐỘI ĐỀU ĐƯỢC CHÍNH XÁC 1 ĐIỂM
      stats[pAId].draws++;
      stats[pAId].points += 1;
      stats[pAId].form.push('D');

      stats[pBId].draws++;
      stats[pBId].points += 1;
      stats[pBId].form.push('D');
    }

    // Giới hạn phong độ trong 5 trận gần nhất
    if (stats[pAId].form.length > 5) stats[pAId].form.shift();
    if (stats[pBId].form.length > 5) stats[pBId].form.shift();

    // Xử lý Vua phá lưới
    const processScorers = (scorerStr, teamName) => {
      if (!scorerStr) return;
      const parts = scorerStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
      parts.forEach(part => {
        let name = part;
        let count = 1;
        const match = part.match(/(.+?)\s*[xX(](\d+)\)?$/);
        if (match) {
          name = match[1].trim();
          count = parseInt(match[2], 10) || 1;
        }
        const key = `${name} (${teamName})`;
        scorers[key] = (scorers[key] || 0) + count;
      });
    };
    processScorers(m.scorersA, m.teamA || stats[pAId]?.name);
    processScorers(m.scorersB, m.teamB || stats[pBId]?.name);

    // Xử lý Thẻ phạt
    const processCards = (cardStr, teamName, type) => {
      if (!cardStr) return;
      const parts = cardStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
      parts.forEach(name => {
        const key = `${name.trim()} (${teamName})`;
        if (!cards[key]) cards[key] = { yellow: 0, red: 0 };
        cards[key][type]++;
      });
    };
    processCards(m.yellowA, m.teamA || stats[pAId]?.name, 'yellow');
    processCards(m.yellowB, m.teamB || stats[pBId]?.name, 'yellow');
    processCards(m.redA, m.teamA || stats[pAId]?.name, 'red');
    processCards(m.redB, m.teamB || stats[pBId]?.name, 'red');
  });

  // Chốt hạ dữ liệu và tính hiệu số bàn thắng (gd)
  const finalStandings = Object.values(stats).map(player => ({
    ...player,
    gd: player.gf - player.ga
  })).sort((a, b) => {
    // 1. Điểm số cao hơn xếp trên
    if (b.points !== a.points) return b.points - a.points;
    // 2. Hiệu số bàn thắng cao hơn xếp trên
    if (b.gd !== a.gd) return b.gd - a.gd;
    // 3. Số bàn thắng ghi được nhiều hơn xếp trên
    if (b.gf !== a.gf) return b.gf - a.gf;
    // 4. Số trận thắng nhiều hơn xếp trên
    return b.wins - a.wins;
  });

  const finalScorers = Object.entries(scorers)
    .map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals);

  const finalCards = Object.entries(cards)
    .map(([name, data]) => ({ name, ...data, total: data.yellow + (data.red * 2) }))
    .sort((a, b) => b.total - a.total);

  return { standings: finalStandings, topScorers: finalScorers, topCards: finalCards };
};

export const getTeamLogo = (teamName) => {
  if (!teamName) return '/logo.jpg';
  const name = teamName.toLowerCase().trim();
  
  // Mapping 28 câu lạc bộ C1 (14 Thịnh - 14 Bu)
  const logoMap = {
    // 🔴 Thịnh (14 đội)
    'arsenal': '/logos/arsenal.png',
    'chelsea': '/logos/chelsea.png',
    'manchester city': '/logos/manchester-city.png',
    'man city': '/logos/manchester-city.png',
    'mancity': '/logos/manchester-city.png',
    'barcelona': '/logos/barcelona.png',
    'barca': '/logos/barcelona.png',
    'real madrid': '/logos/real-madrid.png',
    'real': '/logos/real-madrid.png',
    'atlético madrid': '/logos/atletico-madrid.png',
    'atletico madrid': '/logos/atletico-madrid.png',
    'atlético': '/logos/atletico-madrid.png',
    'atletico': '/logos/atletico-madrid.png',
    'roma': '/logos/roma.png',
    'as roma': '/logos/roma.png',
    'inter milan': '/logos/inter-milan.png',
    'inter': '/logos/inter-milan.png',
    'stuttgart': '/logos/stuttgart.png',
    'vfb stuttgart': '/logos/stuttgart.png',
    'borussia dortmund': '/logos/borussia-dortmund.png',
    'dortmund': '/logos/borussia-dortmund.png',
    'bvb': '/logos/borussia-dortmund.png',
    'paris saint-germain': '/logos/paris-saint-germain.png',
    'paris saint germain': '/logos/paris-saint-germain.png',
    'paris': '/logos/paris-saint-germain.png',
    'psg': '/logos/paris-saint-germain.png',
    'lens': '/logos/lens.png',
    'rc lens': '/logos/lens.png',
    'galatasaray': '/logos/galatasaray.png',
    'fenerbahçe': '/logos/fenerbahce.png',
    'fenerbahce': '/logos/fenerbahce.png',

    // 🔵 Bu (14 đội)
    'manchester united': '/logos/manchester-united.png',
    'man united': '/logos/manchester-united.png',
    'man utd': '/logos/manchester-united.png',
    'mu': '/logos/manchester-united.png',
    'liverpool': '/logos/liverpool.png',
    'aston villa': '/logos/aston-villa.png',
    'villa': '/logos/aston-villa.png',
    'athletic bilbao': '/logos/athletic-bilbao.png',
    'athletic club': '/logos/athletic-bilbao.png',
    'bilbao': '/logos/athletic-bilbao.png',
    'real betis': '/logos/real-betis.png',
    'betis': '/logos/real-betis.png',
    'villarreal': '/logos/villarreal.png',
    'como': '/logos/como.png',
    'como 1907': '/logos/como.png',
    'napoli': '/logos/napoli.png',
    'rb leipzig': '/logos/rb-leipzig.png',
    'leipzig': '/logos/rb-leipzig.png',
    'bayern munich': '/logos/bayern-munich.png',
    'bayern münchen': '/logos/bayern-munich.png',
    'bayern': '/logos/bayern-munich.png',
    'lyon': '/logos/lyon.png',
    'olympique lyonnais': '/logos/lyon.png',
    'lille': '/logos/lille.png',
    'losc': '/logos/lille.png',
    'porto': '/logos/porto.png',
    'fc porto': '/logos/porto.png',
    'sporting cp': '/logos/sporting-cp.png',
    'sporting lisbon': '/logos/sporting-cp.png',
    'sporting': '/logos/sporting-cp.png',
  };

  // Exact match first
  if (logoMap[name]) return logoMap[name];

  // Substring match
  for (const [key, url] of Object.entries(logoMap)) {
    if (name.includes(key) || key.includes(name)) return url;
  }
  
  return '/logo.jpg';
};
