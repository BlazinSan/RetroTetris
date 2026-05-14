import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Download,
  Gamepad2,
  Link,
  QrCode,
  Send,
  Settings,
  Share2,
  Trophy,
  Users,
} from 'lucide-react';
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

    return parsed.map((run, index) => ({
      id: run.id ?? index + 1,
      score: Number(run.score) || 0,
      lines: Number(run.lines) || 0,
      level: Number(run.level) || 0,
      rank: String(run.rank || 'D'),
      duration: String(run.duration || '00:00'),
      date: String(run.date || ''),
      playerName: String(run.playerName || 'RETRO_USER_01'),
    }));
  } catch {
    return [];
  }
}

function makeGameId(run: SavedRun | null) {
  if (!run) return 'NO-SCORE-YET';

  const id = String(run.id ?? '0000').toUpperCase();
  const score = String(run.score).padStart(6, '0');

  return `TET-${id}-${score}`;
}

export const ShareScreen = () => {
  const { navigate } = useNavigation();
  const [history, setHistory] = useState<SavedRun[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const bestRun = useMemo(() => {
    if (history.length === 0) return null;
    return [...history].sort((a, b) => b.score - a.score)[0];
  }, [history]);

  const gameId = useMemo(() => makeGameId(bestRun), [bestRun]);

  const copyGameId = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
    } catch {
      // Ignore copy errors silently for now.
    }
  };

  const shareText = bestRun
    ? `I scored ${bestRun.score.toLocaleString()} in Retro Tetris! Rank ${bestRun.rank}, ${bestRun.lines} lines, level ${bestRun.level}. Game ID: ${gameId}`
    : 'No Retro Tetris score saved yet.';

  const shareScore = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Retro Tetris Score',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
      }
    } catch {
      // Ignore share errors silently for now.
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gb-bg text-gb-pale-lime font-body-md overflow-y-auto">
      <header className="fixed top-0 w-full z-50 px-4 h-16 flex items-center justify-between bg-gb-lcd dark:bg-[#2d4c1e] text-gb-lcd-dark dark:text-gb-pale-lime border-b-4 border-gb-lcd-dark shadow-pixel-shadow">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('history', 'push_back')}
            className="w-9 h-9 flex items-center justify-center bg-gb-lcd-dark text-gb-pale-lime border-2 border-gb-lcd-dark shadow-pixel-shadow active:translate-y-1 active:shadow-none"
            aria-label="Back to history"
          >
            <ArrowLeft size={22} strokeWidth={3} />
          </button>

          <div className="flex items-center gap-2">
            <Share2 size={22} strokeWidth={3} />
            <h1 className="font-headline font-black uppercase tracking-tighter text-lg">
              SHARE SCORE
            </h1>
          </div>
        </div>

        <button
          onClick={() => navigate('config', 'push')}
          className="w-9 h-9 flex items-center justify-center hover:bg-gb-jungle/20 active:scale-95"
          aria-label="Open settings"
        >
          <Settings size={22} strokeWidth={3} />
        </button>
      </header>

      <main className="flex-1 mt-20 mb-24 px-6 py-4 flex flex-col items-center">
        <div className="w-full max-w-md bg-gb-jungle p-6 rounded-lg shadow-pixel-shadow">
          <div className="dot-matrix bg-gb-lcd p-6 border-4 border-gb-lcd-dark flex flex-col items-center gap-6 relative overflow-hidden">
            <div className="w-full text-center border-b-2 border-gb-lcd-dark pb-2">
              <p className="font-black text-gb-lcd-dark uppercase tracking-widest text-center">
                Share your score!!
              </p>
            </div>

            <div className="w-full bg-gb-lcd border-4 border-gb-lcd-dark p-4 shadow-pixel-shadow flex flex-col gap-4 relative">
              <div className="flex justify-between items-end border-b-2 border-gb-lcd-dark pb-2 gap-4">
                <span className="text-[10px] font-bold text-gb-lcd-dark/70 uppercase">
                  Player Score:
                </span>
                <span className="text-4xl font-black text-gb-lcd-dark">
                  {bestRun ? bestRun.score.toLocaleString() : '0'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gb-lcd-dark/70 uppercase">
                    Rank:
                  </span>
                  <span className="text-6xl font-black text-gb-lcd-dark">
                    {bestRun ? bestRun.rank : '-'}
                  </span>
                </div>

                <div className="h-20 w-20 bg-gb-lcd-dark flex items-center justify-center p-2">
                  <Trophy size={48} strokeWidth={3} className="text-gb-pale-lime" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-gb-lcd-dark text-center">
                <div className="border-2 border-gb-lcd-dark p-2">
                  <p className="text-[9px] font-black uppercase opacity-70">Lines</p>
                  <p className="font-black">{bestRun ? bestRun.lines : 0}</p>
                </div>
                <div className="border-2 border-gb-lcd-dark p-2">
                  <p className="text-[9px] font-black uppercase opacity-70">Level</p>
                  <p className="font-black">{bestRun ? bestRun.level : 0}</p>
                </div>
                <div className="border-2 border-gb-lcd-dark p-2">
                  <p className="text-[9px] font-black uppercase opacity-70">Time</p>
                  <p className="font-black">{bestRun ? bestRun.duration : '00:00'}</p>
                </div>
              </div>
            </div>

            <div className="w-full bg-gb-jungle/10 border-2 border-dashed border-gb-lcd-dark p-4 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-gb-lcd-dark flex items-center gap-1 uppercase tracking-widest">
                <Link size={14} strokeWidth={3} />
                Game ID
              </span>

              <div className="flex justify-between items-center bg-gb-pale-lime/50 p-2 border-2 border-gb-lcd-dark gap-2">
                <span className="font-black tracking-widest text-[#0f1b07] text-xs break-all">
                  {gameId}
                </span>

                <button
                  onClick={copyGameId}
                  className="text-gb-lcd-dark active:scale-90"
                  aria-label="Copy game ID"
                >
                  <Copy size={22} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col gap-4">
              <button
                onClick={shareScore}
                className="w-full h-16 bg-gb-lcd-dark text-gb-pale-lime font-black flex items-center justify-center gap-3 border-2 border-gb-lcd-dark active:translate-y-1 transition-all shadow-pixel-shadow"
              >
                <Send size={22} strokeWidth={3} />
                SEND TO FRIENDS
              </button>

              <div className="grid grid-cols-2 gap-4">
                <ActionButton icon={<Download size={22} strokeWidth={3} />} label="Export Image" />
                <ActionButton icon={<QrCode size={22} strokeWidth={3} />} label="Copy Code" onClick={copyGameId} />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6 px-4">
            <div className="relative w-16 h-16 bg-gb-lcd-dark/20 rounded-full flex items-center justify-center">
              <div className="w-12 h-4 bg-gb-lcd-dark absolute" />
              <div className="h-12 w-4 bg-gb-lcd-dark absolute" />
            </div>

            <div className="flex gap-4 items-end pb-2">
              <div className="w-8 h-8 rounded-full bg-error shadow-[0px_4px_0px_0px_#7a1111]" />
              <div className="w-8 h-8 rounded-full bg-error shadow-[0px_4px_0px_0px_#7a1111]" />
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 bg-gb-lcd border-t-4 border-gb-lcd-dark">
        <button
          onClick={() => navigate('game', 'none')}
          className="flex flex-col items-center justify-center text-gb-lcd-dark p-2 hover:bg-gb-jungle/20 transition-transform active:scale-95 cursor-pointer w-1/3"
        >
          <Gamepad2 size={22} strokeWidth={3} />
          <span className="font-headline text-[10px] font-bold uppercase">
            GAME
          </span>
        </button>

        <button
          onClick={() => navigate('leaderboard', 'push_back')}
          className="flex flex-col items-center justify-center text-gb-lcd-dark p-2 hover:bg-gb-jungle/20 transition-transform active:scale-95 cursor-pointer w-1/3"
        >
          <Trophy size={22} strokeWidth={3} />
          <span className="font-headline text-[10px] font-bold uppercase">
            SCORES
          </span>
        </button>

        <button className="flex flex-col items-center justify-center bg-gb-lcd-dark text-gb-pale-lime p-2 transition-transform active:scale-95 h-full w-1/3">
          <Users size={22} strokeWidth={3} />
          <span className="font-headline text-[10px] font-bold uppercase">
            SOCIAL
          </span>
        </button>
      </nav>
    </div>
  );
};

const ActionButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="bg-gb-lcd text-gb-lcd-dark border-4 border-gb-lcd-dark py-2 font-black flex flex-col items-center gap-1 active:translate-y-1 transition-all shadow-pixel-shadow"
  >
    {icon}
    <span className="text-[10px] uppercase truncate px-1">{label}</span>
  </button>
);