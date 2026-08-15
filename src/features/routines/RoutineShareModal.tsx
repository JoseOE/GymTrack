import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, IconButton, ScreenHeader } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';

type Props = {
  visible: boolean;
  payload: string;
  routineName: string;
  exerciseCount: number;
  onClose: () => void;
};

export function RoutineShareModal({ visible, payload, routineName, exerciseCount, onClose }: Props) {
  return <Modal animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen" visible={visible}>
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Compartir rutina" subtitle="Local y sin cuenta compartida" action={<IconButton icon="close" label="Cerrar código QR" onPress={onClose} />} />
        <Card style={styles.card}>
          <Text style={styles.brand}>GymTrack</Text>
          <Text style={styles.name}>{routineName}</Text>
          <Text style={styles.meta}>{exerciseCount} ejercicios</Text>
          <View accessibilityLabel={`Código QR de la rutina ${routineName}`} style={styles.qrContainer}>{visible && payload ? <QRCode backgroundColor="#FFFFFF" color="#000000" size={260} value={payload} /> : null}</View>
          <Text style={styles.help}>Tu amigo puede escanear este código desde GymTrack.</Text>
          <Text style={styles.privacy}>El código contiene únicamente el nombre, los ejercicios ordenados y la duración indicada para Cardio.</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.huge, gap: spacing.xxl },
  card: { alignItems: 'center', gap: spacing.md },
  brand: { ...typography.display, color: colors.primary },
  name: { ...typography.title, color: colors.text, textAlign: 'center' },
  meta: { ...typography.body, color: colors.textMuted },
  qrContainer: { padding: spacing.lg, borderRadius: radii.lg, backgroundColor: '#FFFFFF', marginVertical: spacing.md },
  help: { ...typography.body, color: colors.text, textAlign: 'center' },
  privacy: { ...typography.caption, color: colors.textSubtle, textAlign: 'center' },
});
