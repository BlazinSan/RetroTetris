import React from 'react';
import { Gamepad2, History, Trophy, Settings, HelpCircle, BarChart3, SlidersHorizontal } from 'lucide-react';
import { useNavigation } from '../NavigationContext';

export const MobileNav = () => {
  const { currentScreen, navigate } = useNavigation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 z-50 flex justify-around items-center px-2 pb-2 bg-gb-lcd dark:bg-[#1a2e1a] text-gb-lcd-dark dark:text-[#d0f0c0] border-t-4 border-gb-lcd-dark">
      <a 
        onClick={(e) => { e.preventDefault(); navigate('game', 'none'); }} 
        href="#"
        className={`flex flex-col items-center justify-center p-1 transition-transform active:scale-95 w-[22%] ${currentScreen === 'game' ? 'bg-gb-lcd-dark text-gb-pale-lime border-2 border-gb-pale-lime' : ''}`}
      >
        <Gamepad2 size={24} />
        <span className="font-headline text-[10px] font-black uppercase">PLAY</span>
      </a>

      <a 
        onClick={(e) => { e.preventDefault(); navigate('history', 'none'); }} 
        href="#"
        className={`flex flex-col items-center justify-center p-1 transition-transform active:scale-95 w-[22%] ${currentScreen === 'history' ? 'bg-gb-lcd-dark text-gb-pale-lime border-2 border-gb-pale-lime' : ''}`}
      >
        <History size={22} strokeWidth={3} />
        <span className="font-headline text-[10px] font-black uppercase">HISTORY</span>
      </a>

      <a 
        onClick={(e) => { e.preventDefault(); navigate('leaderboard', 'none'); }} 
        href="#"
        className={`flex flex-col items-center justify-center p-1 transition-transform active:scale-95 w-[22%] ${currentScreen === 'leaderboard' ? 'bg-gb-lcd-dark text-gb-pale-lime border-2 border-gb-pale-lime' : ''}`}
      >
        <Trophy size={22} strokeWidth={3} />
        <span className="font-headline text-[10px] font-black uppercase">RANKS</span>
      </a>

      <a 
        onClick={(e) => { e.preventDefault(); navigate('config', 'push'); }} 
        href="#"
        className={`flex flex-col items-center justify-center p-1 transition-transform active:scale-95 w-[22%] ${currentScreen === 'config' ? 'bg-gb-lcd-dark text-gb-pale-lime border-2 border-gb-pale-lime' : ''}`}
      >
        <Settings size={22} strokeWidth={3} />
        <span className="font-headline text-[10px] font-black uppercase">CONFIG</span>
      </a>
    </nav>
  );
};

export const Sidebar = () => {
  const { currentScreen, navigate } = useNavigation();

  return (
    <aside className="hidden lg:flex flex-col w-24 h-screen fixed left-0 top-16 bg-gb-pale-lime dark:bg-gb-bg text-gb-lcd-dark dark:text-on-surface font-headline font-bold text-xs border-r-4 border-gb-lcd-dark divide-y-4 divide-gb-lcd-dark z-40">
      <div className="p-4 flex flex-col items-center bg-gb-lcd-dark text-gb-pale-lime mb-2">
        <div className="text-lg font-black px-1">P1</div>
        <div className="text-[10px] mt-1">LVL 99</div>
      </div>
      <a 
        onClick={(e) => { e.preventDefault(); navigate('game', 'none'); }} 
        href="#"
        className={`flex flex-col items-center justify-center p-2 hover:bg-gb-lcd active:scale-95 transition-all w-full ${currentScreen === 'game' ? 'bg-gb-lcd-dark text-gb-pale-lime' : 'text-gb-jungle dark:text-gb-pale-lime/70'}`}
      >
        <Gamepad2 size={22} strokeWidth={3} />
        <span>PLAY</span>
      </a>
      <a 
        onClick={(e) => { e.preventDefault(); navigate('history', 'none'); }} 
        href="#"
        className={`flex flex-col items-center justify-center p-2 hover:bg-gb-lcd active:scale-95 transition-all w-full ${currentScreen === 'history' ? 'bg-gb-lcd-dark text-gb-pale-lime' : 'text-gb-jungle dark:text-gb-pale-lime/70'}`}
      >
        <History size={22} strokeWidth={3} />
        <span>STATS</span>
      </a>
      <a 
        onClick={(e) => { e.preventDefault(); navigate('leaderboard', 'none'); }} 
        href="#"
        className={`flex flex-col items-center justify-center p-2 hover:bg-gb-lcd active:scale-95 transition-all w-full ${currentScreen === 'leaderboard' ? 'bg-gb-lcd-dark text-gb-pale-lime' : 'text-gb-jungle dark:text-gb-pale-lime/70'}`}
      >
        <BarChart3 size={22} strokeWidth={3} />
        <span>RANK</span>
      </a>
      <a 
        onClick={(e) => { e.preventDefault(); navigate('config', 'none'); }} 
        href="#"
        className={`flex flex-col items-center justify-center p-2 hover:bg-gb-lcd active:scale-95 transition-all w-full ${currentScreen === 'config' ? 'bg-gb-lcd-dark text-gb-pale-lime' : 'text-gb-jungle dark:text-gb-pale-lime/70'}`}
      >
        <Settings size={22} strokeWidth={3} />
        <span>OPTS</span>
      </a>
    </aside>
  );
};

export const TopBar = () => {
  const { navigate } = useNavigation();

  return (
    <header className="bg-lime-200 dark:bg-gb-jungle text-gb-lcd-dark dark:text-gb-pale-lime font-headline uppercase font-black tracking-widest border-b-4 border-gb-lcd-dark dark:border-gb-pale-lime shadow-[0_4px_0_0_#2d3a22] flex justify-between items-center w-full px-4 h-16 fixed top-0 z-50">
      <div className="text-xl font-black tracking-tighter border-2 border-gb-lcd-dark px-2">Retro Tetris</div>
      <nav className="hidden md:flex gap-8">
        <a onClick={(e) => { e.preventDefault(); navigate('game'); }} href="#" className="text-gb-lcd-dark font-black underline decoration-4 hover:bg-lime-300 transition-all">GAME</a>
        <a onClick={(e) => { e.preventDefault(); navigate('history'); }} href="#" className="text-gb-jungle dark:text-gb-pale-lime/80 hover:bg-lime-300 transition-all">STATS</a>
        <a onClick={(e) => { e.preventDefault(); navigate('leaderboard'); }} href="#" className="text-gb-jungle dark:text-gb-pale-lime/80 hover:bg-lime-300 transition-all">RANK</a>
        <a onClick={(e) => { e.preventDefault(); navigate('config'); }} href="#" className="text-gb-jungle dark:text-gb-pale-lime/80 hover:bg-lime-300 transition-all">OPTS</a>
      </nav>
      <div className="flex gap-4">
       <HelpCircle
          size={24}
          strokeWidth={3}
          className="cursor-pointer hover:bg-lime-300 p-1 box-content"
          onClick={() => navigate('manual', 'slide_up')}
        />
      </div>
    </header>
  );
};
