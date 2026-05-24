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
  if (!teamName) return 'https://flagcdn.com/w160/un.png';
  const name = teamName.toLowerCase().trim();
  
  const logoMap = {
    // Châu Á
    'qatar': 'https://flagcdn.com/w160/qa.png',
    'jordan': 'https://flagcdn.com/w160/jo.png',
    'uzbekistan': 'https://flagcdn.com/w160/uz.png',
    'iran': 'https://flagcdn.com/w160/ir.png',
    'nhật bản': 'https://flagcdn.com/w160/jp.png',
    'japan': 'https://flagcdn.com/w160/jp.png',
    'iraq': 'https://flagcdn.com/w160/iq.png',
    'australia': 'https://flagcdn.com/w160/au.png',
    'saudi arabia': 'https://flagcdn.com/w160/sa.png',
    'hàn quốc': 'https://flagcdn.com/w160/kr.png',
    'south korea': 'https://flagcdn.com/w160/kr.png',
    
    // Châu Phi
    'dr congo': 'https://flagcdn.com/w160/cd.png',
    'tunisia': 'https://flagcdn.com/w160/tn.png',
    'senegal': 'https://flagcdn.com/w160/sn.png',
    'algeria': 'https://flagcdn.com/w160/dz.png',
    'nam phi': 'https://flagcdn.com/w160/za.png',
    'south africa': 'https://flagcdn.com/w160/za.png',
    'ghana': 'https://flagcdn.com/w160/gh.png',
    'cape verde': 'https://flagcdn.com/w160/cv.png',
    'bờ biển ngà': 'https://flagcdn.com/w160/ci.png',
    'ivory coast': 'https://flagcdn.com/w160/ci.png',
    'maroc': 'https://flagcdn.com/w160/ma.png',
    'morocco': 'https://flagcdn.com/w160/ma.png',
    'ai cập': 'https://flagcdn.com/w160/eg.png',
    'egypt': 'https://flagcdn.com/w160/eg.png',
    
    // Bắc & Trung Mỹ
    'curaçao': 'https://flagcdn.com/w160/cw.png',
    'curacao': 'https://flagcdn.com/w160/cw.png',
    'mexico': 'https://flagcdn.com/w160/mx.png',
    'panama': 'https://flagcdn.com/w160/pa.png',
    'haiti': 'https://flagcdn.com/w160/ht.png',
    'mỹ': 'https://flagcdn.com/w160/us.png',
    'usa': 'https://flagcdn.com/w160/us.png',
    'canada': 'https://flagcdn.com/w160/ca.png',
    
    // Nam Mỹ
    'uruguay': 'https://flagcdn.com/w160/uy.png',
    'brazil': 'https://flagcdn.com/w160/br.png',
    'ecuador': 'https://flagcdn.com/w160/ec.png',
    'colombia': 'https://flagcdn.com/w160/co.png',
    'paraguay': 'https://flagcdn.com/w160/py.png',
    'argentina': 'https://flagcdn.com/w160/ar.png',
    
    // Châu Âu
    'tây ban nha': 'https://flagcdn.com/w160/es.png',
    'spain': 'https://flagcdn.com/w160/es.png',
    'anh': 'https://flagcdn.com/w160/gb-eng.png',
    'england': 'https://flagcdn.com/w160/gb-eng.png',
    'scotland': 'https://flagcdn.com/w160/gb-sct.png',
    'bỉ': 'https://flagcdn.com/w160/be.png',
    'belgium': 'https://flagcdn.com/w160/be.png',
    'thổ nhĩ kỳ': 'https://flagcdn.com/w160/tr.png',
    'turkey': 'https://flagcdn.com/w160/tr.png',
    'bosnia & herzegovina': 'https://flagcdn.com/w160/ba.png',
    'bosnia': 'https://flagcdn.com/w160/ba.png',
    'croatia': 'https://flagcdn.com/w160/hr.png',
    'đức': 'https://flagcdn.com/w160/de.png',
    'germany': 'https://flagcdn.com/w160/de.png',
    'ch séc': 'https://flagcdn.com/w160/cz.png',
    'czech republic': 'https://flagcdn.com/w160/cz.png',
    'hà lan': 'https://flagcdn.com/w160/nl.png',
    'netherlands': 'https://flagcdn.com/w160/nl.png',
    'pháp': 'https://flagcdn.com/w160/fr.png',
    'france': 'https://flagcdn.com/w160/fr.png',
    'thụy sĩ': 'https://flagcdn.com/w160/ch.png',
    'switzerland': 'https://flagcdn.com/w160/ch.png',
    'áo': 'https://flagcdn.com/w160/at.png',
    'austria': 'https://flagcdn.com/w160/at.png',
    'na uy': 'https://flagcdn.com/w160/no.png',
    'norway': 'https://flagcdn.com/w160/no.png',
    'bồ đào nha': 'https://flagcdn.com/w160/pt.png',
    'portugal': 'https://flagcdn.com/w160/pt.png',
    'thụy điển': 'https://flagcdn.com/w160/se.png',
    'sweden': 'https://flagcdn.com/w160/se.png',
    'italy': 'https://flagcdn.com/w160/it.png',
    
    // Châu Đại Dương
    'new zealand': 'https://flagcdn.com/w160/nz.png',
  };

  for (const [key, url] of Object.entries(logoMap)) {
    if (name.includes(key)) return url;
  }
  
  return 'https://flagcdn.com/w160/un.png';
};
