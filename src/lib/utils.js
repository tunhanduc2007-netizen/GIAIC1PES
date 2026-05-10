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
      pA.gf += m.scoreA;
      pA.ga += m.scoreB;
      pB.gf += m.scoreB;
      pB.ga += m.scoreA;
      pA.gd = pA.gf - pA.ga;
      pB.gd = pB.gf - pB.ga;

      if (m.scoreA > m.scoreB) {
        pA.wins++; pA.points += 3; pB.losses++;
      } else if (m.scoreA < m.scoreB) {
        pB.wins++; pB.points += 3; pA.losses++;
      } else {
        pA.draws++; pB.draws++; pA.points += 1; pB.points += 1;
      }
    }

    // Process stats (Goals, Yellow, Red)
    const processStat = (name, type) => {
      if (!name) return;
      if (!scorers[name]) scorers[name] = { name, goals: 0, yellow: 0, red: 0 };
      if (type === 'goal') scorers[name].goals++;
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
