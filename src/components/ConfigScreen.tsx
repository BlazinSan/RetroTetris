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
  Users,
  Cloud,
} from 'lucide-react';
import { uploadSyncData, updateSyncData, downloadSyncData } from '../sync';

export const ConfigScreen = () => {
  const { navigate } = useNavigation();
  const { settings, updateSetting, resetSettings, setSettings } = useSettings();
  const [inputSyncId, setInputSyncId] = React.useState('');
  const [syncStatus, setSyncStatus] = React.useState<string | null>(null);

  const handleUploadBackup = async () => {
    setSyncStatus('BACKING UP...');
    try {
      const history = JSON.parse(localStorage.getItem('tetris-history') || '[]');
      const data = { history, settings };
      if (settings.syncId) {
        await updateSyncData(settings.syncId, data);
        setSyncStatus('BACKUP UPDATED!');
      } else {
        const newId = await uploadSyncData(data);
        updateSetting('syncId', newId);
        setSyncStatus('BACKUP CREATED!');
      }
    } catch (err) {
      setSyncStatus('BACKUP FAILED!');
    }
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleImportBackup = async () => {
    if (!inputSyncId.trim()) {
      setSyncStatus('ENTER SYNC ID!');
      setTimeout(() => setSyncStatus(null), 3000);
      return;
    }
    setSyncStatus('IMPORTING...');
    try {
      const data = await downloadSyncData(inputSyncId.trim());
      if (data) {
        if (data.history) {
          localStorage.setItem('tetris-history', JSON.stringify(data.history));
        }
        if (data.settings) {
          setSettings({ ...settings, ...data.settings, syncId: inputSyncId.trim() });
        }
        setSyncStatus('IMPORT SUCCESSFUL!');
      } else {
        setSyncStatus('IMPORT FAILED!');
      }
    } catch (err) {
      setSyncStatus('IMPORT ERROR!');
    }
    setTimeout(() => setSyncStatus(null), 3000);
  };

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

              <ConfigSection icon={<Users size={22} strokeWidth={3} />} title="PROFILE">
                <div className="flex flex-col gap-1.5">
                  <span className="font-black text-[10px] uppercase">PLAYER NAME</span>
                  <input
                    type="text"
                    maxLength={14}
                    value={settings.playerName}
                    onChange={(e) => updateSetting('playerName', e.target.value.toUpperCase())}
                    className="w-full bg-gb-pale-lime text-gb-lcd-dark border-2 border-gb-lcd-dark font-black px-2.5 py-1.5 uppercase placeholder-gb-lcd-dark/40 focus:outline-none text-xs"
                    placeholder="PLAYER NAME"
                  />
                </div>
              </ConfigSection>

              <ConfigSection icon={<Cloud size={22} strokeWidth={3} />} title="ONLINE SYNC">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-black text-[10px] uppercase text-gb-lcd-dark/70">CLOUD SYNC ID</span>
                    {settings.syncId ? (
                      <div className="bg-gb-pale-lime text-gb-lcd-dark border-2 border-gb-lcd-dark font-black px-2.5 py-1.5 break-all text-xs flex justify-between items-center gap-2">
                        <span className="select-all">{settings.syncId}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(settings.syncId);
                            setSyncStatus('ID COPIED!');
                            setTimeout(() => setSyncStatus(null), 2000);
                          }}
                          className="text-gb-lcd-dark hover:scale-95 active:scale-90 font-black uppercase text-[9px] border border-gb-lcd-dark px-1 py-0.5"
                        >
                          COPY
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold italic text-gb-lcd-dark/50">NO BACKUP SYNCED YET</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleUploadBackup}
                      className="flex-1 bg-gb-lcd-dark text-gb-pale-lime font-black py-2 text-[10px] border-2 border-gb-lcd-dark shadow-pixel-shadow active:translate-y-0.5 active:shadow-none uppercase"
                    >
                      {settings.syncId ? 'Update Backup' : 'Create Backup'}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-dashed border-gb-lcd-dark/30 pt-2.5">
                    <span className="font-black text-[10px] uppercase text-gb-lcd-dark/70">IMPORT FROM SYNC ID</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={inputSyncId}
                        onChange={(e) => setInputSyncId(e.target.value)}
                        className="flex-1 bg-gb-pale-lime text-gb-lcd-dark border-2 border-gb-lcd-dark font-black px-2.5 py-1.5 text-xs placeholder-gb-lcd-dark/40 focus:outline-none"
                        placeholder="PASTE SYNC ID"
                      />
                      <button
                        onClick={handleImportBackup}
                        className="bg-gb-jungle text-gb-pale-lime font-black px-3 py-1.5 border-2 border-gb-lcd-dark text-[10px] shadow-pixel-shadow active:translate-y-0.5 active:shadow-none uppercase"
                      >
                        Import
                      </button>
                    </div>
                  </div>

                  {syncStatus && (
                    <div className="bg-gb-lcd-dark text-gb-pale-lime font-black text-center py-1.5 text-[10px] animate-pulse border border-gb-lcd-dark uppercase">
                      {syncStatus}
                    </div>
                  )}
                </div>
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