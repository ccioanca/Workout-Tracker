# Workout Tracker — Application Architecture

## Overview

A local-first, cross-platform workout tracking app built with Expo. The app is Android-primary but targets all platforms (iOS, web) via responsive design from day one. There is no cloud backend at launch; however, the architecture is explicitly designed to accommodate cloud sync as a future upgrade with minimal rework.

The core design philosophy mirrors the app's own UX philosophy: no hand-holding, no rigid structure. The architecture is intentionally flexible in the places the app is flexible (set types, exercise definitions, user-defined structures), and structured where reliability matters (program hierarchy, session logging, reporting).

---

## Tech Stack

| Concern | Choice | Version | Rationale |
|---|---|---|---|
| Framework | Expo (managed workflow) | SDK 52+ | Best-in-class cross-platform DX; handles web + mobile from one codebase |
| Language | TypeScript | 5.x (strict) | Strict mode on from day one; catches structural and logic bugs at compile time |
| Navigation | Expo Router | v6 | File-based routing; web-ready out of the box; Android hardware back is automatic |
| UI/Styling | NativeWind | v4 | Tailwind CSS syntax for React Native; responsive variants for tablet and web; familiar to the team |
| State Management | Zustand | v4 | Minimal boilerplate; per-feature slices; v4 is stable and avoids ESM issues in v5 |
| Local Database | expo-sqlite | v2 | Native SQLite with `useSQLiteContext`; supports JSON column queries via `json_extract()` |
| DB Queries | Raw SQL + TypeScript types | — | Hand-written typed query helpers in `src/db/queries/`; no ORM abstraction to learn |
| Build (daily QA) | `npx expo start` + Expo Go | — | Expo Go on Android device; `--web` flag for web/responsive layout checks on desktop |
| Build (distribution) | EAS Build | — | Future use only — for producing shareable APKs or iOS builds when needed |
| Animations | React Native Reanimated + Moti | — | **Possible future addition** — smooth gesture and transition animations; deferred until UI/UX design is settled |

---

## Platform Targets

| Platform | Priority | Notes |
|---|---|---|
| Android | **Primary** | All development targets Android first |
| iOS | Secondary | Expo managed workflow; EAS Build required for iOS distribution |
| Web | Secondary | Expo Router + React Native Web; enabled via `npx expo start --web`; used for responsive layout QA |
| Tablet | Secondary | NativeWind responsive breakpoints (`md:`, `lg:`) expand the layout; no separate codebase or routes |

Platform-specific files (`.android.tsx`, `.native.tsx`, `.web.tsx`) are used sparingly — only when a component must differ meaningfully across platforms.

---

## Folder Structure

```
/
├── app/                              ← Expo Router routes ONLY. No business logic or components.
│   ├── (tabs)/                       ← Main tab shell (exact tabs and routes TBD pending UI design)
│   │   └── _layout.tsx               ← Tab bar configuration
│   ├── _layout.tsx                   ← Root layout: SQLiteProvider, global CSS import, Zustand init
│   └── +not-found.tsx
│
├── src/
│   ├── features/                     ← One folder per product feature. Each is self-contained.
│   │   ├── programs/
│   │   │   ├── components/           ← ProgramCard, MesocycleList, DayCard, etc.
│   │   │   ├── hooks/                ← useProgramList, useProgram, useDaySequence, etc.
│   │   │   ├── store.ts              ← Zustand slice: selected program, active cycle/day state
│   │   │   └── types.ts              ← TypeScript types for this feature's data
│   │   ├── workouts/
│   │   │   ├── components/           ← ActiveSessionCard, ExerciseLogger, SetRow, SetTypeSelector, etc.
│   │   │   ├── hooks/                ← useActiveSession, useNextWorkout, useSessionTimer, etc.
│   │   │   ├── store.ts              ← Zustand slice: live session state (in-progress sets, timing)
│   │   │   └── types.ts
│   │   ├── exercises/
│   │   │   ├── components/           ← ExerciseAutocomplete, ExerciseDefinitionCard, MuscleGroupBadge
│   │   │   ├── hooks/                ← useExerciseSearch, useExerciseDefinition, etc.
│   │   │   ├── store.ts              ← Zustand slice: recently used exercises, search state
│   │   │   └── types.ts
│   │   ├── reporting/
│   │   │   ├── components/           ← TrendChart, PRBadge, VolumeBar, ProgramProgressCard, etc.
│   │   │   ├── hooks/                ← use1RMTrend, useVolumeHistory, useProgramStats, etc.
│   │   │   └── types.ts
│   │   └── settings/
│   │       ├── components/           ← SettingsItem, DangerZone, ImportExportButtons
│   │       ├── hooks/                ← useAppSettings
│   │       └── store.ts              ← Zustand slice: user preferences
│   │
│   ├── shared/
│   │   ├── components/               ← Reusable, feature-agnostic UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx             ← Bottom sheet / modal wrapper
│   │   │   ├── Badge.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ScreenWrapper.tsx     ← Safe area + scroll handling
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   └── useColorScheme.ts     ← NativeWind dark mode integration
│   │   └── utils/
│   │       ├── format.ts             ← Date, weight, rep formatting helpers
│   │       └── assert.ts             ← Typed runtime assertions
│   │
│   ├── db/
│   │   ├── types.ts                  ← TypeScript type definitions for all DB entities (single source of truth)
│   │   ├── migrations.ts             ← SQL migration strings + PRAGMA user_version runner
│   │   ├── client.ts                 ← expo-sqlite database instance and SQLiteProvider setup
│   │   └── queries/                  ← Hand-written typed SQL query helpers, grouped by feature
│   │       ├── programs.ts
│   │       ├── workouts.ts
│   │       ├── exercises.ts
│   │       └── sessions.ts
│   │
│   ├── store/
│   │   └── index.ts                  ← Combines all Zustand feature slices into a root store
│   │
│   └── services/
│       ├── calculations.ts           ← 1RM, 10RM, volume, trend math (pure functions, no DB access)
│       └── importExport.ts           ← Full-database JSON serialization for backup and restore
│
├── assets/                           ← Images, fonts, icons
├── tailwind.config.js                ← NativeWind theme config (colors, spacing, fonts)
└── metro.config.js                   ← withNativeWind() configuration
```

### Key Structural Rules

- `app/` contains **only** route files. Screens are thin: they import from `src/features/` and compose the view. No business logic lives in `app/`.
- Each feature in `src/features/` is self-contained. A feature owns its components, hooks, store slice, and types. Cross-feature dependencies go through `src/shared/` or the `src/db/queries/` layer.
- `src/db/types.ts` is the single source of truth for data shape. All feature `types.ts` files import from here rather than redeclaring entity shapes.
- `src/services/` contains logic that is not tied to a single feature (e.g., 1RM calculations apply to any rep-based exercise, regardless of which program it belongs to).

---

## Data Architecture

### Design Philosophy

The database must be structured enough to support rich reporting and relational queries, while remaining flexible enough to accommodate user-defined structures (custom set types, arbitrary exercise variants, personal rep/set configurations). This is achieved by using:

1. **Relational tables** for everything structural and queryable (program hierarchy, exercise definitions, sessions).
2. **JSON text columns** for user-defined, extensible, or loosely structured configuration (set config, affected muscles, custom log data). SQLite's `json_extract()` function is used when reporting needs to reach into these columns.

---

### Schema

All TypeScript types for database entities are defined in `src/db/types.ts`. These are plain TypeScript interfaces — no ORM decorators or schema builders. Query functions in `src/db/queries/` use these types as their return types, keeping queries fully typed without any third-party query layer.

#### `programs`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` (UUID) | Primary key |
| `name` | `text` | Required |
| `color` | `text` | Optional hex color |
| `description` | `text` | Optional |
| `created_at` | `integer` | Unix timestamp |
| `updated_at` | `integer` | Unix timestamp |

#### `mesocycles`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` (UUID) | Primary key |
| `program_id` | `text` | FK → `programs.id` |
| `name` | `text` | Required |
| `order` | `integer` | Display order within the program |
| `created_at` | `integer` | |

#### `cycles`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` (UUID) | Primary key |
| `mesocycle_id` | `text` | FK → `mesocycles.id` (nullable — cycles can belong to a program directly if no mesocycles) |
| `program_id` | `text` | FK → `programs.id` (direct program link when no mesocycle) |
| `name` | `text` | e.g. "Working Block", "Deload" |
| `repetitions` | `integer` | How many times this cycle repeats before the program advances |
| `order` | `integer` | |

#### `days`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` (UUID) | Primary key |
| `cycle_id` | `text` | FK → `cycles.id` |
| `name` | `text` | e.g. "Chest Day", "Lower A" |
| `color` | `text` | Optional |
| `description` | `text` | Optional |
| `order` | `integer` | Sequence order within the cycle |

#### `workouts`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` (UUID) | Primary key |
| `day_id` | `text` | FK → `days.id` |
| `name` | `text` | Only shown in UI when multiple workouts exist per day |
| `order` | `integer` | |

#### `exercise_definitions`
The reusable, local library of exercises the user has created or used before.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` (UUID) | Primary key |
| `name` | `text` | Required; used for autocomplete search |
| `description` | `text` | Optional |
| `affected_muscles` | `text` (JSON) | `{ "primary": ["Chest"], "secondary": ["Front Delt"], "tertiary": ["Tricep"] }` |
| `created_at` | `integer` | |
| `updated_at` | `integer` | |

**Affected Muscle Weighting (for volume tracking):**
- Primary: 1 set counted per set performed
- Secondary: 0.5 sets counted per set performed
- Tertiary: 0.25 sets counted per set performed

#### `exercises`
A trackable exercise instance inside a specific workout. References an `exercise_definition` but can be created inline without one.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` (UUID) | Primary key |
| `workout_id` | `text` | FK → `workouts.id` |
| `definition_id` | `text` | FK → `exercise_definitions.id` (nullable for one-off exercises) |
| `name` | `text` | Copied from definition at time of creation; editable independently |
| `description` | `text` | Optional |
| `is_superset` | `integer` (boolean) | If true, this exercise is paired with `superset_partner_id` |
| `superset_partner_id` | `text` | FK → `exercises.id` (nullable) |
| `is_completed` | `integer` (boolean) | Required; tracks whether the exercise was finished in a session |
| `order` | `integer` | Display order within the workout |

#### `sets`
Defines the intended configuration for a set in a workout template.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` (UUID) | Primary key |
| `exercise_id` | `text` | FK → `exercises.id` |
| `set_type` | `text` | Enum string. Built-in values below; free string for custom types |
| `config` | `text` (JSON) | Type-specific configuration (see Set Types section below) |
| `order` | `integer` | Display order within the exercise |

**Built-in `set_type` values:**
- `straight` — Standard sets with reps and weight
- `amrap` — As many reps as possible; no rep target
- `drop_set` — Multiple weight drops in one set; `config` holds drop stages
- `myo_match` — Rest-pause / myo-reps style
- `cluster` — Mini-sets within one set with intra-set rest
- `time_based` — Duration instead of reps (e.g. planks, wall sits)
- `partial` — Partial range of motion; config notes the range
- `failure` — Work to muscular failure; no predetermined rep target
- `custom` — Any user-defined type; `set_type` holds the custom name

**`config` JSON structure examples:**

```jsonc
// straight
{ "target_reps": 8, "target_reps_max": 12, "target_weight": 100, "weight_unit": "kg" }

// amrap
{ "target_weight": 80, "weight_unit": "kg" }

// time_based
{ "duration_seconds": 60 }

// drop_set
{ "stages": [{ "weight": 100 }, { "weight": 80 }, { "weight": 60 }], "weight_unit": "kg" }

// custom
{ "description": "User-defined set type description", "raw_config": "anything the user wants to note" }
```

#### `set_logs`
Actual recorded performance for a completed set in a session.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` (UUID) | Primary key |
| `set_id` | `text` | FK → `sets.id` (the template set this log is for) |
| `session_id` | `text` | FK → `workout_sessions.id` |
| `actual_reps` | `integer` | Nullable for non-rep types |
| `actual_weight` | `real` | Nullable for bodyweight or time-based |
| `actual_duration_seconds` | `integer` | For time-based sets |
| `note` | `text` | Optional; personal notes for this specific logged set |
| `custom_data` | `text` (JSON) | For custom set types or any extra data that doesn't fit columns |
| `logged_at` | `integer` | Unix timestamp |

#### `workout_sessions`
Represents one completed (or in-progress) instance of a workout.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` (UUID) | Primary key |
| `workout_id` | `text` | FK → `workouts.id` |
| `started_at` | `integer` | Unix timestamp |
| `completed_at` | `integer` | Nullable; null if session is still active |
| `notes` | `text` | Optional session-level notes |

---

### Migrations

Migrations are written by hand as SQL strings in `src/db/migrations.ts` and executed on `SQLiteProvider.onInit`. SQLite's built-in `PRAGMA user_version` is used to track which migrations have already run — no external tooling required.

If the schema evolves to the point where diffing and auto-generating migration SQL becomes necessary, **Drizzle ORM + drizzle-kit** is the recommended tool to add at that point. For now, hand-written migrations are simple enough and keep the dependency count low.

**Migration runner pattern (simplified):**
```ts
async function runMigrations(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(migration_0001_sql);
    await db.execAsync('PRAGMA user_version = 1');
  }
  // Future: if (currentVersion < 2) { ... }
}
```

---

## State Architecture (Zustand)

Zustand v4 is used for all client-side state that needs to be shared across screens. Database state (persisted data) lives in SQLite and is accessed via the query helpers in `src/db/queries/` inside hooks. Zustand manages **session-level UI state** and **transient app state** that does not need to be persisted.

### Store Slices

| Slice | Location | Responsibilities |
|---|---|---|
| `programsSlice` | `features/programs/store.ts` | Currently selected program, active cycle/day position, navigation context |
| `workoutSlice` | `features/workouts/store.ts` | Live active session state: which sets have been logged, timer, in-progress set values |
| `exercisesSlice` | `features/exercises/store.ts` | Recent exercises, search query, autocomplete state |
| `settingsSlice` | `features/settings/store.ts` | User preferences (weight unit, dark mode override, etc.) |

All slices are combined in `src/store/index.ts`.

**Rule:** Zustand does not own data that is already in SQLite. Hooks in `src/features/*/hooks/` are responsible for reading from the database. Zustand only holds state that is ephemeral, UI-driven, or needs to survive screen transitions within a single app session.

---

## Navigation Structure

> **TBD.** The navigation structure (tabs, stacks, modals) will be defined once the UI/UX design is settled. The infrastructure — Expo Router v6 file-based routing with a `(tabs)` shell — is in place. Specific routes and drill-down flows will be added as screens are designed.

---

## Calculations Service

`src/services/calculations.ts` contains all stat and trend computations as **pure functions** — no database access, no side effects. Hooks in `src/features/reporting/hooks/` call these functions with data fetched from SQLite.

### 1RM (Epley Formula)

$$1RM = w \times \left(1 + \frac{r}{30}\right)$$

Where $w$ is weight and $r$ is reps performed.

### 10RM (from 1RM)

$$10RM = \frac{1RM}{1 + \frac{10}{30}} = \frac{1RM}{1.33}$$

### Volume

$$\text{Volume} = \sum_{i} (w_i \times r_i)$$

Per session, per week, or per program cycle as needed.

### Muscle Group Set Volume

When calculating sets worked per muscle group, the weighting from `affected_muscles` is applied:

$$\text{Sets Worked}_{muscle} = \sum_{i} \left( \text{sets}_i \times \text{weight}_{role} \right)$$

Where $\text{weight}_{role}$ is 1.0 for primary, 0.5 for secondary, and 0.25 for tertiary.

---

## Import / Export

`src/services/importExport.ts` serializes the entire database into a structured JSON document and can restore from one. This serves two purposes:

1. **User backup and restore** — available from the Settings screen.
2. **Cloud sync payload** — the JSON format is designed to be the data contract for a future sync backend. Each entity includes its UUID, so upsert-based sync is possible without complex reconciliation.

The export format is a single JSON object with top-level keys per entity type (e.g. `programs`, `exercise_definitions`, `workout_sessions`, etc.).

---

## Cloud Sync Upgrade Path

No backend is built at launch. When cloud sync becomes a requirement, the recommended upgrade path is:

1. **Turso (libSQL):** expo-sqlite v2 supports `useLibSQL: true`, which replaces the local SQLite file with a Turso remote database. The raw SQL queries in `src/db/queries/` are **unchanged**. This is the lowest-friction sync path.
2. **Import/Export as sync payload:** The existing JSON serialization format in `importExport.ts` serves as the basis for a push/pull sync protocol if a custom backend is preferred.
3. **Authentication:** Add Clerk or Supabase Auth as a separate layer; no core app code needs to change for auth to be added since it sits above the data layer.

---

## Local QA & Build Workflow

### Daily Development
```bash
# Android — Expo Go on device (primary daily workflow)
npx expo start

# Web — runs in the browser on the development machine
npx expo start --web
```

**Expo Go note:** expo-sqlite is included in Expo Go, so local database functionality works without a custom build. If NativeWind styling looks degraded on device (CSS variables), switch to a development build via `npx expo run:android` — this compiles the full app directly to the device with no EAS cloud build required.

### Distribution Builds (Future)
EAS Build will be configured when a distributable APK or iOS build is needed. Not required during the foundation and feature development phases.

### Quality Gates
- **TypeScript strict mode** — primary quality gate; catches structural and type errors at compile time
- **ESLint + Prettier** — enforces code consistency and catches common React/React Native anti-patterns
- No formal automated test suite at launch; TypeScript strict + manual device testing is the initial QA strategy. A test layer (Jest + React Native Testing Library) can be added incrementally per feature without restructuring the codebase.

---

## Implementation Phases

### Phase 1 — Foundation
- Initialize Expo project with TypeScript template
- Configure Expo Router with `(tabs)` shell and route structure
- Configure NativeWind v4 (`metro.config.js`, global CSS in `app/_layout.tsx`)
- Set up ESLint, Prettier, TypeScript strict
- Install expo-sqlite v2
- Define initial TypeScript entity types in `src/db/types.ts`
- Write Migration v1 SQL and migration runner in `src/db/migrations.ts`
- Set up Zustand root store with empty feature slices

### Phase 2 — Program Builder
- Program CRUD (create, edit, delete, list)
- Mesocycle + Cycle builder
- Day builder and sequence management
- Workout and Exercise template builder within a day
- Set template builder with type selector and config

### Phase 3 — Active Session
- Session tracking data layer and Zustand session slice
- Session start/complete/abandon logic
- Exercise autocomplete from `exercise_definitions`
- Screen layout and set logging interaction model TBD

### Phase 4 — Exercise Library
- ExerciseDefinition CRUD
- Affected muscles editor
- Search and filter

### Phase 5 - UI/UX Refinement & Polish
- App theme settings (light/dark/system)
- App animations & fluid UI polishing
- App preferences (weight unit, theme)
- Responsive layout polish for web/tablet
    - Identifying best practices for mobile vs web, and breaking out components into constituent components while allowing for the same functionality. 

### Phase 6 — Reporting
- 1RM and 10RM calculations per exercise
- Volume over time per muscle group
- Program-level stats and PR detection
- Session history
- Chart/visualization library TBD
- Export utility (to allow use of data out-of-app, or save backups) TBD
    - Potential auto-export to locations (such as google sheets)
- JSON backup export and import/restore

### Phase 7 - Utility and QoL
- Weight tracking as flat numbers vs calculated "plates" (To allow for simpler calculation of what to load on a bar)

