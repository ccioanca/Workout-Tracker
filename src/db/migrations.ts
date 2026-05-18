import { type SQLiteDatabase } from 'expo-sqlite';

/**
 * Runs any pending SQL migrations against the database.
 * Uses PRAGMA user_version to track which migrations have been applied.
 * Add new migrations by incrementing the version check and appending SQL below.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(MIGRATION_V1);
    await db.execAsync('PRAGMA user_version = 1');
  }

  // Future migrations:
  // if (currentVersion < 2) {
  //   await db.execAsync(MIGRATION_V2);
  //   await db.execAsync('PRAGMA user_version = 2');
  // }
}

// ---------------------------------------------------------------------------
// Migration v1 — initial schema
//
// Table creation order matters: a table must be defined before any other
// table references it via a foreign key.
//   programs → mesocycles → cycles → days → workouts
//   workouts → exercise_definitions → workout_sessions
//   workout_sessions → exercises → sets → set_logs
//
// Special column conventions used throughout this schema:
//
//   "order" (quoted)
//     Display/sequence order within a parent. Quoted because ORDER is a
//     reserved SQL keyword.
//
//   session_id (on exercises and sets)
//     Supports ad-hoc additions made during a live workout session.
//     NULL  → permanent template row; part of the saved workout definition.
//     UUID  → created ad-hoc during the referenced session. Cascade-deleted
//             if the session is abandoned. At session completion the user is
//             offered the option to promote ad-hoc rows to the template by
//             setting session_id back to NULL.
//
//   compound_group_id (on sets)
//     Groups sets within a single exercise into a compound block — sets
//     executed back-to-back before a rest period (e.g. straight → drop set).
//     NULL  → standalone set.
//     UUID  → part of a compound block; all sets in the same exercise sharing
//             this value are displayed and executed together.
//
//   is_superset / superset_partner_id (on exercises)
//     Marks two separate exercises as a superset pair — different exercises
//     interleaved set-for-set (e.g. bicep curls paired with tricep pushdowns).
//     is_superset = 1 means this exercise has a partner.
//     superset_partner_id points to the paired exercise.
//
//   affected_muscles (on exercise_definitions)
//     JSON column. Shape: { primary: string[], secondary: string[], tertiary: string[] }
//     Used to calculate weighted set volume per muscle group:
//       primary → 1.0× sets, secondary → 0.5×, tertiary → 0.25×
//
//   config (on sets)
//     JSON column. Shape varies by set_type. Examples:
//       straight   → { target_reps, target_reps_max, target_weight, weight_unit }
//       drop_set   → { stages: [{ weight }], weight_unit }
//       time_based → { duration_seconds }
//       amrap      → { target_weight, weight_unit }
//       custom     → { description, raw_config }
//
//   custom_data (on set_logs)
//     JSON column for overflow logging data that doesn't fit the standard
//     actual_reps / actual_weight / actual_duration_seconds columns.
//     Used primarily by custom set types.
// ---------------------------------------------------------------------------
const MIGRATION_V1 = `
PRAGMA foreign_keys = ON;

-- Core program hierarchy: programs → mesocycles → cycles → days → workouts
CREATE TABLE IF NOT EXISTS programs (
  id          TEXT    PRIMARY KEY NOT NULL,
  name        TEXT    NOT NULL,
  color       TEXT,                         -- Optional hex color for UI display
  description TEXT,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS mesocycles (
  id          TEXT    PRIMARY KEY NOT NULL,
  program_id  TEXT    NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  "order"     INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);

-- A cycle is a repeating block of days within a mesocycle (or directly under
-- a program when no mesocycles are used). "repetitions" defines how many
-- times the cycle loops before the program advances.
CREATE TABLE IF NOT EXISTS cycles (
  id           TEXT    PRIMARY KEY NOT NULL,
  mesocycle_id TEXT    REFERENCES mesocycles(id) ON DELETE CASCADE, -- nullable; null = no mesocycle
  program_id   TEXT    NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  repetitions  INTEGER NOT NULL DEFAULT 1,
  "order"      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS days (
  id          TEXT    PRIMARY KEY NOT NULL,
  cycle_id    TEXT    NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  color       TEXT,                         -- Optional hex color for UI display
  description TEXT,
  "order"     INTEGER NOT NULL DEFAULT 0    -- Sequence position within the cycle
);

-- A workout is a session template within a day. Most days have exactly one
-- workout; the 1:many relationship exists for users who train multiple times
-- per day. When only one workout exists, it inherits the day's name in the UI.
CREATE TABLE IF NOT EXISTS workouts (
  id      TEXT    PRIMARY KEY NOT NULL,
  day_id  TEXT    NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  name    TEXT    NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Reusable exercise definitions that form the user's personal exercise library.
-- Separate from "exercises" (which are instances within a specific workout).
CREATE TABLE IF NOT EXISTS exercise_definitions (
  id               TEXT    PRIMARY KEY NOT NULL,
  name             TEXT    NOT NULL,
  description      TEXT,
  affected_muscles TEXT,                    -- JSON: { primary, secondary, tertiary }
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);

-- Defined before exercises and sets so both can hold a foreign key to it
-- for the ad-hoc session_id pattern (see column convention notes above).
CREATE TABLE IF NOT EXISTS workout_sessions (
  id           TEXT    PRIMARY KEY NOT NULL,
  workout_id   TEXT    NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  started_at   INTEGER NOT NULL,
  completed_at INTEGER,                     -- NULL while the session is still active
  notes        TEXT
);

-- Exercise instances within a specific workout template.
-- See session_id and is_superset conventions in the header comment.
CREATE TABLE IF NOT EXISTS exercises (
  id                  TEXT    PRIMARY KEY NOT NULL,
  workout_id          TEXT    NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  definition_id       TEXT    REFERENCES exercise_definitions(id) ON DELETE SET NULL, -- nullable: one-off exercises
  name                TEXT    NOT NULL,     -- Copied from definition; editable independently
  description         TEXT,
  is_superset         INTEGER NOT NULL DEFAULT 0,                                     -- boolean
  superset_partner_id TEXT    REFERENCES exercises(id) ON DELETE SET NULL,            -- nullable
  is_completed        INTEGER NOT NULL DEFAULT 0,                                     -- boolean
  "order"             INTEGER NOT NULL DEFAULT 0,
  session_id          TEXT    REFERENCES workout_sessions(id) ON DELETE CASCADE       -- nullable; see convention
);

-- Set templates within an exercise. Defines what the user intends to do.
-- Actual performance is recorded in set_logs.
-- See session_id and compound_group_id conventions in the header comment.
CREATE TABLE IF NOT EXISTS sets (
  id                TEXT    PRIMARY KEY NOT NULL,
  exercise_id       TEXT    NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_type          TEXT    NOT NULL DEFAULT 'straight', -- see built-in types in ARCHITECTURE.md
  config            TEXT    NOT NULL DEFAULT '{}',       -- JSON; shape varies by set_type
  "order"           INTEGER NOT NULL DEFAULT 0,
  session_id        TEXT    REFERENCES workout_sessions(id) ON DELETE CASCADE,        -- nullable; see convention
  compound_group_id TEXT                                                              -- nullable; see convention
);

-- Actual logged performance for one set during a session.
CREATE TABLE IF NOT EXISTS set_logs (
  id                      TEXT    PRIMARY KEY NOT NULL,
  set_id                  TEXT    NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
  session_id              TEXT    NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  actual_reps             INTEGER,          -- nullable for non-rep set types
  actual_weight           REAL,             -- nullable for bodyweight or time-based sets
  actual_duration_seconds INTEGER,          -- for time_based sets
  note                    TEXT,             -- personal note for this specific logged set
  custom_data             TEXT,             -- JSON overflow for custom set types
  logged_at               INTEGER NOT NULL
);
`;
