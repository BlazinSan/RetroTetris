import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Trophy, Gamepad2, Settings, Clock, Layers } from 'lucide-react';
import { useNavigation } from '../NavigationContext';

type SavedRun = {
  id?: string | number;
  score: number;
  lines: number;
  level: number;
  rank: string;
  duration: string;
  date: string;
  playerName?: string;
};

const HISTORY_KEY = 'tetris-history';

function readHistory(): SavedRun[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((run, index) => ({
        id: run.id ?? index + 1,
        score: Number(run.score) || 0,
        lines: Number(run.lines) || 0,
        level: Number(run.level) || 0,
        rank: String(run.rank || 'D'),
        duration: String(run.duration || '00:00'),
        date: String(run.date || ''),
        playerName: String(run.playerName || 'RETRO_USER_01'),
      }))
      .sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

export const LeaderboardScreen = () => {
  const { navigate } = useNavigation();
  const [history, setHistory] = useState<SavedRun[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const topRuns = useMemo(() => history.slice(0, 10), [history]);

  const stats = useMemo(() => {
    const totalPlays = history.length;
    const highScore = history.length > 0 ? Math.max(...history.map((run) => run.score)) : 0;
    const totalLines = history.reduce((sum, run) => sum + run.lines, 0);
    const averageScore =
      history.length > 0
        ? Math.round(history.reduce((sum, run) => sum + run.score, 0) / history.length)
        : 0;

    return {
      totalPlays,
      highScore,
      totalLines,
      averageScore,
    };
  }, [history]);

  return (
    <div className="min-h-screen bg-gb-lcd-dark text-gb-pale-lime pb-28">
      <header className="sticky top-0 z-40 h-20 bg-gb-jungle border-b-4 border-gb-lcd-dark px-6 flex items-center gap-4">
        <button
          onClick={() => navigate('game', 'push_back')}
          className="w-12 h-12 flex items-center justify-center bg-black text-gb-pale-lime border-2 border-gb-lcd-dark shadow-pixel-shadow active:translate-y-1 active:shadow-none"
          aria-label="Back to game"
        >
          <ArrowLeft size={28} strokeWidth={3} />
        </button>

        <div className="flex items-center gap-3">
          <Trophy size={28} strokeWidth={3} />
          <h1 className="font-headline text-3xl font-black uppercase tracking-tighter">
            Ranks
          </h1>
        </div>
      </header>

      <main className="px-6 py-8 max-w-xl mx-auto">
        <section className="bg-black border-4 border-emerald-400 p-6 shadow-pixel-shadow">
          <div className="flex items-center justify-between border-b-4 border-emerald-400 pb-4 mb-6">
            <h2 className="font-headline text-2xl font-black uppercase text-emerald-400">
              Local Top 10
            </h2>
            <Trophy size={26} strokeWidth={3} className="text-emerald-400" />
          </div>

          {topRuns.length === 0 ? (
            <div className="bg-gb-lcd-dark border-2 border-emerald-400 p-6 text-center">
              <p className="font-black uppercase text-emerald-400">
                No saved scores yet
              </p>
              <p className="text-xs font-bold uppercase opacity-70 mt-2">
                Finish a game to create your first rank.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topRuns.map((run, index) => (
                <div
                  key={`${run.id}-${index}`}
                  className={`grid grid-cols-[52px_1fr_auto] items-center gap-3 p-4 border-2 border-emerald-400 ${
                    index === 0
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gb-lcd-dark text-emerald-400'
                  }`}
                >
                  <div className="font-headline text-2xl font-black">
                    #{index + 1}
                  </div>

                  <div className="min-w-0">
                    <p className="font-headline font-black uppercase tracking-widest truncate">
                      {run.playerName || 'RETRO_USER_01'}
                    </p>
                    <div className="flex gap-3 text-[10px] font-black uppercase opacity-80 mt-1">
                      <span className="flex items-center gap-1">
                        <Layers size={12} strokeWidth={3} />
                        LVL {run.level}
                      </span>
                      <span>{run.lines} Lines</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} strokeWidth={3} />
                        {run.duration}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-headline text-3xl font-black">
                      {run.score.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-black uppercase opacity-80">
                      Rank {run.rank}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 grid grid-cols-2 gap-4">
          <StatBox label="Total Plays" value={stats.totalPlays.toString()} />
          <StatBox label="High Score" value={stats.highScore.toLocaleString()} />
          <StatBox label="Avg Score" value={stats.averageScore.toLocaleString()} />
          <StatBox label="Total Lines" value={stats.totalLines.toString()} />
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 bg-gb-lcd border-t-4 border-gb-lcd-dark">
        <button
          onClick={() => navigate('game', 'none')}
          className="flex flex-col items-center justify-center text-gb-lcd-dark p-2 hover:bg-gb-jungle/20 transition-transform active:scale-95 cursor-pointer w-1/3"
        >
          <Gamepad2 size={22} strokeWidth={3} />
          <span className="font-headline text-[10px] font-bold uppercase">
            Game
          </span>
        </button>

        <button className="flex flex-col items-center justify-center bg-gb-lcd-dark text-gb-pale-lime p-2 transition-transform active:scale-95 h-full w-1/3">
          <Trophy size={22} strokeWidth={3} />
          <span className="font-headline text-[10px] font-bold uppercase">
            Ranks
          </span>
        </button>

        <button
          onClick={() => navigate('config', 'none')}
          className="flex flex-col items-center justify-center text-gb-lcd-dark p-2 hover:bg-gb-jungle/20 transition-transform active:scale-95 cursor-pointer w-1/3"
        >
          <Settings size={22} strokeWidth={3} />
          <span className="font-headline text-[10px] font-bold uppercase">
            Config
          </span>
        </button>
      </nav>
    </div>
  );
};

const StatBox = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-black border-2 border-emerald-400 p-4">
    <p className="text-[10px] font-black uppercase text-emerald-400/70">
      {label}
    </p>
    <p className="font-headline text-2xl font-black text-gb-pale-lime mt-1">
      {value}
    </p>
  </div>
);