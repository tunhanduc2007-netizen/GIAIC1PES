import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const calculateStandings = (players, matches) => {
  const standings = players.map(p => ({
    ...p,
    matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0
  }));

  const scorers = {};

  matches.forEach(m => {
    const pA = standings.find(p => p.id === m.playerAId);
    const pB = standings.find(p => p.id === m.playerBId);

    if (pA && pB) {
      pA.matches++;
      pB.matches++;
      pA.gf += Number(m.scoreA || 0);
      pA.ga += Number(m.scoreB || 0);
      pB.gf += Number(m.scoreB || 0);
      pB.ga += Number(m.scoreA || 0);
      pA.gd = pA.gf - pA.ga;
      pB.gd = pB.gf - pB.ga;

      if (Number(m.scoreA) > Number(m.scoreB)) {
        pA.wins++; pA.points += 3; pB.losses++;
      } else if (Number(m.scoreA) < Number(m.scoreB)) {
        pB.wins++; pB.points += 3; pA.losses++;
      } else {
        pA.draws++; pB.draws++; pA.points += 1; pB.points += 1;
      }
    }

    // Process stats (Goals, Yellow, Red)
    const processStat = (name, type) => {
      if (!name) return;
      if (!scorers[name]) scorers[name] = { name, goals: 0, yellow: 0, red: 0 };
      if (type === 'goal') {
        // Handle goal counts if written as "Name (2)"
        const match = name.match(/(.*?)\s*\((\d+)\)/);
        if (match) {
          scorers[match[1].trim()].goals += parseInt(match[2]);
        } else {
          scorers[name].goals++;
        }
      }
      if (type === 'yellow') scorers[name].yellow++;
      if (type === 'red') scorers[name].red++;
    };

    const processStatString = (statString, type) => {
      if (!statString) return;
      statString.split(',').map(s => s.trim()).filter(s => s).forEach(name => {
        processStat(name, type);
      });
    };

    processStatString(m.scorersA, 'goal');
    processStatString(m.scorersB, 'goal');
    processStatString(m.yellowA, 'yellow');
    processStatString(m.yellowB, 'yellow');
    processStatString(m.redA, 'red');
    processStatString(m.redB, 'red');
  });

  const sortedStats = Object.values(scorers)
    .sort((a, b) => b.goals - a.goals || b.yellow - a.yellow || b.red - a.red);

  return {
    standings: standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.wins - a.wins;
    }),
    topScorers: sortedStats.filter(s => s.goals > 0),
    topCards: sortedStats.filter(s => s.yellow > 0 || s.red > 0)
  };
};

export const getTeamLogo = (teamName) => {
  if (!teamName) return null;
  const name = teamName.toLowerCase();
  
  const logoMap = {
    'tottenham': 'https://media.api-sports.io/football/teams/47.png',
    'arsenal': 'https://media.api-sports.io/football/teams/42.png',
    'man city': 'https://media.api-sports.io/football/teams/50.png',
    'manchester city': 'https://media.api-sports.io/football/teams/50.png',
    'bayern': 'https://media.api-sports.io/football/teams/157.png',
    'newcastle': 'https://media.api-sports.io/football/teams/34.png',
    'villarreal': 'https://media.api-sports.io/football/teams/533.png',
    'man united': 'https://media.api-sports.io/football/teams/33.png',
    'manchester united': 'https://media.api-sports.io/football/teams/33.png',
    'psv': 'https://media.api-sports.io/football/teams/197.png',
    'lyon': 'https://media.api-sports.io/football/teams/80.png',
    'napoli': 'https://media.api-sports.io/football/teams/492.png',
    'ac milan': 'https://media.api-sports.io/football/teams/489.png',
    'benfica': 'https://media.api-sports.io/football/teams/211.png',
    'real betis': 'https://media.api-sports.io/football/teams/543.png',
    'atletico': 'https://media.api-sports.io/football/teams/530.png',
    'real madrid': 'https://media.api-sports.io/football/teams/541.png',
    'marshall': 'https://media.api-sports.io/football/teams/81.png',
    'marseille': 'https://media.api-sports.io/football/teams/81.png',
    'olympiacos': 'https://media.api-sports.io/football/teams/548.png',
  };

  const key = Object.keys(logoMap).find(k => name.includes(k));
  return key ? logoMap[key] : `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=00d4ff&color=fff`;
};
