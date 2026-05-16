/**
 * src/store/index.ts
 *
 * Re-exports all feature store hooks from a single entry point.
 * Screens and components can import from here instead of reaching
 * into individual feature folders.
 *
 * Each store is a standalone Zustand store — this file does not
 * combine them into one store instance. Zustand does not require
 * a single root store; per-feature stores are the recommended pattern.
 */

export { useProgramsStore } from '../features/programs/store';
export type {} from '../features/programs/store';

export { useWorkoutsStore } from '../features/workouts/store';
export type {} from '../features/workouts/store';

export { useExercisesStore } from '../features/exercises/store';
export type {} from '../features/exercises/store';

export { useSettingsStore } from '../features/settings/store';
export { type WeightUnit, type ColorScheme } from '../features/settings/store';
