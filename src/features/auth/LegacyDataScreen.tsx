import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card, PrimaryButton, Screen, ScreenHeader, SecondaryButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';

export function LegacyDataScreen() {
  const { linkLegacyWorkspace, startFreshWorkspace } = useGymTrack();
  const { showToast } = useFeedback();
  const [working, setWorking] = useState<'link' | 'fresh' | null>(null);
  const resolve = async (choice: 'link' | 'fresh') => {
    setWorking(choice);
    try {
      if (choice === 'link') await linkLegacyWorkspace();
      else await startFreshWorkspace();
      showToast({ type: 'success', title: choice === 'link' ? 'Datos vinculados' : 'Espacio nuevo preparado', message: choice === 'link' ? 'Tus datos locales ahora pertenecen a esta cuenta.' : 'Los datos anteriores quedaron archivados y no serán visibles.' });
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo continuar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });
    } finally { setWorking(null); }
  };
  return <Screen><ScreenHeader title="Encontramos datos locales de GymTrack" subtitle="Elige qué hacer antes de entrar a tu cuenta." /><Card style={styles.card}><Text style={styles.title}>Tus datos no se asignarán automáticamente</Text><Text style={styles.body}>Puedes vincular el perfil, plan, rutinas y entrenamientos existentes a esta cuenta. Si empiezas desde cero, permanecerán archivados en este dispositivo y otra cuenta no podrá verlos.</Text></Card><PrimaryButton icon="link-outline" loading={working === 'link'} title="Vincular a mi cuenta" onPress={() => void resolve('link')} /><SecondaryButton disabled={working !== null} icon="add-circle-outline" title="Empezar desde cero" onPress={() => void resolve('fresh')} /></Screen>;
}

const styles = StyleSheet.create({ card: { gap: spacing.sm, backgroundColor: colors.primarySoft }, title: { ...typography.heading, color: colors.primary }, body: { ...typography.body, color: colors.textMuted } });
