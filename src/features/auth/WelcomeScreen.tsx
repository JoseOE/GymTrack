import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { AuthShell } from '@/features/auth/AuthShell';

export function WelcomeScreen() {
  return <AuthShell title="Tu entrenamiento. Tu progreso." subtitle="Una cuenta, tus datos locales y tu evolución en GymTrack."><Card style={styles.card}><Text style={styles.cardTitle}>Entrena con continuidad</Text><Text style={styles.cardText}>Tu cuenta identifica tus preferencias. Tus entrenamientos permanecen disponibles localmente y separados de otras cuentas del dispositivo.</Text></Card><View style={styles.actions}><PrimaryButton icon="person-add-outline" title="Crear cuenta" onPress={() => router.push('/register')} /><SecondaryButton icon="log-in-outline" title="Iniciar sesión" onPress={() => router.push('/login')} /></View></AuthShell>;
}

const styles = StyleSheet.create({ card: { gap: spacing.sm }, cardTitle: { ...typography.heading, color: colors.text }, cardText: { ...typography.body, color: colors.textMuted }, actions: { gap: spacing.md } });
