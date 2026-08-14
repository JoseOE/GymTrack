import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { DATABASE_NAME, initializeDatabase } from '@/database/db';
import { GymTrackProvider } from '@/providers/GymTrackProvider';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
      <GymTrackProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background }, headerShown: false }} />
        </SafeAreaProvider>
      </GymTrackProvider>
    </SQLiteProvider>
  );
}
