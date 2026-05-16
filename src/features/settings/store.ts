import { create } from 'zustand';

export type WeightUnit = 'kg' | 'lb';
export type ColorScheme = 'system' | 'light' | 'dark';

interface SettingsState {
  weightUnit: WeightUnit;
  colorScheme: ColorScheme;

  setWeightUnit: (unit: WeightUnit) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  weightUnit: 'kg',
  colorScheme: 'system',

  setWeightUnit: (unit) => set({ weightUnit: unit }),
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
}));
