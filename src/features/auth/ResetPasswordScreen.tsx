import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { AuthField, AuthShell } from '@/features/auth/AuthShell';
import { usePostAuthDestination } from '@/hooks/usePostAuthDestination';
import { useAuth } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';

export function ResetPasswordScreen() {
  const { authDeepLink, authLinkInitialized, isAuthenticated, passwordRecovery, signOut, updateRecoveredPassword } = useAuth();
  const destination = usePostAuthDestination();
  const { showToast } = useFeedback();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [working, setWorking] = useState(false);
  const [leaving, setLeaving] = useState<'request' | 'login' | null>(null);
  const processing = authDeepLink.purpose === 'recovery' && authDeepLink.status === 'processing';
  const submit = async () => {
    if (password.length < 8) { showToast({ type: 'warning', title: 'Contraseña muy corta', message: 'Usa al menos 8 caracteres.' }); return; }
    if (password !== confirmation) { showToast({ type: 'warning', title: 'Las contraseñas no coinciden' }); return; }
    setWorking(true);
    try {
      await updateRecoveredPassword(password);
      showToast({ type: 'success', title: 'Contraseña actualizada' });
      router.replace(destination);
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo actualizar', message: reason instanceof Error ? reason.message : 'Solicita un enlace nuevo.' });
    } finally { setWorking(false); }
  };
  const leaveRecovery = async (target: '/forgot-password' | '/login', action: 'request' | 'login') => {
    setLeaving(action);
    try {
      if (isAuthenticated) await signOut();
      router.replace(target);
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo continuar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });
      setLeaving(null);
    }
  };
  if (processing) return <RecoveryStatus message="Validando el enlace…" subtitle="Estamos verificando que todavía sea válido." />;
  if (passwordRecovery) return <AuthShell title="Nueva contraseña" subtitle="La nueva contraseña se enviará únicamente a Supabase Auth."><AuthField autoComplete="new-password" label="Nueva contraseña" onChangeText={setPassword} secureTextEntry value={password} /><AuthField autoComplete="new-password" label="Confirmar contraseña" onChangeText={setConfirmation} secureTextEntry value={confirmation} /><PrimaryButton icon="checkmark-circle-outline" loading={working} title="Actualizar contraseña" onPress={() => void submit()} /></AuthShell>;
  if (!authLinkInitialized) return <RecoveryStatus message="Preparando recuperación…" subtitle="Estamos comprobando el enlace que abrió GymTrack." />;
  return <AuthShell title="Enlace no válido" subtitle="Este enlace de recuperación ya no es válido."><Card style={styles.invalidCard}><Text style={styles.invalidTitle}>Solicita uno nuevo para cambiar tu contraseña.</Text><Text style={styles.message}>Los enlaces de recuperación son de un solo uso y también pueden expirar.</Text></Card><View style={styles.actions}><PrimaryButton disabled={leaving !== null} icon="mail-outline" loading={leaving === 'request'} title="Solicitar otro enlace" onPress={() => void leaveRecovery('/forgot-password', 'request')} /><SecondaryButton disabled={leaving !== null} icon="log-in-outline" loading={leaving === 'login'} title="Ir a iniciar sesión" onPress={() => void leaveRecovery('/login', 'login')} /></View></AuthShell>;
}

function RecoveryStatus({ message, subtitle }: { message: string; subtitle: string }) {
  return <AuthShell title="Recuperar contraseña" subtitle={subtitle}><Card style={styles.status}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.message}>{message}</Text></Card></AuthShell>;
}

const styles = StyleSheet.create({
  status: { alignItems: 'center', gap: spacing.md },
  message: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  invalidCard: { alignItems: 'center', gap: spacing.sm },
  invalidTitle: { ...typography.heading, color: colors.text, textAlign: 'center' },
  actions: { gap: spacing.md },
});
