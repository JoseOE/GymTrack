import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { DATABASE_NAME, initializeDatabase } from '@/database/db';
import { FeedbackProvider } from '@/providers/FeedbackProvider';
import { GymTrackProvider } from '@/providers/GymTrackProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
        <FeedbackProvider>
          <GymTrackProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background }, headerShown: false }} />
          </GymTrackProvider>
        </FeedbackProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
