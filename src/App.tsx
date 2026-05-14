import React from "react";
import { NavigationProvider, useNavigation } from "./NavigationContext";
import { SettingsProvider } from "./SettingsContext";

import { GameScreen } from "./components/GameScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { ConfigScreen } from "./components/ConfigScreen";
import { ManualScreen } from "./components/ManualScreen";
import { ShareScreen } from "./components/ShareScreen";
import { MobileNav, Sidebar, TopBar } from "./components/Navigation";

function AppContent() {
  const { currentScreen } = useNavigation();

  switch (currentScreen) {
    case "history":
      return <HistoryScreen />;
    case "leaderboard":
      return <LeaderboardScreen />;
    case "config":
      return <ConfigScreen />;
    case "manual":
      return <ManualScreen />;
    case "share":
      return <ShareScreen />;
    case "game":
    default:
      return <GameScreen />;
  }
}

function AppLayout() {
  const { currentScreen } = useNavigation();
  const showGameNavigation = currentScreen === "game";

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans">
      {showGameNavigation && <TopBar />}
      {showGameNavigation && <Sidebar />}

      <main className={showGameNavigation ? "lg:pl-24 pt-16 pb-20 md:pb-0" : ""}>
        <AppContent />
      </main>

      {showGameNavigation && <MobileNav />}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <NavigationProvider>
        <AppLayout />
      </NavigationProvider>
    </SettingsProvider>
  );
}