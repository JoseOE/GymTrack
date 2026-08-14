import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Card, PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { AuthShell } from '@/features/auth/AuthShell';
import { usePostAuthDestination } from '@/hooks/usePostAuthDestination';
import { useAuth } from '@/providers/AuthProvider';

export function AuthCallbackScreen() {
  const { authDeepLink, isAuthenticated, user } = useAuth();
  const destination = usePostAuthDestination();
  const confirmedSession = isAuthenticated && Boolean(user?.email_confirmed_at);
  const confirmedFallback = authDeepLink.status === 'error' && confirmedSession;
  const signupSuccess = authDeepLink.status === 'success' && authDeepLink.purpose === 'signup';
  const canContinue = signupSuccess || confirmedFallback;

  useEffect(() => {
    if (authDeepLink.status === 'idle') {
      router.replace(destination);
      return;
    }
    if (!canContinue) return;
    const timer = setTimeout(() => router.replace(destination), 1800);
    return () => clearTimeout(timer);
  }, [authDeepLink.status, canContinue, destination]);

  if (authDeepLink.status === 'idle') {
    return <AuthShell title="Continuando" subtitle="Recuperando el estado actual de tu cuenta."><Card style={styles.card}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.message}>Preparando GymTrack…</Text></Card></AuthShell>;
  }

  if (authDeepLink.status === 'processing') {
    return <AuthShell title="Confirmación de correo" subtitle="GymTrack valida el código de forma segura con Supabase."><Card style={styles.card}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.title}>Confirmando tu correo…</Text><Text style={styles.message}>Espera un momento.</Text></Card></AuthShell>;
  }

  if (canContinue) {
    const alreadyConfirmed = authDeepLink.outcome === 'already-confirmed' || confirmedFallback;
    const message = confirmedFallback
      ? 'Este enlace ya fue utilizado o expiró, pero tu cuenta está confirmada.'
      : authDeepLink.message ?? 'Tu correo quedó confirmado correctamente.';
    return <AuthShell title="Confirmación de correo" subtitle="Tu cuenta está lista para continuar."><Card style={styles.card}><Text style={styles.title}>{alreadyConfirmed ? 'Tu correo ya está confirmado' : 'Correo confirmado'}</Text><Text style={styles.message}>{message}</Text></Card><PrimaryButton icon="arrow-forward" title="Continuar" onPress={() => router.replace(destination)} /></AuthShell>;
  }

  return <AuthShell title="Confirmación de correo" subtitle="GymTrack valida el código de forma segura con Supabase.">
    <Card style={styles.card}>
      <Text style={[styles.title, styles.error]}>No pudimos validar este enlace</Text>
      <Text style={styles.message}>{authDeepLink.message ?? 'Abre el enlace completo recibido por correo.'}</Text>
    </Card>
    {isAuthenticated
      ? <PrimaryButton icon="arrow-forward" title="Continuar" onPress={() => router.replace(destination)} />
      : <SecondaryButton icon="log-in-outline" title="Ir a iniciar sesión" onPress={() => router.replace('/login')} />}
  </AuthShell>;
}

const styles = StyleSheet.create({ card: { alignItems: 'center', gap: spacing.md }, title: { ...typography.heading, color: colors.primary, textAlign: 'center' }, error: { color: colors.danger }, message: { ...typography.body, color: colors.textMuted, textAlign: 'center' } });
