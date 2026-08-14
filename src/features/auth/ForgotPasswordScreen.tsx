import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card, PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { AuthField, AuthShell } from '@/features/auth/AuthShell';
import { useAuth } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const { showToast } = useFeedback();
  const [email, setEmail] = useState('');
  const [working, setWorking] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async () => {
    if (!emailPattern.test(email.trim())) { showToast({ type: 'warning', title: 'Correo no válido' }); return; }
    setWorking(true);
    try { await resetPassword(email); setSent(true); }
    catch (reason) { showToast({ type: 'error', title: 'No se pudo enviar el enlace', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); }
    finally { setWorking(false); }
  };
  return <AuthShell title="Recuperar contraseña" subtitle="Supabase enviará un enlace seguro al correo de tu cuenta.">{sent ? <Card style={styles.sent}><Text style={styles.sentTitle}>Enlace enviado</Text><Text style={styles.sentText}>Si existe una cuenta con ese correo, recibirás instrucciones. El cambio de contraseña se realiza mediante el flujo seguro configurado en Supabase.</Text></Card> : <AuthField autoComplete="email" keyboardType="email-address" label="Correo" onChangeText={setEmail} value={email} />}{!sent ? <PrimaryButton icon="mail-outline" loading={working} title="Enviar enlace" onPress={() => void submit()} /> : null}<SecondaryButton icon="arrow-back" title="Volver a iniciar sesión" onPress={() => router.replace('/login')} /></AuthShell>;
}

const styles = StyleSheet.create({ sent: { gap: spacing.sm, backgroundColor: colors.primarySoft }, sentTitle: { ...typography.heading, color: colors.primary }, sentText: { ...typography.body, color: colors.textMuted } });
