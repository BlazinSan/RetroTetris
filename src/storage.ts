export interface GameResult {
  id: number;
  date: string;
  score: number;
  lines: number;
  level: number;
  duration: string;
  durationSeconds: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  name: string;
  playerName?: string;
}

const HISTORY_KEY = 'tetris-history';
const LEADERBOARD_KEY = 'tetris-leaderboard';
const PLAYER_NAME = 'RETRO_USER_01';

export const getRankBadge = (score: number): GameResult['rank'] => {
  if (score >= 80000) return 'S';
  if (score >= 60000) return 'A';
  if (score >= 40000) return 'B';
  if (score >= 20000) return 'C';
  return 'D';
};

export const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const readStoredResults = (key: string): GameResult[] => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const getHistory = () => readStoredResults(HISTORY_KEY);

export const getLeaderboard = () =>
  readStoredResults(LEADERBOARD_KEY).sort((a, b) => b.score - a.score).slice(0, 10);

export const saveGameResult = ({
  score,
  lines,
  level,
  durationSeconds,
  playerName,
}: {
  score: number;
  lines: number;
  level: number;
  durationSeconds: number;
  playerName?: string;
}) => {
  const finalPlayerName = playerName || (() => {
    try {
      const saved = localStorage.getItem('tetris-settings');
      if (saved) {
        return JSON.parse(saved).playerName || 'RETRO_USER_01';
      }
    } catch {}
    return 'RETRO_USER_01';
  })();

  const result: GameResult = {
    id: Date.now(),
    date: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase(),
    score,
    lines,
    level,
    duration: formatDuration(durationSeconds),
    durationSeconds,
    rank: getRankBadge(score),
    name: finalPlayerName,
    playerName: finalPlayerName,
  };

  const history = [result, ...getHistory()].slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  const leaderboard = [...getLeaderboard(), result]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));

  return result;
};
