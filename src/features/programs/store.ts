import { create } from 'zustand';

interface ProgramsState {
  /** The UUID of the currently selected program, or null if none selected */
  selectedProgramId: string | null;
  /** The UUID of the active cycle within the selected program */
  activeCycleId: string | null;
  /** The UUID of the active day within the active cycle */
  activeDayId: string | null;

  setSelectedProgram: (programId: string | null) => void;
  setActiveCycle: (cycleId: string | null) => void;
  setActiveDay: (dayId: string | null) => void;
}

export const useProgramsStore = create<ProgramsState>()((set) => ({
  selectedProgramId: null,
  activeCycleId: null,
  activeDayId: null,

  setSelectedProgram: (programId) => set({ selectedProgramId: programId }),
  setActiveCycle: (cycleId) => set({ activeCycleId: cycleId }),
  setActiveDay: (dayId) => set({ activeDayId: dayId }),
}));
