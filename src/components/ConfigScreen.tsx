import React from 'react';
import { useNavigation } from '../NavigationContext';
import { useSettings } from '../SettingsContext';
import {
  RotateCcw,
  ShieldCheck,
  Gamepad2,
  X,
  Volume2,
  Vibrate,
  Settings2,
} from 'lucide-react';

export const ConfigScreen = () => {
  const { navigate } = useNavigation();
  const { settings, updateSetting, resetSettings } = useSettings();

  const handleToggle = (name: string) => {
    updateSetting(name as any, !settings[name as keyof typeof settings]);
  };

  const handleChange = (name: string, value: number) => {
    updateSetting(name as any, value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gb-bg text-gb-pale-lime overflow-hidden">
      <header className="shrink-0 bg-gb-lcd text-gb-lcd-dark font-headline uppercase font-bold border-b-4 border-gb-lcd-dark flex justify-between items-center w-full px-4 py-2 z-10">
        <div className="flex items-center gap-2">
          <Gamepad2 size={22} strokeWidth={3} />
          <span className="font-black text-xl sm:text-2xl italic">CONFIG</span>
        </div>

        <button
          onClick={() => navigate('game', 'push_back')}
          className="w-9 h-9 flex items-center justify-center border-2 border-gb-lcd-dark bg-gb-lcd-dark text-gb-pale-lime shadow-pixel-shadow"
        >
          <X size={22} strokeWidth={3} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 sm:px-8 sm:py-8 sm:pb-32 flex justify-center">
        <div className="w-full max-w-[430px]">
          <div className="bg-gb-lcd-dark rounded-xl p-3 sm:p-5">
            <div className="dot-matrix bg-gb-lcd p-4 sm:p-6 flex flex-col gap-5 text-gb-lcd-dark">
              <ConfigSection icon={<Volume2 size={22} strokeWidth={3} />} title="SOUND">
                <Toggle label="MUSIC (KOROBEINIKI)" checked={settings.music} onChange={() => handleToggle('music')} />
                <Toggle label="SFX (BEEPS & BOOPS)" checked={settings.sfx} onChange={() => handleToggle('sfx')} />
                <Slider
                  label="VOLUME"
                  value={`${settings.volume}%`}
                  min={0}
                  max={100}
                  currentValue={settings.volume}
                  onChange={(e) => handleChange('volume', parseInt(e.target.value))}
                />
              </ConfigSection>

              <ConfigSection icon={<Gamepad2 size={22} strokeWidth={3} />} title="GAMEPLAY">
                <Slider
                  label="STARTING LEVEL"
                  value={`LVL ${settings.level}`}
                  labelMin="1 (SLOW)"
                  labelMax="10 (BRUTAL)"
                  min={1}
                  max={10}
                  currentValue={settings.level}
                  onChange={(e) => handleChange('level', parseInt(e.target.value))}
                />
                <Toggle label="GHOST PIECE" checked={settings.ghostPiece} onChange={() => handleToggle('ghostPiece')} />
                <Toggle label="HARD DROP" checked={settings.hardDrop} onChange={() => handleToggle('hardDrop')} />
              </ConfigSection>

              <ConfigSection icon={<Vibrate size={22} strokeWidth={3} />} title="INTERFACE">
                <Toggle label="SCREEN SHAKE" checked={settings.screenShake} onChange={() => handleToggle('screenShake')} />
                <Toggle label="HAPTIC FEEDBACK" checked={settings.haptic} onChange={() => handleToggle('haptic')} />
                <Toggle label="DARK MODE" checked={settings.darkMode} onChange={() => handleToggle('darkMode')} />
                <Toggle label="INVERT A & B BUTTONS" checked={settings.invertButtons} onChange={() => handleToggle('invertButtons')} />
              </ConfigSection>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={resetSettings}
              className="flex items-center justify-center gap-2 bg-gb-lcd-dark text-gb-pale-lime font-black px-2 py-3 border-2 border-gb-lcd-dark shadow-pixel-shadow active:translate-y-1 active:shadow-none uppercase text-[10px]"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <button
              onClick={() => navigate('game', 'push_back')}
              className="flex items-center justify-center gap-2 bg-gb-jungle text-gb-pale-lime font-black px-2 py-3 border-2 border-gb-lcd-dark shadow-pixel-shadow active:translate-y-1 active:shadow-none uppercase text-[10px]"
            >
              <ShieldCheck size={15} />
              Apply
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const ConfigSection = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center gap-2 border-b-2 border-gb-lcd-dark pb-2">
      {icon}
      <h2 className="font-headline font-black uppercase text-lg">{title}</h2>
    </div>

    <div className="flex flex-col gap-3">
      {children}
    </div>
  </section>
);

const Toggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label className="flex items-center justify-between gap-3 cursor-pointer">
    <span className="font-black uppercase text-[10px] leading-tight max-w-[175px]">
      {label}
    </span>

    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />

    <div
      className={`relative shrink-0 h-[26px] w-[52px] rounded-full border-2 border-gb-lcd-dark transition-all duration-300 ${
        checked ? 'bg-gb-jungle' : 'bg-gb-pale-lime'
      } shadow-[inset_2px_2px_4px_rgba(255,255,255,0.55),inset_-3px_-3px_6px_rgba(0,0,0,0.25)]`}
    >
      <div
        className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white border border-white/80 transition-all duration-300 shadow-[2px_2px_4px_rgba(0,0,0,0.35)] ${
          checked ? 'left-[28px]' : 'left-[2px]'
        }`}
      />
    </div>
  </label>
);

const Slider = ({
  label,
  value,
  labelMin,
  labelMax,
  min = 0,
  max = 100,
  currentValue,
  onChange,
}: {
  label: string;
  value: string;
  labelMin?: string;
  labelMax?: string;
  min?: number;
  max?: number;
  currentValue: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center gap-3">
      <span className="font-black text-[10px] uppercase">{label}</span>
      <span className="font-black text-[10px] px-2 py-1 bg-gb-lcd-dark text-gb-pale-lime">
        {value}
      </span>
    </div>

    <input
      type="range"
      min={min}
      max={max}
      value={currentValue}
      onChange={onChange}
      className="w-full accent-gb-lcd-dark cursor-pointer"
    />

    {labelMin && (
      <div className="flex justify-between text-[8px] font-black opacity-70">
        <span>{labelMin}</span>
        <span>{labelMax}</span>
      </div>
    )}
  </div>
);