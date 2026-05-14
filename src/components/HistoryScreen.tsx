import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useNavigation } from '../NavigationContext';
import { GameResult, getHistory } from '../storage';

export const HistoryScreen = () => {
  const { navigate } = useNavigation();
  const [history, setHistory] = useState<GameResult[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const totalPlays = history.length;
  const highScore = totalPlays ? Math.max(...history.map((run) => run.score)) : 0;
  const avgScore = totalPlays
    ? Math.floor(history.reduce((sum, run) => sum + run.score, 0) / totalPlays)
    : 0;
  const totalLines = history.reduce((sum, run) => sum + run.lines, 0);

  return (
    <div className="min-h-screen bg-gb-lcd-dark pb-32 pt-20">
      <header className="fixed top-0 w-full z-50 flex items-center px-4 h-16 bg-gb-lcd dark:bg-gb-jungle text-gb-lcd-dark dark:text-gb-pale-lime border-b-4 border-gb-lcd-dark shadow-pixel-shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('game', 'push_back')}
            className="w-9 h-9 flex items-center justify-center border-2 border-gb-lcd-dark bg-gb-lcd-dark text-gb-pale-lime shadow-pixel-shadow active:translate-y-1 active:shadow-none"
          >
            <ArrowLeft size={22} strokeWidth={3} />
          </button>
          <h1 className="text-xl font-black font-headline uppercase tracking-tighter">SESSION HISTORY</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-black uppercase text-gb-pale-lime mb-2 px-2 border-l-8 border-gb-lcd">Overview</h2>
        </div>

        <section className="grid grid-cols-2 gap-3 dot-matrix p-4 bg-gb-lcd border-4 border-gb-lcd-dark shadow-pixel-shadow-lg rounded-sm mb-6">
          <OverviewStat label="Total Plays" value={totalPlays} />
          <OverviewStat label="High Score" value={highScore.toLocaleString()} />
          <OverviewStat label="Avg Score" value={avgScore.toLocaleString()} />
          <OverviewStat label="Total Lines" value={totalLines} />
        </section>

        <div className="mb-6">
          <h2 className="text-2xl font-black uppercase text-gb-pale-lime mb-2 px-2 border-l-8 border-gb-lcd">Recent Runs</h2>
        </div>

        <div className="space-y-6 dot-matrix p-4 bg-gb-lcd border-4 border-gb-lcd-dark shadow-pixel-shadow-lg rounded-sm bezel-inset">
          {history.length === 0 ? (
            <div className="bg-gb-pale-lime border-4 border-gb-lcd-dark p-6 text-center">
              <p className="font-black text-gb-lcd-dark uppercase">No saved runs yet</p>
              <p className="text-xs font-bold text-gb-jungle mt-2 uppercase">Finish a game to save your first result.</p>
            </div>
          ) : (
            history.map((run, index) => (
              <article 
                key={run.id}
                className="bg-gb-pale-lime border-4 border-gb-lcd-dark p-5 flex flex-col gap-4 relative overflow-hidden transition-all active:translate-y-1 active:shadow-none cursor-pointer group"
              >
                <div className="flex justify-between items-center border-b-2 border-gb-lcd-dark pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gb-lcd-dark text-gb-pale-lime w-10 h-10 flex items-center justify-center font-black">#{history.length - index}</div>
                    <div>
                      <p className="text-[10px] font-bold text-gb-jungle uppercase tracking-[0.2em] leading-none mb-1">Session Data</p>
                      <p className="font-black text-xl text-gb-lcd-dark leading-none">{run.date}</p>
                    </div>
                  </div>
                  <div className="bg-gb-jungle text-gb-pale-lime px-3 py-1 font-black text-xs border-2 border-gb-lcd-dark">
                    RANK {run.rank}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <Stat label="Total Score" value={run.score.toLocaleString()} />
                  <Stat label="Time" value={run.duration} />
                  <Stat label="Efficiency" value={`${run.lines} LINES`} />
                  <Stat label="Difficulty" value={`LVL ${run.level}`} />
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-12 space-y-4">
          <button 
             onClick={() => navigate('share', 'slide_up')}
             className="w-full h-16 bg-gb-jungle text-gb-pale-lime border-4 border-gb-lcd-dark shadow-pixel-shadow active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
          >
            <Share2 size={22} strokeWidth={3} />
            <span className="font-black text-lg uppercase tracking-widest">Share High Score</span>
          </button>
        </div>
      </main>
    </div>
  );
};

const OverviewStat = ({ label, value }: { label: string, value: string | number }) => (
  <div className="bg-gb-lcd-dark border-2 border-gb-pale-lime p-3">
    <p className="text-[9px] font-black uppercase text-gb-lcd opacity-80">{label}</p>
    <p className="font-black text-xl text-gb-pale-lime">{value}</p>
  </div>
);

const Stat = ({ label, value }: { label: string, value: string | number }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black uppercase text-gb-jungle opacity-70">{label}</p>
    <p className="font-black text-lg text-gb-lcd-dark">{value}</p>
  </div>
);
