/**
 * src/db/types.ts
 *
 * Single source of truth for all database entity types.
 * All feature-level types and query helpers import from here.
 * Mirrors the schema defined in ARCHITECTURE.md exactly.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Unix timestamp in milliseconds */
export type Timestamp = number;

/** UUID string primary key */
export type UUID = string;

// ---------------------------------------------------------------------------
// Set types
// ---------------------------------------------------------------------------

export type BuiltInSetType =
  | 'straight'
  | 'amrap'
  | 'drop_set'
  | 'myo_match'
  | 'cluster'
  | 'time_based'
  | 'partial'
  | 'failure'
  | 'custom';

/** Free string allows user-defined custom set type names */
export type SetType = BuiltInSetType | string;

// ---------------------------------------------------------------------------
// Set config shapes (stored as JSON in sets.config)
// ---------------------------------------------------------------------------

export interface StraightSetConfig {
  target_reps?: number;
  target_reps_max?: number;
  target_weight?: number;
  weight_unit?: 'kg' | 'lb';
}

export interface AmrapSetConfig {
  target_weight?: number;
  weight_unit?: 'kg' | 'lb';
}

export interface TimeBasedSetConfig {
  duration_seconds: number;
}

export interface DropSetStage {
  weight: number;
}

export interface DropSetConfig {
  stages: DropSetStage[];
  weight_unit?: 'kg' | 'lb';
}

export interface CustomSetConfig {
  description?: string;
  raw_config?: string;
}

export type SetConfig =
  | StraightSetConfig
  | AmrapSetConfig
  | TimeBasedSetConfig
  | DropSetConfig
  | CustomSetConfig
  | Record<string, unknown>;

// ---------------------------------------------------------------------------
// Affected muscles (stored as JSON in exercise_definitions.affected_muscles)
// ---------------------------------------------------------------------------

export type MuscleRole = 'primary' | 'secondary' | 'tertiary';

export interface AffectedMuscles {
  primary?: string[];
  secondary?: string[];
  tertiary?: string[];
}

// ---------------------------------------------------------------------------
// DB entities
// ---------------------------------------------------------------------------

export interface Program {
  id: UUID;
  name: string;
  color: string | null;
  description: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Mesocycle {
  id: UUID;
  program_id: UUID;
  name: string;
  order: number;
  created_at: Timestamp;
}

export interface Cycle {
  id: UUID;
  /** Nullable — a cycle can belong directly to a program when no mesocycles exist */
  mesocycle_id: UUID | null;
  /** Direct program link when no mesocycle is present */
  program_id: UUID;
  name: string;
  repetitions: number;
  order: number;
}

export interface Day {
  id: UUID;
  cycle_id: UUID;
  name: string;
  color: string | null;
  description: string | null;
  order: number;
}

export interface Workout {
  id: UUID;
  day_id: UUID;
  name: string;
  order: number;
}

export interface ExerciseDefinition {
  id: UUID;
  name: string;
  description: string | null;
  /** JSON-serialized AffectedMuscles */
  affected_muscles: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/** ExerciseDefinition with affected_muscles already parsed */
export interface ExerciseDefinitionParsed extends Omit<ExerciseDefinition, 'affected_muscles'> {
  affected_muscles: AffectedMuscles | null;
}

export interface Exercise {
  id: UUID;
  workout_id: UUID;
  /** Nullable — one-off exercises are not linked to a definition */
  definition_id: UUID | null;
  name: string;
  description: string | null;
  /** 1 = true, 0 = false (SQLite boolean) */
  is_superset: number;
  superset_partner_id: UUID | null;
  /** 1 = true, 0 = false (SQLite boolean) */
  is_completed: number;
  order: number;
}

export interface Set {
  id: UUID;
  exercise_id: UUID;
  set_type: SetType;
  /** JSON-serialized SetConfig */
  config: string;
  order: number;
}

/** Set with config already parsed */
export interface SetParsed extends Omit<Set, 'config'> {
  config: SetConfig;
}

export interface SetLog {
  id: UUID;
  set_id: UUID;
  session_id: UUID;
  actual_reps: number | null;
  actual_weight: number | null;
  actual_duration_seconds: number | null;
  note: string | null;
  /** JSON-serialized extra data for custom set types */
  custom_data: string | null;
  logged_at: Timestamp;
}

export interface WorkoutSession {
  id: UUID;
  workout_id: UUID;
  started_at: Timestamp;
  /** Null while the session is still active */
  completed_at: Timestamp | null;
  notes: string | null;
}
