import { SQLiteProvider } from 'expo-sqlite';

import { runMigrations } from './migrations';

export { SQLiteProvider };
export { runMigrations };

export const DB_NAME = 'workout-tracker.db';
