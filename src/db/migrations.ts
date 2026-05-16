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
// All tables for programs, mesocycles, cycles, days, workouts,
// exercise_definitions, exercises, sets, workout_sessions, and set_logs.
// ---------------------------------------------------------------------------
const MIGRATION_V1 = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS programs (
  id          TEXT    PRIMARY KEY NOT NULL,
  name        TEXT    NOT NULL,
  color       TEXT,
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

CREATE TABLE IF NOT EXISTS cycles (
  id           TEXT    PRIMARY KEY NOT NULL,
  mesocycle_id TEXT    REFERENCES mesocycles(id) ON DELETE CASCADE,
  program_id   TEXT    NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  repetitions  INTEGER NOT NULL DEFAULT 1,
  "order"      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS days (
  id          TEXT    PRIMARY KEY NOT NULL,
  cycle_id    TEXT    NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  color       TEXT,
  description TEXT,
  "order"     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workouts (
  id      TEXT    PRIMARY KEY NOT NULL,
  day_id  TEXT    NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  name    TEXT    NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exercise_definitions (
  id               TEXT    PRIMARY KEY NOT NULL,
  name             TEXT    NOT NULL,
  description      TEXT,
  affected_muscles TEXT,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id                  TEXT    PRIMARY KEY NOT NULL,
  workout_id          TEXT    NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  definition_id       TEXT    REFERENCES exercise_definitions(id) ON DELETE SET NULL,
  name                TEXT    NOT NULL,
  description         TEXT,
  is_superset         INTEGER NOT NULL DEFAULT 0,
  superset_partner_id TEXT    REFERENCES exercises(id) ON DELETE SET NULL,
  is_completed        INTEGER NOT NULL DEFAULT 0,
  "order"             INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sets (
  id          TEXT    PRIMARY KEY NOT NULL,
  exercise_id TEXT    NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_type    TEXT    NOT NULL DEFAULT 'straight',
  config      TEXT    NOT NULL DEFAULT '{}',
  "order"     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id           TEXT    PRIMARY KEY NOT NULL,
  workout_id   TEXT    NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  started_at   INTEGER NOT NULL,
  completed_at INTEGER,
  notes        TEXT
);

CREATE TABLE IF NOT EXISTS set_logs (
  id                      TEXT    PRIMARY KEY NOT NULL,
  set_id                  TEXT    NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
  session_id              TEXT    NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  actual_reps             INTEGER,
  actual_weight           REAL,
  actual_duration_seconds INTEGER,
  note                    TEXT,
  custom_data             TEXT,
  logged_at               INTEGER NOT NULL
);
`;
