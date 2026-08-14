import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Card, PrimaryButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { AuthField, AuthShell } from '@/features/auth/AuthShell';
import { usePostAuthDestination } from '@/hooks/usePostAuthDestination';
import { useAuth } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';

export function ResetPasswordScreen() {
  const { authDeepLink, passwordRecovery, updateRecoveredPassword } = useAuth();
  const destination = usePostAuthDestination();
  const { showToast } = useFeedback();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [working, setWorking] = useState(false);
  const processing = authDeepLink.purpose === 'recovery' && authDeepLink.status === 'processing';
  useEffect(() => {
    if (!processing && !passwordRecovery) router.replace(destination);
  }, [destination, passwordRecovery, processing]);
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
  if (processing) return <AuthShell title="Recuperar contraseña" subtitle="Validando el enlace con Supabase."><Card style={styles.status}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.message}>Preparando el cambio seguro…</Text></Card></AuthShell>;
  if (!passwordRecovery) return <AuthShell title="Continuando" subtitle="Esta pantalla solo se usa durante una recuperación activa."><Card style={styles.status}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.message}>Recuperando el estado actual de tu cuenta…</Text></Card></AuthShell>;
  return <AuthShell title="Nueva contraseña" subtitle="La nueva contraseña se enviará únicamente a Supabase Auth."><AuthField autoComplete="new-password" label="Nueva contraseña" onChangeText={setPassword} secureTextEntry value={password} /><AuthField autoComplete="new-password" label="Confirmar contraseña" onChangeText={setConfirmation} secureTextEntry value={confirmation} /><PrimaryButton icon="checkmark-circle-outline" loading={working} title="Actualizar contraseña" onPress={() => void submit()} /></AuthShell>;
}

const styles = StyleSheet.create({ status: { alignItems: 'center', gap: spacing.md }, message: { ...typography.body, color: colors.textMuted, textAlign: 'center' } });
