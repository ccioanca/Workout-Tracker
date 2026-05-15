import '../global.css';

import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';

import { DB_NAME, runMigrations } from '../src/db/client';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={runMigrations}>
      <Stack />
    </SQLiteProvider>
  );
}
