import React from 'react';
import {
  ArrowLeft,
  Keyboard,
  Smartphone,
  RotateCcw,
  Volume2,
  Trophy,
  Share2,
  Gamepad2,
} from 'lucide-react';
import { useNavigation } from '../NavigationContext';

export const ManualScreen = () => {
  const { navigate } = useNavigation();

  return (
    <div className="min-h-screen bg-gb-bg text-gb-pale-lime pt-16 pb-20 md:pb-0 md:pl-24">
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-center px-4 h-16 bg-gb-lcd text-gb-lcd-dark border-b-4 border-gb-lcd-dark shadow-pixel-shadow md:pl-24">
        <button 
          onClick={() => navigate('game', 'push_back')}
          className="text-gb-lcd-dark hover:bg-gb-jungle/10 p-2 border-2 border-transparent hover:border-gb-lcd-dark transition-all active:translate-y-1 active:shadow-none absolute left-4 md:left-[calc(6rem+1rem)]"
        >
          <ArrowLeft size={22} strokeWidth={3} />
        </button>
        <h1 className="font-headline text-2xl font-black uppercase tracking-tighter text-center w-full">GAME MANUAL</h1>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 relative">
        <section className="bg-gb-bg border-4 border-gb-pale-lime shadow-pixel-shadow p-6 relative">
          <h2 className="text-3xl font-black mb-6 border-b-2 border-gb-pale-lime pb-2">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative bg-gb-jungle/20 border-2 border-gb-pale-lime p-6 flex justify-center items-center">
               <div className="relative w-32 h-32">
                  <div className="absolute top-8 left-0 w-32 h-16 bg-gb-pale-lime/80 border-2 border-gb-lcd-dark shadow-pixel-shadow" />
                  <div className="absolute top-0 left-8 w-16 h-32 bg-gb-pale-lime/80 border-2 border-gb-lcd-dark shadow-pixel-shadow" />
                  <div className="absolute top-[34px] left-[34px] w-[60px] h-[60px] bg-gb-pale-lime z-10 flex justify-center items-center shadow-inner">
                    <div className="w-8 h-8 rounded-full bg-gb-lcd-dark opacity-20" />
                  </div>
               </div>
               <div className="absolute bottom-4 right-4 flex gap-4 -rotate-12">
                  <div className="w-10 h-10 rounded-full bg-error border-2 border-gb-pale-lime shadow-pixel-shadow flex items-center justify-center text-gb-bg font-black text-xl">B</div>
                  <div className="w-10 h-10 rounded-full bg-error border-2 border-gb-pale-lime shadow-pixel-shadow flex items-center justify-center text-gb-bg font-black text-xl -mt-4">A</div>
               </div>
            </div>
            <div className="space-y-4">
              <ControlItem shortcut="◄ / ►" text="Move Tetromino left or right." />
              <ControlItem shortcut="▼" text="Soft Drop (faster fall)." />
              <ControlItem shortcut="▲ / A" text="Rotate 90° clockwise." />
              <ControlItem shortcut="B" text="Rotate 90° counter-clockwise." />
              <div className="flex items-start gap-4 mt-6">
                <div className="bg-gb-lcd text-gb-lcd-dark px-3 py-1 border-2 border-gb-lcd-dark font-black text-sm tracking-widest shadow-pixel-shadow rounded-full">START</div>
                <p className="pt-1">Pause the game.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gb-bg border-4 border-gb-pale-lime shadow-pixel-shadow p-6 relative">
          <h2 className="text-3xl font-black mb-6 border-b-2 border-gb-pale-lime pb-2">Pro Tips</h2>
          <div className="space-y-4">
            <Tip icon="visibility" title="Watch the Next Piece" text="Always keep an eye on the preview box to plan your next move." color="text-gb-lcd" />
            <Tip icon="architecture" title="Keep it Flat" text="Try to build your stack as flat as possible, avoiding deep gaps." color="text-gb-lcd" />
            <Tip icon="warning" title="Don't Panic" text="As the speed increases, stay calm. Rushing leads to misplaced blocks." color="text-error" />
          </div>
        </section>
      </main>
    </div>
  );
};

const ControlItem = ({ shortcut, text }: { shortcut: string, text: string }) => (
  <div className="flex items-start gap-4">
    <div className="bg-gb-pale-lime text-gb-bg px-2 py-1 border-2 border-gb-lcd font-black min-w-[80px] text-center shadow-pixel-shadow">{shortcut}</div>
    <p className="pt-1">{text}</p>
  </div>
);

const Tip = ({ icon, title, text, color }: any) => (
  <div className={`flex gap-4 border-l-4 border-current pl-4 py-2 ${color}`}>
    <Gamepad2 size={22} strokeWidth={3} />
    <p><strong className="uppercase">{title}:</strong> {text}</p>
  </div>
);
