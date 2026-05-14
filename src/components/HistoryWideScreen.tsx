import React from 'react';
import { MOCK_HISTORY } from '../constants';
import { useNavigation } from '../NavigationContext';

export const HistoryWideScreen = () => {
  const { navigate } = useNavigation();

  return (
    <div className="min-h-screen bg-gb-pale-lime p-8 flex flex-col pb-32">
      <div className="flex-1 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-12 border-b-4 border-gb-lcd-dark pb-6">
          <div className="flex items-center gap-6">
             <button 
              onClick={() => navigate('game', 'push_back')}
              className="w-12 h-12 flex items-center justify-center bg-gb-lcd-dark text-gb-pale-lime border-2 border-gb-lcd-dark shadow-pixel-shadow active:translate-y-1 active:shadow-none transition-all"
             >
               <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
             </button>
             <h1 className="text-3xl font-black uppercase tracking-tighter text-[#25352f]">SESSION HISTORY</h1>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-gb-lcd border-4 border-gb-lcd-dark p-6 shadow-pixel-shadow col-span-1 md:col-span-2 lg:col-span-1 flex flex-col gap-6">
           <h2 className="text-xl font-black border-b-2 border-gb-lcd-dark pb-2 text-[#253329]">OVERVIEW</h2>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-gb-lcd-dark text-gb-pale-lime p-4 border-2 border-gb-lcd-dark shadow-pixel-shadow">
                <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Total Plays</p>
                <p className="text-4xl font-black">128</p>
              </div>
              <div className="bg-gb-jungle text-gb-pale-lime p-4 border-2 border-gb-lcd-dark shadow-pixel-shadow">
                <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Avg Score</p>
                <p className="text-4xl font-black">42.5K</p>
              </div>
           </div>
           
           <div className="flex-1 space-y-4">
             <div className="bg-white/10 p-4 border-2 border-gb-lcd-dark shadow-pixel-shadow">
                <p className="text-xs font-bold opacity-70 uppercase tracking-widest">High Score</p>
                <p className="text-4xl font-black">842,500</p>
             </div>
             <div className="bg-white/10 p-4 border-2 border-gb-lcd-dark shadow-pixel-shadow">
                <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Avg Level</p>
                <p className="text-4xl font-black">18</p>
             </div>
           </div>
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-6">
           <h2 className="text-xl font-black uppercase border-b-4 border-gb-lcd-dark inline-block mb-4 text-[#253329]">Detailed Logs</h2>
           <div className="grid grid-cols-1 gap-4">
              {MOCK_HISTORY.map(run => (
                <div key={run.id} className="bg-gb-lcd border-4 border-gb-lcd-dark p-6 flex justify-between items-center shadow-pixel-shadow transition-transform hover:scale-[1.005]">
                   <div className="flex gap-8 items-center">
                      <div className="bg-gb-lcd-dark text-gb-pale-lime w-12 h-12 flex items-center justify-center font-black">#{run.id}</div>
                      <div>
                        <p className="font-bold text-xl text-gb-lcd-dark leading-tight">{run.date}</p>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1 italic">Duration: {run.duration}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-10">
                      <div className="text-right hidden sm:block">
                         <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Metrics</p>
                         <p className="text-sm font-black text-gb-lcd-dark">LVL {run.level} / {run.lines} LINES</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-gb-jungle uppercase tracking-[0.2em] mb-1">Score</p>
                         <p className="font-black text-3xl text-gb-lcd-dark">{run.score.toLocaleString()}</p>
                         <div className="flex justify-end mt-1">
                           <span className="bg-gb-pale-lime text-gb-lcd-dark px-2 py-0.5 text-[10px] font-black border-2 border-gb-lcd-dark">RANK {run.rank}</span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>

    {/* Bottom Nav for consistency */}
    <nav className="fixed bottom-0 left-0 w-full h-20 z-50 flex justify-around items-center px-4 bg-gb-lcd border-t-4 border-gb-lcd-dark shadow-[0_-4px_0_0_rgba(0,0,0,0.1)]">
      <a 
        onClick={(e) => { e.preventDefault(); navigate('game', 'none'); }} 
        href="#"
        className="flex flex-col items-center justify-center p-2 hover:bg-gb-lcd-dark/10 transition-transform active:scale-95 w-1/3"
      >
        <span className="material-symbols-outlined" data-icon="videogame_asset">videogame_asset</span>
        <span className="text-[10px] font-black uppercase">Play</span>
      </a>
      <a 
        onClick={(e) => { e.preventDefault(); navigate('leaderboard', 'none'); }} 
        href="#"
        className="flex flex-col items-center justify-center p-2 hover:bg-gb-lcd-dark/10 transition-transform active:scale-95 w-1/3"
      >
        <span className="material-symbols-outlined" data-icon="emoji_events">emoji_events</span>
        <span className="text-[10px] font-black uppercase">Rank</span>
      </a>
      <a 
        onClick={(e) => { e.preventDefault(); navigate('config', 'none'); }} 
        href="#"
        className="flex flex-col items-center justify-center p-2 hover:bg-gb-lcd-dark/10 transition-transform active:scale-95 w-1/3"
      >
        <span className="material-symbols-outlined" data-icon="settings">settings</span>
        <span className="text-[10px] font-black uppercase">Config</span>
      </a>
    </nav>
  </div>
  );
};
