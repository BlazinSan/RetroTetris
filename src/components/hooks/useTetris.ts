import { useState, useEffect, useCallback, useRef } from 'react';
import { saveGameResult } from '../../storage';

const COLS = 10;
const ROWS = 20;
const SHAPES = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
};

export function useTetris(startLevel: number = 1) {
  const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(startLevel);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activePiece, setActivePiece] = useState<any>(null);
  const [nextPiece, setNextPiece] = useState<any>(null);

  const dropCounter = useRef(0);
  const dropInterval = useRef(1000 * Math.pow(0.85, startLevel - 1));
  const lastTime = useRef(0);
  const startedAt = useRef(Date.now());
  const hasSavedResult = useRef(false);

  const randomPiece = useCallback(() => {
    const keys = Object.keys(SHAPES);
    const type = keys[Math.floor(Math.random() * keys.length)];
    return {
      type,
      matrix: SHAPES[type as keyof typeof SHAPES],
      pos: { x: Math.floor(COLS / 2) - 1, y: 0 },
    };
  }, []);

  const collide = useCallback((piece: any, currentGrid: number[][]) => {
    const [m, o] = [piece.matrix, piece.pos];
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 && (currentGrid[y + o.y] && currentGrid[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  }, []);

  const spawnPiece = useCallback(() => {
    const next = nextPiece || randomPiece();
    const future = randomPiece();
    
    if (collide(next, grid)) {
      setGameOver(true);
      return;
    }
    
    setActivePiece(next);
    setNextPiece(future);
  }, [collide, grid, nextPiece, randomPiece]);

  useEffect(() => {
    if (score === 0 && lines === 0) {
      setLevel(startLevel);
      dropInterval.current = 1000 * Math.pow(0.85, startLevel - 1);
    }
  }, [startLevel, score, lines]);

  const merge = useCallback(() => {
    const newGrid = [...grid.map(row => [...row])];
    activePiece.matrix.forEach((row: any, y: number) => {
      row.forEach((value: number, x: number) => {
        if (value !== 0) {
          newGrid[y + activePiece.pos.y][x + activePiece.pos.x] = 1;
        }
      });
    });

    // Sweep
    let rowCount = 1;
    let clearedLines = 0;
    for (let y = ROWS - 1; y >= 0; --y) {
      if (newGrid[y].every(val => val !== 0)) {
        newGrid.splice(y, 1);
        newGrid.unshift(Array(COLS).fill(0));
        clearedLines++;
        y++; // Re-check same row index since we unshifted
      }
    }

    if (clearedLines > 0) {
      setScore(s => s + clearedLines * 10 * level);
      setLines(l => {
        const nextLines = l + clearedLines;
        if (Math.floor(nextLines / 10) > Math.floor(l / 10)) {
          setLevel(v => v + 1);
          dropInterval.current *= 0.85;
        }
        return nextLines;
      });
    }

    setGrid(newGrid);
  }, [activePiece, grid, level]);

  const move = useCallback((dir: number) => {
    if (gameOver || isPaused || !activePiece) return;
    const newPos = { ...activePiece.pos, x: activePiece.pos.x + dir };
    if (!collide({ ...activePiece, pos: newPos }, grid)) {
      setActivePiece({ ...activePiece, pos: newPos });
    }
  }, [activePiece, collide, gameOver, grid, isPaused]);

  const rotate = useCallback((dir: number) => {
    if (gameOver || isPaused || !activePiece) return;
    
    const rotateMatrix = (matrix: number[][], dir: number) => {
      const newMatrix = matrix.map((row, i) =>
        matrix.map(val => val[i])
      );
      if (dir > 0) return newMatrix.map(row => row.reverse());
      return newMatrix.reverse();
    };

    const newMatrix = rotateMatrix(activePiece.matrix, dir);
    const newPiece = { ...activePiece, matrix: newMatrix };
    
    let offset = 1;
    const originalX = newPiece.pos.x;
    while (collide(newPiece, grid)) {
      newPiece.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > newPiece.matrix[0].length) {
        newPiece.pos.x = originalX;
        return;
      }
    }
    setActivePiece(newPiece);
  }, [activePiece, collide, gameOver, grid, isPaused]);

  const drop = useCallback(() => {
    if (gameOver || isPaused || !activePiece) return;
    const newPos = { ...activePiece.pos, y: activePiece.pos.y + 1 };
    if (collide({ ...activePiece, pos: newPos }, grid)) {
      merge();
      spawnPiece();
    } else {
      setActivePiece({ ...activePiece, pos: newPos });
    }
    dropCounter.current = 0;
  }, [activePiece, collide, gameOver, grid, isPaused, merge, spawnPiece]);

  const hardDrop = useCallback(() => {
    if (gameOver || isPaused || !activePiece) return;
    let newY = activePiece.pos.y;
    while (!collide({ ...activePiece, pos: { ...activePiece.pos, y: newY + 1 } }, grid)) {
      newY++;
    }
    setActivePiece({ ...activePiece, pos: { ...activePiece.pos, y: newY } });
    merge();
    spawnPiece();
  }, [activePiece, collide, gameOver, grid, isPaused, merge, spawnPiece]);

  const reset = useCallback(() => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setScore(0);
    setLevel(startLevel);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    startedAt.current = Date.now();
    hasSavedResult.current = false;
    dropInterval.current = 1000 * Math.pow(0.85, startLevel - 1);
    const first = randomPiece();
    const second = randomPiece();
    setActivePiece(first);
    setNextPiece(second);
  }, [randomPiece, startLevel]);

  useEffect(() => {
    if (!activePiece && !gameOver) {
      reset();
    }
  }, [activePiece, gameOver, reset]);

  useEffect(() => {
    let animationFrameId: number;
    
    const update = (time = 0) => {
      if (!gameOver && !isPaused && activePiece) {
        const deltaTime = time - lastTime.current;
        lastTime.current = time;
        dropCounter.current += deltaTime;
        if (dropCounter.current > dropInterval.current) {
          drop();
        }
      }
      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activePiece, drop, gameOver, isPaused]);

  useEffect(() => {
    if (!gameOver || hasSavedResult.current) return;

    hasSavedResult.current = true;
    saveGameResult({
      score,
      lines,
      level,
      durationSeconds: Math.floor((Date.now() - startedAt.current) / 1000),
    });
  }, [gameOver, score, lines, level]);

  return {
    grid, activePiece, nextPiece, score, level, lines, gameOver, isPaused,
    move, rotate, drop, hardDrop, togglePause: () => setIsPaused(p => !p), reset,
    collide
  };
}
