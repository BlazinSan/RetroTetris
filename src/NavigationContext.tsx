import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Screen, TransitionType } from './types';

interface NavigationContextType {
  currentScreen: Screen;
  direction: number;
  transitionType: TransitionType;
  navigate: (to: Screen, transition?: TransitionType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('score')) {
        return 'share';
      }
    } catch {}
    return 'game';
  });
  const [direction, setDirection] = useState(0);
  const [transitionType, setTransitionType] = useState<TransitionType>('none');

  const navigate = (to: Screen, transition: TransitionType = 'none') => {
    // Basic heuristics for direction (standard push = 1, reverse/back = -1)
    if (transition === 'push') setDirection(1);
    else if (transition === 'push_back') setDirection(-1);
    else setDirection(0);

    setTransitionType(transition);
    setCurrentScreen(to);
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, direction, transitionType, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within NavigationProvider');
  return context;
};
