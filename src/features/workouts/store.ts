import { create } from 'zustand';

interface WorkoutsState {
  /** The UUID of the currently active workout session, or null if no session is in progress */
  activeSessionId: string | null;
  /** The UUID of the workout being tracked in the active session */
  activeWorkoutId: string | null;
  /** Set UUIDs that have been logged in the current session */
  loggedSetIds: Set<string>;

  setActiveSession: (sessionId: string | null, workoutId: string | null) => void;
  markSetLogged: (setId: string) => void;
  clearSession: () => void;
}

export const useWorkoutsStore = create<WorkoutsState>()((set) => ({
  activeSessionId: null,
  activeWorkoutId: null,
  loggedSetIds: new Set(),

  setActiveSession: (sessionId, workoutId) =>
    set({ activeSessionId: sessionId, activeWorkoutId: workoutId }),

  markSetLogged: (setId) =>
    set((state) => ({ loggedSetIds: new Set(state.loggedSetIds).add(setId) })),

  clearSession: () =>
    set({ activeSessionId: null, activeWorkoutId: null, loggedSetIds: new Set() }),
}));
