import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Settings {
  music: boolean;
  sfx: boolean;
  ghostPiece: boolean;
  hardDrop: boolean;
  screenShake: boolean;
  haptic: boolean;
  darkMode: boolean;
  invertButtons: boolean;
  volume: number;
  level: number;
  playerName: string;
  syncId: string;
}

const initialSettings: Settings = {
  music: true,
  sfx: true,
  ghostPiece: true,
  hardDrop: true,
  screenShake: false,
  haptic: true,
  darkMode: true,
  invertButtons: false,
  volume: 80,
  level: 5,
  playerName: 'RETRO_USER_01',
  syncId: ''
};

interface SettingsContextType {
  settings: Settings;
  updateSetting: (name: keyof Settings, value: any) => void;
  resetSettings: () => void;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>; // Expose setSettings for batch updates on sync/import
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('tetris-settings');
    return saved ? { ...initialSettings, ...JSON.parse(saved) } : initialSettings;
  });

  useEffect(() => {
    localStorage.setItem('tetris-settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateHistoryPlayerName = (newName: string) => {
    try {
      const historyRaw = localStorage.getItem('tetris-history');
      if (historyRaw) {
        const history = JSON.parse(historyRaw);
        if (Array.isArray(history)) {
          const updated = history.map((run: any) => ({
            ...run,
            name: newName,
            playerName: newName
          }));
          localStorage.setItem('tetris-history', JSON.stringify(updated));
        }
      }

      const leaderboardRaw = localStorage.getItem('tetris-leaderboard');
      if (leaderboardRaw) {
        const leaderboard = JSON.parse(leaderboardRaw);
        if (Array.isArray(leaderboard)) {
          const updated = leaderboard.map((run: any) => ({
            ...run,
            name: newName,
            playerName: newName
          }));
          localStorage.setItem('tetris-leaderboard', JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateSetting = (name: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [name]: value }));
    if (name === 'playerName') {
      updateHistoryPlayerName(value);
    }
  };

  const resetSettings = () => {
    setSettings(initialSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
