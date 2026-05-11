export const cn = (...inputs) => {
  return inputs.filter(Boolean).join(' ');
};

export const calculateStandings = (players, matches) => {
  const stats = {};
  const scorers = {};
  const cards = {};

  players.forEach(p => {
    stats[p.id] = { ...p, matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 };
  });

  matches.forEach(m => {
    if (!stats[m.playerAId] || !stats[m.playerBId]) return;

    stats[m.playerAId].matches++;
    stats[m.playerBId].matches++;
    stats[m.playerAId].gf += m.scoreA;
    stats[m.playerAId].ga += m.scoreB;
    stats[m.playerBId].gf += m.scoreB;
    stats[m.playerBId].ga += m.scoreA;

    if (m.scoreA > m.scoreB) {
      stats[m.playerAId].wins++;
      stats[m.playerAId].points += 3;
      stats[m.playerBId].losses++;
    } else if (m.scoreA < m.scoreB) {
      stats[m.playerBId].wins++;
      stats[m.playerBId].points += 3;
      stats[m.playerAId].losses++;
    } else {
      stats[m.playerAId].draws++;
      stats[m.playerBId].draws++;
      stats[m.playerAId].points += 1;
      stats[m.playerBId].points += 1;
    }

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

    const processCards = (cardStr, teamName) => {
      if (!cardStr) return;
      const parts = cardStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
      parts.forEach(name => {
        const key = `${name} (${teamName})`;
        cards[key] = (cards[key] || 0) + 1;
      });
    };

    processCards(m.yellowA, m.teamA);
    processCards(m.yellowB, m.teamB);
    processCards(m.redA, m.teamA);
    processCards(m.redB, m.teamB);
  });

  const sortedStandings = Object.values(stats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });

  const sortedScorers = Object.entries(scorers)
    .map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals);

  const sortedCards = Object.entries(cards)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { standings: sortedStandings, topScorers: sortedScorers, topCards: sortedCards };
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
