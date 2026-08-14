import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { AuthField, AuthShell } from '@/features/auth/AuthShell';
import { useAuth } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterScreen() {
  const { resendSignUpConfirmation, signUp } = useAuth();
  const { showToast } = useFeedback();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [working, setWorking] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [resending, setResending] = useState(false);
  const submit = async () => {
    if (!name.trim()) { showToast({ type: 'warning', title: 'Escribe tu nombre' }); return; }
    if (!emailPattern.test(email.trim())) { showToast({ type: 'warning', title: 'Correo no válido', message: 'Escribe un correo completo.' }); return; }
    if (password.length < 8) { showToast({ type: 'warning', title: 'Contraseña muy corta', message: 'Usa al menos 8 caracteres.' }); return; }
    if (password !== confirmation) { showToast({ type: 'warning', title: 'Las contraseñas no coinciden' }); return; }
    setWorking(true);
    try {
      const result = await signUp({ displayName: name, email, password });
      if (result.requiresEmailConfirmation) setCheckEmail(true);
      else showToast({ type: 'success', title: 'Cuenta creada', message: 'Ahora completa tu perfil de entrenamiento.' });
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo crear la cuenta', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });
    } finally { setWorking(false); }
  };
  const resend = async () => {
    setResending(true);
    try {
      await resendSignUpConfirmation(email);
      showToast({ type: 'success', title: 'Correo reenviado', message: 'Revisa tu bandeja de entrada y la carpeta de spam.' });
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo reenviar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });
    } finally { setResending(false); }
  };
  if (checkEmail) return <AuthShell title="Revisa tu correo" subtitle="Tu cuenta fue creada, pero todavía no hay una sesión activa."><Card style={styles.confirmation}><Text style={styles.confirmationTitle}>Confirma tu cuenta</Text><Text style={styles.confirmationText}>Abre el mensaje enviado a {email.trim().toLowerCase()} y confirma tu correo. Después vuelve a GymTrack e inicia sesión.</Text></Card><PrimaryButton icon="refresh" loading={resending} title="Reenviar correo" onPress={() => void resend()} /><SecondaryButton icon="log-in-outline" title="Ir a iniciar sesión" onPress={() => router.replace('/login')} /><SecondaryButton icon="arrow-back" title="Volver al inicio" onPress={() => router.replace('/welcome')} /></AuthShell>;
  return <AuthShell title="Crear cuenta" subtitle="Tu contraseña se envía únicamente a Supabase Auth; GymTrack no la guarda localmente."><AuthField autoCapitalize="words" autoComplete="name" label="Nombre" onChangeText={setName} value={name} /><AuthField autoComplete="email" keyboardType="email-address" label="Correo" onChangeText={setEmail} value={email} /><AuthField autoComplete="new-password" label="Contraseña" onChangeText={setPassword} secureTextEntry value={password} /><AuthField autoComplete="new-password" label="Confirmar contraseña" onChangeText={setConfirmation} secureTextEntry value={confirmation} /><PrimaryButton icon="person-add-outline" loading={working} title="Crear cuenta" onPress={() => void submit()} /><View style={styles.accountPrompt}><Text style={styles.accountPromptText}>¿Ya tienes una cuenta?</Text><SecondaryButton icon="log-in-outline" title="Iniciar sesión" onPress={() => router.replace('/login')} /></View><SecondaryButton icon="arrow-back" title="Volver al inicio" onPress={() => router.replace('/welcome')} /></AuthShell>;
}

const styles = StyleSheet.create({ confirmation: { gap: spacing.sm, backgroundColor: colors.primarySoft }, confirmationTitle: { ...typography.heading, color: colors.primary }, confirmationText: { ...typography.body, color: colors.textMuted }, accountPrompt: { gap: spacing.sm, marginTop: spacing.sm }, accountPromptText: { ...typography.body, color: colors.textMuted, textAlign: 'center' } });
