export const cn = (...inputs) => {
  return inputs.filter(Boolean).join(' ');
};

export const calculateStandings = (players, matches) => {
  // Khởi tạo bảng thống kê sạch với mảng phong độ rỗng
  const stats = {};
  players.forEach(p => {
    stats[String(p.id)] = { 
      ...p, 
      matches: 0, wins: 0, draws: 0, losses: 0, 
      gf: 0, ga: 0, gd: 0, points: 0,
      form: [] // Mảng phong độ gần đây
    };
  });

  const scorers = {};
  const cards = {};

  // Sắp xếp trận đấu theo thời gian để tính toán chuỗi phong độ chính xác
  const sortedMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));

  sortedMatches.forEach(m => {
    const pAId = String(m.playerAId);
    const pBId = String(m.playerBId);
    
    if (!stats[pAId] || !stats[pBId]) return;

    // Ép kiểu số cho bàn thắng
    const sA = parseInt(m.scoreA) || 0;
    const sB = parseInt(m.scoreB) || 0;

    // Cập nhật số trận và bàn thắng
    stats[pAId].matches++;
    stats[pBId].matches++;
    stats[pAId].gf += sA;
    stats[pAId].ga += sB;
    stats[pBId].gf += sB;
    stats[pBId].ga += sA;

    // Tính điểm và Thắng/Hòa/Thua + Cập nhật Phong độ
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
          count = parseInt(match[2]);
        }
        const key = `${name} (${teamName})`;
        scorers[key] = (scorers[key] || 0) + count;
      });
    };
    processScorers(m.scorersA, m.teamA);
    processScorers(m.scorersB, m.teamB);

    // Xử lý Thẻ phạt
    const processCards = (cardStr, teamName, type) => {
      if (!cardStr) return;
      const parts = cardStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
      parts.forEach(name => {
        const key = `${name} (${teamName})`;
        if (!cards[key]) cards[key] = { yellow: 0, red: 0 };
        cards[key][type]++;
      });
    };
    processCards(m.yellowA, m.teamA, 'yellow');
    processCards(m.yellowB, m.teamB, 'yellow');
    processCards(m.redA, m.teamA, 'red');
    processCards(m.redB, m.teamB, 'red');
  });

  // Chốt hạ dữ liệu và tính HS cuối cùng
  const finalStandings = Object.values(stats).map(player => ({
    ...player,
    gd: player.gf - player.ga
  })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
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
