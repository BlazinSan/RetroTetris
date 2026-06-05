import React, { useCallback, useEffect } from 'react';
import { useTetris } from './hooks/useTetris';
import { useNavigation } from '../NavigationContext';
import { useSettings } from '../SettingsContext';

let audioCtx: AudioContext | null = null;
let musicInterval: number | null = null;
let musicGain: GainNode | null = null;
let musicStep = 0;

const getAudioContext = async () => {
  if (!audioCtx) {
    const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioClass();
  }

  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  return audioCtx;
};

const korobeinikiNotes = [
  659, 494, 523, 587, 523, 494, 440, 440,
  523, 659, 587, 523, 494, 523, 587, 659,
  523, 440, 440, 587, 698, 880, 784, 698,
  659, 523, 659, 587, 523, 494, 494,
];

const playTone = async (
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'square'
) => {
  const ctx = await getAudioContext();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration + 0.02);
};

const startMusic = async (volume: number) => {
  if (musicInterval || volume <= 0) return;

  const ctx = await getAudioContext();

  musicGain = ctx.createGain();
  musicGain.gain.value = (volume / 100) * 0.025;
  musicGain.connect(ctx.destination);

  musicInterval = window.setInterval(() => {
    if (!audioCtx || !musicGain) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.value = korobeinikiNotes[musicStep % korobeinikiNotes.length];

    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(musicGain);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.16);

    musicStep++;
  }, 180);
};

const stopMusic = () => {
  if (musicInterval !== null) {
    window.clearInterval(musicInterval);
    musicInterval = null;
  }

  if (musicGain) {
    musicGain.disconnect();
    musicGain = null;
  }
};

export const GameScreen = () => {
  const { settings } = useSettings();

  const {
    grid,
    activePiece,
    nextPiece,
    score,
    level,
    lines,
    gameOver,
    isPaused,
    move,
    rotate,
    drop,
    hardDrop,
    togglePause,
    reset,
    collide,
  } = useTetris(settings.level);

  const { navigate } = useNavigation();
  const prevLinesRef = React.useRef(lines);
  const [isShaking, setIsShaking] = React.useState(false);

  // Screen shake and line-clear haptics
  useEffect(() => {
    if (lines > prevLinesRef.current) {
      if (settings.screenShake) {
        setIsShaking(true);
        const timer = setTimeout(() => setIsShaking(false), 350);
        prevLinesRef.current = lines;
        if (settings.haptic) {
          navigator.vibrate?.([60, 40, 60]);
        }
        return () => clearTimeout(timer);
      }
    }
    prevLinesRef.current = lines;
  }, [lines, settings.screenShake, settings.haptic]);

  // Game over haptic alert
  useEffect(() => {
    if (gameOver && settings.haptic) {
      navigator.vibrate?.([100, 50, 100, 50, 150]);
    }
  }, [gameOver, settings.haptic]);

  // Synchronize master music volume
  useEffect(() => {
    if (musicGain) {
      musicGain.gain.value = (settings.volume / 100) * 0.025;
    }
  }, [settings.volume]);

  // Manage background music playback based on settings, pause state, and game over state
  useEffect(() => {
    if (settings.music && settings.volume > 0 && !isPaused && !gameOver) {
      startMusic(settings.volume);
    } else {
      stopMusic();
    }
    return () => {
      stopMusic();
    };
  }, [settings.music, settings.volume, isPaused, gameOver]);

  const playSfx = useCallback(
    async (frequency = 440, duration = 0.06) => {
      await getAudioContext();

      if (!settings.sfx || settings.volume <= 0) return;

      playTone(frequency, duration, (settings.volume / 100) * 0.06);
    },
    [settings.sfx, settings.volume]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || isPaused) {
        if (e.key === 'Enter') {
          if (gameOver) {
            if (settings.haptic) navigator.vibrate?.(20);
            playSfx(180);
            reset();
          } else if (isPaused) {
            if (settings.haptic) navigator.vibrate?.(20);
            playSfx(620);
            togglePause();
          }
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (settings.haptic) navigator.vibrate?.(8);
          playSfx(330);
          move(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (settings.haptic) navigator.vibrate?.(8);
          playSfx(330);
          move(1);
          break;
        case 'ArrowUp':
        case 'a':
        case 'A':
          e.preventDefault();
          if (settings.haptic) navigator.vibrate?.(15);
          playSfx(520);
          rotate(1);
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          if (settings.haptic) navigator.vibrate?.(15);
          playSfx(390);
          rotate(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (settings.haptic) navigator.vibrate?.(10);
          playSfx(260);
          drop();
          break;
        case ' ': // Space key for Hard Drop
          if (settings.hardDrop) {
            e.preventDefault();
            if (settings.haptic) navigator.vibrate?.(30);
            playSfx(260);
            hardDrop();
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (settings.haptic) navigator.vibrate?.(20);
          playSfx(620);
          togglePause();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          if (settings.haptic) navigator.vibrate?.(20);
          playSfx(180);
          reset();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameOver, isPaused, move, rotate, drop, hardDrop, togglePause, reset, playSfx, settings.hardDrop]);

  const handleRotateA = () => {
    if (settings.haptic) navigator.vibrate?.(15);
    playSfx(520);
    rotate(1);
  };

  const handleRotateB = () => {
    if (settings.haptic) navigator.vibrate?.(15);
    playSfx(390);
    rotate(-1);
  };

  const btnA = (
    <div className="flex flex-col items-center gap-1 -mt-4">
      <button
        onClick={handleRotateA}
        className="w-14 h-14 bg-[#8b1e3f] rounded-full border-b-4 border-r-4 border-black shadow-[4px_4px_0_0_#4a0e21] active:translate-y-1 active:shadow-none transition-all"
      />
      <span className="font-black text-gb-lcd-dark text-xs">A</span>
    </div>
  );

  const btnB = (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleRotateB}
        className="w-14 h-14 bg-[#8b1e3f] rounded-full border-b-4 border-r-4 border-black shadow-[4px_4px_0_0_#4a0e21] active:translate-y-1 active:shadow-none transition-all"
      />
      <span className="font-black text-gb-lcd-dark text-xs">B</span>
    </div>
  );

  const renderCell = (r: number, c: number) => {
    let isBlock = grid[r][c] !== 0;
    let isGhost = false;

    if (activePiece) {
      activePiece.matrix.forEach((row: number[], y: number) => {
        row.forEach((value: number, x: number) => {
          if (value !== 0 && activePiece.pos.y + y === r && activePiece.pos.x + x === c) {
            isBlock = true;
          }
        });
      });

      if (settings.ghostPiece && !isBlock) {
        let ghostY = activePiece.pos.y;

        while (!collide({ ...activePiece, pos: { ...activePiece.pos, y: ghostY + 1 } }, grid)) {
          ghostY++;
        }

        activePiece.matrix.forEach((row: number[], y: number) => {
          row.forEach((value: number, x: number) => {
            if (value !== 0 && ghostY + y === r && activePiece.pos.x + x === c) {
              isGhost = true;
            }
          });
        });
      }
    }

    return (
      <div
        key={`${r}-${c}`}
        className={`w-full h-full border-[0.5px] border-on-surface/5 ${
          isBlock ? 'bg-gb-lcd-dark border-gb-lcd' : isGhost ? 'bg-gb-lcd-dark/20' : ''
        }`}
      />
    );
  };

  const renderNext = () => {
    if (!nextPiece) return null;

    const miniGrid = Array.from({ length: 4 }, () => Array(4).fill(0));

    nextPiece.matrix.forEach((row: number[], y: number) => {
      row.forEach((value: number, x: number) => {
        if (value !== 0) miniGrid[y][x] = 1;
      });
    });

    return (
      <div className="grid grid-cols-4 grid-rows-4 gap-0.5 scale-75">
        {miniGrid.map((row: number[], y: number) =>
          row.map((val: number, x: number) => (
            <div key={`next-${y}-${x}`} className={`w-2 h-2 ${val ? 'bg-gb-lcd-dark' : ''}`} />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 pb-20 w-full min-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className={`relative bg-[#2c3e50] p-8 rounded-b-[40px] rounded-t-lg border-[6px] border-gb-lcd-dark shadow-pixel-shadow-lg w-full max-w-md origin-top ${isShaking ? 'animate-shake' : ''}`}>
        <div className="bg-gb-moss p-6 rounded-lg mb-8 border-b-8 border-r-8 border-gb-lcd-dark">
          <div className="flex justify-between items-center mb-2 px-2">
            <div className="flex gap-1">
              <div className="w-3 h-1 bg-error" />
              <div className="w-3 h-1 bg-error opacity-50" />
            </div>
            <span className="font-headline font-bold text-[10px] tracking-widest text-gb-pale-lime">
              BATTERY
            </span>
          </div>

          <div className="bg-gb-lcd relative p-2 dot-matrix aspect-[10/16] overflow-hidden border-2 border-gb-lcd-dark border-b-4 border-r-4 shadow-[3px_3px_0_0_rgba(0,0,0,0.2)]">
            <div className="grid grid-cols-10 grid-rows-20 gap-px h-full w-full opacity-90 border border-gb-lcd-dark/10">
              {grid.map((row: number[], r: number) =>
                row.map((_: number, c: number) => renderCell(r, c))
              )}
            </div>

            <div className="absolute top-4 right-2 flex flex-col gap-2">
              <div className="bg-gb-lcd border-2 border-gb-lcd-dark border-b-4 border-r-4 p-1 text-center min-w-[50px] shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]">
                <div className="text-[8px] font-black uppercase">Next</div>
                <div className="h-8 w-full flex items-center justify-center overflow-hidden">
                  {renderNext()}
                </div>
              </div>

              <div className="bg-gb-lcd border-2 border-gb-lcd-dark border-b-4 border-r-4 p-1 text-center shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]">
                <div className="text-[8px] font-black uppercase">Level</div>
                <div className="text-xs font-black">{level.toString().padStart(2, '0')}</div>
              </div>
            </div>

            <div className="absolute top-4 left-2">
              <div className="bg-gb-lcd border-2 border-gb-lcd-dark border-b-4 border-r-4 p-1 text-center min-w-[50px] shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]">
                <div className="text-[8px] font-black uppercase">Score</div>
                <div className="text-[10px] font-black">{score.toString().padStart(6, '0')}</div>
              </div>
            </div>

            {gameOver && (
              <div className="absolute inset-0 bg-gb-lcd-dark/80 flex items-center justify-center z-10">
                <div className="text-gb-lcd font-black text-center p-4">
                  <div className="text-xl mb-2">GAME OVER</div>
                  <button
                    onClick={() => {
                      playSfx(180);
                      reset();
                    }}
                    className="text-[8px] animate-pulse"
                  >
                    PRESS START TO RESET
                  </button>
                </div>
              </div>
            )}

            {isPaused && !gameOver && (
              <div className="absolute inset-0 bg-gb-lcd-dark/40 flex items-center justify-center z-10">
                <div className="text-gb-lcd-dark bg-gb-pale-lime px-4 py-2 border-2 border-gb-lcd-dark font-black">
                  PAUSED
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 items-center px-4 mb-16">
          <div className="relative w-32 h-32 flex items-center justify-center -translate-x-4">
            <div className="absolute w-28 h-10 bg-gb-lcd-dark rounded-sm border-b-4 border-r-4 border-black shadow-[3px_3px_0_0_#1a1a1a]" />
            <div className="absolute w-10 h-28 bg-gb-lcd-dark rounded-sm border-b-4 border-r-4 border-black shadow-[3px_3px_0_0_#1a1a1a]" />
            <div className="z-10 w-8 h-8 bg-gb-lcd-dark flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border border-gb-moss/20" />
            </div>

            <button aria-label="Up" onClick={() => { if (settings.haptic) navigator.vibrate?.(15); playSfx(520); rotate(1); }} className="absolute top-0 w-10 h-10 active:scale-95 transition-transform" />
            <button aria-label="Down" onClick={() => { if (settings.haptic) navigator.vibrate?.(10); playSfx(260); drop(); }} className="absolute bottom-0 w-10 h-10 active:scale-95 transition-transform" />
            <button aria-label="Left" onClick={() => { if (settings.haptic) navigator.vibrate?.(8); playSfx(330); move(-1); }} className="absolute left-0 w-10 h-10 active:scale-95 transition-transform" />
            <button aria-label="Right" onClick={() => { if (settings.haptic) navigator.vibrate?.(8); playSfx(330); move(1); }} className="absolute right-0 w-10 h-10 active:scale-95 transition-transform" />
          </div>

          <div className="flex flex-col items-end gap-8 translate-x-8 rotate-[-10deg]">
            <div className="flex gap-6">
              {settings.invertButtons ? (
                <>
                  {btnA}
                  {btnB}
                </>
              ) : (
                <>
                  {btnB}
                  {btnA}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-12 -mt-12 mb-28">
          <div className="flex flex-col items-center gap-1 rotate-[-25deg]">
            <span className="font-black text-[10px] uppercase mb-1 italic tracking-wider text-gb-lcd-dark">
              RESET
            </span>
            <button
              onClick={() => {
                playSfx(180);
                reset();
              }}
              className="w-14 h-5 bg-[#4a4a4a] rounded-full border-b-4 border-r-4 border-black shadow-[3px_3px_0_0_#212121] active:translate-y-1 active:shadow-none transition-all"
            />
          </div>

          <div className="flex flex-col items-center gap-1 rotate-[-25deg]">
            <span className="font-black text-[10px] uppercase mb-1 italic tracking-wider text-gb-lcd-dark">
              START
            </span>
            <button
              onClick={() => {
                playSfx(620);
                togglePause();
              }}
              className="w-14 h-5 bg-[#4a4a4a] rounded-full border-b-4 border-r-4 border-black shadow-[3px_3px_0_0_#212121] active:translate-y-1 active:shadow-none transition-all"
            />
          </div>
        </div>

        <div className="absolute bottom-6 right-6 flex flex-col gap-2 rotate-[45deg] opacity-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-24 h-1.5 bg-gb-lcd-dark rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
};