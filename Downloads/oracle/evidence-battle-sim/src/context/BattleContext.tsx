import React, { createContext, useContext, ReactNode } from 'react';
import { useBattle } from '../hooks/useBattle';

// Create context with the battle hook return type
const BattleContext = createContext<ReturnType<typeof useBattle> | null>(null);

export function BattleProvider({ children }: { children: ReactNode }) {
  const battle = useBattle();
  return <BattleContext.Provider value={battle}>{children}</BattleContext.Provider>;
}

export function useBattleContext() {
  const context = useContext(BattleContext);
  if (!context) {
    throw new Error('useBattleContext must be used within BattleProvider');
  }
  return context;
}
