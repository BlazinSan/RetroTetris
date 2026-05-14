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
  level: 5
};

interface SettingsContextType {
  settings: Settings;
  updateSetting: (name: keyof Settings, value: any) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('tetris-settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  useEffect(() => {
    localStorage.setItem('tetris-settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSetting = (name: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const resetSettings = () => {
    setSettings(initialSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
