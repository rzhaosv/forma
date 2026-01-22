// Unit System Store
// Manages unit system preference (metric vs imperial) across the entire app

import { create } from 'zustand';
import { getUnitSystem, setUnitSystem, UnitSystem } from '../utils/unitSystem';

interface UnitSystemState {
  unitSystem: UnitSystem;
  isLoading: boolean;
  setUnitSystem: (unitSystem: UnitSystem) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useUnitSystemStore = create<UnitSystemState>((set) => ({
  unitSystem: 'metric',
  isLoading: true,

  setUnitSystem: async (unitSystem: UnitSystem) => {
    await setUnitSystem(unitSystem);
    set({ unitSystem });
  },

  initialize: async () => {
    const unitSystem = await getUnitSystem();
    set({ unitSystem, isLoading: false });
  },
}));
