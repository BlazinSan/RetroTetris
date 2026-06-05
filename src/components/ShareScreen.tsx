import React, { useEffect, useMemo, useState, useRef } from 'react';
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
import { useSettings } from '../SettingsContext';
import { Share as CapShare } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import * as htmlToImage from 'html-to-image';
import QRCode from 'qrcode';

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
  const { settings } = useSettings();
  const [history, setHistory] = useState<SavedRun[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const scoreboardRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (settings.haptic) navigator.vibrate?.(20);
    setTimeout(() => setToast(null), 2500);
  };

  const sharedRun = useMemo((): SavedRun | null => {
    try {
      const params = new URLSearchParams(window.location.search);
      const scoreStr = params.get('score');
      if (scoreStr) {
        const rawPlayer = params.get('player') || 'RETRO_USER_01';
        const sanitizedPlayer = rawPlayer.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().substring(0, 15).toUpperCase() || 'RETRO_USER';

        const rawRank = params.get('rank') || 'D';
        const sanitizedRank = ['S', 'A', 'B', 'C', 'D'].includes(rawRank.toUpperCase()) ? rawRank.toUpperCase() : 'D';

        const rawDuration = params.get('duration') || '00:00';
        const sanitizedDuration = /^\d{2,3}:\d{2}$/.test(rawDuration) ? rawDuration : '00:00';

        const scoreVal = Math.min(Math.max(0, Number(scoreStr) || 0), 9999999);
        const linesVal = Math.min(Math.max(0, Number(params.get('lines')) || 0), 999);
        const levelVal = Math.min(Math.max(0, Number(params.get('level')) || 0), 99);

        return {
          id: 'SHARED',
          score: scoreVal,
          lines: linesVal,
          level: levelVal,
          rank: sanitizedRank,
          duration: sanitizedDuration,
          date: new Date().toLocaleDateString('en-GB').toUpperCase(),
          playerName: sanitizedPlayer,
        };
      }
    } catch (e) {
      console.error('Failed to parse shared run:', e);
    }
    return null;
  }, []);

  const bestRun = useMemo(() => {
    if (sharedRun) return sharedRun;
    if (history.length === 0) return null;
    return [...history].sort((a, b) => b.score - a.score)[0];
  }, [sharedRun, history]);

  const scoreUrl = useMemo(() => {
    if (!bestRun) return 'https://8bitretrotetris.vercel.app/';
    const params = new URLSearchParams({
      score: String(bestRun.score),
      lines: String(bestRun.lines),
      level: String(bestRun.level),
      duration: bestRun.duration,
      rank: bestRun.rank,
      player: bestRun.playerName || 'RETRO_USER_01',
      id: String(bestRun.id || '')
    });
    return `https://8bitretrotetris.vercel.app/?${params.toString()}`;
  }, [bestRun]);

  const gameId = useMemo(() => makeGameId(bestRun), [bestRun]);

  // Generate QR Code on canvas with Tetris green colors
  useEffect(() => {
    if (qrCanvasRef.current && gameId) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        scoreUrl,
        {
          width: 80,
          margin: 1,
          color: {
            dark: '#071407',  // Tetris Dark Green
            light: '#6fa866', // Tetris Light Green
          },
        },
        (error) => {
          if (error) console.error('QR Code generation failed:', error);
        }
      );
    }
  }, [gameId, scoreUrl]);

  const copyGameId = async () => {
    try {
      if (settings.haptic) navigator.vibrate?.(20);
      await navigator.clipboard.writeText(gameId);
      showToast('GAME ID COPIED!');
    } catch {
      showToast('COPY FAILED!');
    }
  };

  const handleCopyCode = async () => {
    try {
      if (settings.haptic) navigator.vibrate?.(20);
      await navigator.clipboard.writeText(scoreUrl);
      showToast('SCORE LINK COPIED!');
    } catch {
      showToast('COPY FAILED!');
    }
  };

  const shareText = bestRun
    ? `I scored ${bestRun.score.toLocaleString()} in Retro Tetris! Rank ${bestRun.rank}, ${bestRun.lines} lines, level ${bestRun.level}. View scorecard: ${scoreUrl}`
    : 'No Retro Tetris score saved yet.';

  const shareScore = async () => {
    try {
      if (settings.haptic) navigator.vibrate?.(20);

      if (Capacitor.isNativePlatform()) {
        await CapShare.share({
          title: 'Retro Tetris Score',
          text: shareText,
          dialogTitle: 'Share Retro Tetris Score'
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Retro Tetris Score',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        showToast('COPIED TO CLIPBOARD!');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast('COPIED TO CLIPBOARD!');
      } catch {
        showToast('SHARE FAILED!');
      }
    }
  };

  const handleExportImage = async () => {
    if (settings.haptic) navigator.vibrate?.(30);
    if (!scoreboardRef.current) {
      showToast('CARD NOT FOUND!');
      return;
    }

    try {
      // Use html-to-image to capture the card
      const dataUrl = await htmlToImage.toPng(scoreboardRef.current, {
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });

      const fileName = `retrotetris-score-${bestRun?.score || 0}.png`;

      // Check if we are running in Capacitor (native Android/iOS)
      if (Capacitor.isNativePlatform()) {
        const base64Data = dataUrl.split(',')[1]; // Get only the base64 part
        
        try {
          // Write the file to the documents directory
          await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Documents,
          });
          showToast('SAVED TO DOCUMENTS!');
        } catch (fileErr) {
          try {
            // Write the file to Cache directory as fallback and share it
            await Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.Cache,
            });
            const uriResult = await Filesystem.getUri({
              path: fileName,
              directory: Directory.Cache
            });
            await CapShare.share({
              title: 'Retro Tetris Scorecard',
              files: [uriResult.uri],
            });
            showToast('SHARED SCORECARD!');
          } catch (shareErr) {
            console.error('File write/share failed:', shareErr);
            showToast('SAVE FAILED!');
          }
        }
      } else {
        // Browser download fallback
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        showToast('IMAGE EXPORTED!');
      }
    } catch (err) {
      console.error('Export image failed:', err);
      showToast('EXPORT FAILED!');
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

            <div
              ref={scoreboardRef}
              id="scoreboard-card"
              className="w-full bg-gb-lcd border-4 border-gb-lcd-dark p-4 shadow-pixel-shadow flex flex-col gap-4 relative"
            >
              <div className="flex justify-between items-center border-b-2 border-gb-lcd-dark pb-2 gap-2">
                <span className="text-[10px] font-bold text-gb-lcd-dark/70 uppercase">
                  Player:
                </span>
                <span className="font-headline font-black text-gb-lcd-dark uppercase tracking-wider truncate">
                  {bestRun?.playerName || 'RETRO_USER_01'}
                </span>
              </div>

              <div className="flex justify-between items-end border-b-2 border-gb-lcd-dark pb-2 gap-4">
                <span className="text-[10px] font-bold text-gb-lcd-dark/70 uppercase">
                  Score:
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

                {bestRun ? (
                  <div className="h-20 w-20 bg-[#6fa866] border-2 border-[#071407] flex items-center justify-center p-[2px] shadow-pixel-shadow">
                    <canvas ref={qrCanvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
                  </div>
                ) : (
                  <div className="h-20 w-20 bg-gb-lcd-dark flex items-center justify-center p-2">
                    <Trophy size={48} strokeWidth={3} className="text-gb-pale-lime" />
                  </div>
                )}
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
                <ActionButton icon={<Download size={22} strokeWidth={3} />} label="Export Image" onClick={handleExportImage} />
                <ActionButton icon={<QrCode size={22} strokeWidth={3} />} label="Copy Code" onClick={handleCopyCode} />
              </div>
            </div>
          </div>

          {toast && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-gb-lcd-dark text-gb-pale-lime font-black px-6 py-3 border-4 border-gb-lcd shadow-pixel-shadow z-50 text-xs animate-bounce uppercase">
              {toast}
            </div>
          )}

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