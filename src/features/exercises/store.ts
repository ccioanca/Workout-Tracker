import { create } from 'zustand';

interface ExercisesState {
  /** Current autocomplete search query for exercise definitions */
  searchQuery: string;
  /** UUIDs of recently used exercise definitions, most recent first */
  recentDefinitionIds: string[];

  setSearchQuery: (query: string) => void;
  addRecentDefinition: (definitionId: string) => void;
  clearSearch: () => void;
}

const MAX_RECENT = 10;

export const useExercisesStore = create<ExercisesState>()((set) => ({
  searchQuery: '',
  recentDefinitionIds: [],

  setSearchQuery: (query) => set({ searchQuery: query }),

  addRecentDefinition: (definitionId) =>
    set((state) => {
      const filtered = state.recentDefinitionIds.filter((id) => id !== definitionId);
      return { recentDefinitionIds: [definitionId, ...filtered].slice(0, MAX_RECENT) };
    }),

  clearSearch: () => set({ searchQuery: '' }),
}));
