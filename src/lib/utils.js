export const cn = (...inputs) => {
  return inputs.filter(Boolean).join(' ');
};

export const calculateStandings = (players, matches) => {
  // Khởi tạo bảng thống kê sạch
  const stats = {};
  players.forEach(p => {
    stats[String(p.id)] = { 
      ...p, 
      matches: 0, wins: 0, draws: 0, losses: 0, 
      gf: 0, ga: 0, gd: 0, points: 0 
    };
  });

  const scorers = {};
  const cards = {};

  matches.forEach(m => {
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

    // Tính điểm và Thắng/Hòa/Thua
    if (sA > sB) {
      stats[pAId].wins++;
      stats[pAId].points += 3;
      stats[pBId].losses++;
    } else if (sA < sB) {
      stats[pBId].wins++;
      stats[pBId].points += 3;
      stats[pAId].losses++;
    } else {
      stats[pAId].draws++;
      stats[pBId].draws++;
      stats[pAId].points += 1;
      stats[pBId].points += 1;
    }

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
  if (!teamName) return null;
  const name = teamName.toLowerCase();
  
  const logoMap = {
    'man city': 'https://media.api-sports.io/football/teams/50.png',
    'manchester city': 'https://media.api-sports.io/football/teams/50.png',
    'bayern': 'https://media.api-sports.io/football/teams/157.png',
    'newcastle': 'https://media.api-sports.io/football/teams/34.png',
    'villarreal': 'https://media.api-sports.io/football/teams/533.png',
    'man united': 'https://media.api-sports.io/football/teams/33.png',
    'manchester united': 'https://media.api-sports.io/football/teams/33.png',
    'psv': 'https://media.api-sports.io/football/teams/197.png',
    'olympic lyon': 'https://media.api-sports.io/football/teams/80.png',
    'napoli': 'https://media.api-sports.io/football/teams/492.png',
    'ac milan': 'https://media.api-sports.io/football/teams/489.png',
    'benfica': 'https://media.api-sports.io/football/teams/211.png',
    'real betis': 'https://media.api-sports.io/football/teams/543.png',
    'atletico': 'https://media.api-sports.io/football/teams/530.png',
    'real madrid': 'https://media.api-sports.io/football/teams/541.png',
    'tottenham': 'https://media.api-sports.io/football/teams/47.png',
    'arsenal': 'https://media.api-sports.io/football/teams/42.png',
    'olympiacos': 'https://media.api-sports.io/football/teams/553.png',
    'marseille': 'https://media.api-sports.io/football/teams/81.png'
  };

  for (const [key, url] of Object.entries(logoMap)) {
    if (name.includes(key)) return url;
  }
  
  return null;
};
