import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { AuthField, AuthShell } from '@/features/auth/AuthShell';
import { useAuth } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen() {
  const { signIn } = useAuth();
  const { showToast } = useFeedback();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [working, setWorking] = useState(false);
  const submit = async () => {
    if (!emailPattern.test(email.trim())) { showToast({ type: 'warning', title: 'Correo no válido', message: 'Escribe un correo completo.' }); return; }
    if (!password) { showToast({ type: 'warning', title: 'Falta la contraseña' }); return; }
    setWorking(true);
    try { await signIn(email, password); }
    catch (reason) { showToast({ type: 'error', title: 'No se pudo iniciar sesión', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); }
    finally { setWorking(false); }
  };
  return <AuthShell title="Iniciar sesión" subtitle="Recupera tus preferencias y datos locales de esta cuenta."><AuthField autoComplete="email" keyboardType="email-address" label="Correo" onChangeText={setEmail} value={email} /><AuthField autoComplete="current-password" label="Contraseña" onChangeText={setPassword} secureTextEntry value={password} /><Pressable accessibilityRole="button" onPress={() => router.push('/forgot-password')} style={({ pressed }) => pressed && styles.pressed}><Text style={styles.link}>¿Olvidaste tu contraseña?</Text></Pressable><PrimaryButton icon="log-in-outline" loading={working} title="Entrar" onPress={() => void submit()} /><View style={styles.accountPrompt}><Text style={styles.accountPromptText}>¿No tienes una cuenta?</Text><SecondaryButton icon="person-add-outline" title="Crear cuenta" onPress={() => router.replace('/register')} /></View><SecondaryButton icon="arrow-back" title="Volver al inicio" onPress={() => router.replace('/welcome')} /></AuthShell>;
}

const styles = StyleSheet.create({ link: { ...typography.body, color: colors.primary, textAlign: 'right', marginVertical: spacing.xs }, pressed: { opacity: 0.65 }, accountPrompt: { gap: spacing.sm, marginTop: spacing.sm }, accountPromptText: { ...typography.body, color: colors.textMuted, textAlign: 'center' } });
