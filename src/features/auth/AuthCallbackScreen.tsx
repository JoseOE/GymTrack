import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Card, PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { AuthShell } from '@/features/auth/AuthShell';
import { useAuth } from '@/providers/AuthProvider';

export function AuthCallbackScreen() {
  const { authDeepLink, isAuthenticated } = useAuth();
  const working = authDeepLink.status === 'processing';
  const success = authDeepLink.status === 'success' && authDeepLink.purpose === 'signup';
  return <AuthShell title="Confirmación de correo" subtitle="GymTrack valida el código de forma segura con Supabase.">
    <Card style={styles.card}>
      {working ? <ActivityIndicator color={colors.primary} size="large" /> : null}
      <Text style={[styles.title, authDeepLink.status === 'error' && styles.error]}>{working ? 'Confirmando tu correo…' : success ? 'Correo confirmado' : 'No pudimos confirmar el correo'}</Text>
      <Text style={styles.message}>{working ? 'Espera un momento.' : authDeepLink.message ?? 'Abre el enlace completo recibido por correo.'}</Text>
    </Card>
    {success ? <PrimaryButton icon="arrow-forward" title="Continuar" onPress={() => router.replace(isAuthenticated ? '/' : '/login')} /> : null}
    {!working && !success ? <SecondaryButton icon="log-in-outline" title="Ir a iniciar sesión" onPress={() => router.replace('/login')} /> : null}
  </AuthShell>;
}

const styles = StyleSheet.create({ card: { alignItems: 'center', gap: spacing.md }, title: { ...typography.heading, color: colors.primary, textAlign: 'center' }, error: { color: colors.danger }, message: { ...typography.body, color: colors.textMuted, textAlign: 'center' } });
