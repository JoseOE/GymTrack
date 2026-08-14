import { SplashScreen, Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/constants/theme';
import { DATABASE_NAME, initializeDatabase } from '@/database/db';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { FeedbackProvider } from '@/providers/FeedbackProvider';
import { GymTrackProvider, useGymTrack } from '@/providers/GymTrackProvider';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  return <SafeAreaProvider><SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}><AuthProvider><FeedbackProvider><GymTrackProvider><StatusBar style="light" /><RootNavigator /></GymTrackProvider></FeedbackProvider></AuthProvider></SQLiteProvider></SafeAreaProvider>;
}

function RootNavigator() {
  const auth = useAuth();
  const local = useGymTrack();
  const resolving = auth.loading || (auth.isAuthenticated && local.loading);
  useEffect(() => { if (!resolving) void SplashScreen.hideAsync(); }, [resolving]);
  if (resolving) return <View style={styles.loading}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.loadingText}>Preparando GymTrack…</Text></View>;

  const hasAccountError = auth.isAuthenticated && !auth.accountProfile;
  const hasLocalError = auth.isAuthenticated && Boolean(auth.accountProfile) && !local.legacyMigrationRequired && !local.localReady;
  const needsOnboarding = auth.isAuthenticated && Boolean(auth.accountProfile) && local.localReady && !auth.accountProfile?.onboardingCompleted;
  const canUseApp = auth.isAuthenticated && Boolean(auth.accountProfile?.onboardingCompleted) && local.localReady;

  return <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background }, headerShown: false }}>
    <Stack.Screen name="auth/callback" />
    <Stack.Screen name="reset-password" />
    <Stack.Protected guard={!auth.isAuthenticated}><Stack.Screen name="(auth)" /></Stack.Protected>
    <Stack.Protected guard={hasAccountError}><Stack.Screen name="account-error" /></Stack.Protected>
    <Stack.Protected guard={auth.isAuthenticated && Boolean(auth.accountProfile) && local.legacyMigrationRequired}><Stack.Screen name="legacy-data" /></Stack.Protected>
    <Stack.Protected guard={hasLocalError}><Stack.Screen name="local-data-error" /></Stack.Protected>
    <Stack.Protected guard={needsOnboarding}><Stack.Screen name="onboarding" /><Stack.Screen name="onboarding-weekly-plan" /></Stack.Protected>
    <Stack.Protected guard={canUseApp}><Stack.Screen name="(tabs)" /><Stack.Screen name="profile" /><Stack.Screen name="weekly-plan" /></Stack.Protected>
  </Stack>;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, backgroundColor: colors.background }, loadingText: { ...typography.body, color: colors.textMuted } });
