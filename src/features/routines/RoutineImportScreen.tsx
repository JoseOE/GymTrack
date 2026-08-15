import { CameraView, type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';

import { Card, IconButton, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionTitle } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { SharedRoutineImportPreparation } from '@/domain/models';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';
import { decodeSharedRoutine } from '@/services/sharedRoutineService';
import { formatDuration } from '@/utils/duration';

export function RoutineImportScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { acceptRoutine, activeTrainingLocation, prepareImportedRoutine } = useGymTrack();
  const { showToast } = useFeedback();
  const scanLock = useRef(false);
  const [scanning, setScanning] = useState(true);
  const [working, setWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preparation, setPreparation] = useState<SharedRoutineImportPreparation | null>(null);

  const askForPermission = async () => {
    try {
      await requestPermission();
    } catch {
      showToast({ type: 'error', title: 'No se pudo solicitar permiso', message: 'Revisa la configuración de cámara de Android e inténtalo nuevamente.' });
    }
  };

  const handleBarcode = async ({ data }: BarcodeScanningResult) => {
    if (scanLock.current) return;
    scanLock.current = true;
    setScanning(false);
    setWorking(true);
    setErrorMessage(null);
    const decoded = decodeSharedRoutine(data);
    if (decoded.status === 'unsupported-version') {
      setErrorMessage('Esta rutina fue creada con una versión de GymTrack que todavía no es compatible.');
      setWorking(false);
      return;
    }
    if (decoded.status === 'invalid') {
      setErrorMessage('Este código no contiene una rutina compatible con GymTrack.');
      setWorking(false);
      return;
    }
    try {
      const nextPreparation = await prepareImportedRoutine(decoded.payload);
      setPreparation(nextPreparation);
      if (nextPreparation.status === 'missing-exercises') {
        setErrorMessage(`No pudimos encontrar todos los ejercicios de esta rutina. Faltan ${nextPreparation.missingExerciseCount}.`);
      }
    } catch (reason) {
      setErrorMessage(reason instanceof Error ? reason.message : 'No pudimos preparar esta rutina.');
    } finally {
      setWorking(false);
    }
  };
  const retry = () => {
    scanLock.current = false;
    setPreparation(null);
    setErrorMessage(null);
    setScanning(true);
  };
  const save = async () => {
    if (preparation?.status !== 'ready') return;
    setWorking(true);
    try {
      await acceptRoutine(preparation.preview);
      showToast({ type: 'success', title: 'Rutina importada', message: 'Quedó lista para iniciar como tu siguiente entrenamiento.' });
      router.replace('/coach');
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo guardar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });
    } finally {
      setWorking(false);
    }
  };

  return <Screen>
    <ScreenHeader title="Importar rutina" subtitle={`Escáner QR · ${activeTrainingLocation?.name ?? 'sin ubicación activa'}`} action={<IconButton icon="close" label="Cancelar importación y volver al Coach" onPress={() => router.replace('/coach')} />} />
    {!permission ? <View style={styles.loading}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.muted}>Comprobando permiso de cámara…</Text></View> : !permission.granted ? <PermissionCard canAskAgain={permission.canAskAgain} onRequest={() => void askForPermission()} /> : preparation?.status === 'ready' ? <ImportPreview preparation={preparation} saving={working} onSave={() => void save()} /> : <>
      {scanning ? <Card style={styles.cameraCard}><CameraView barcodeScannerSettings={{ barcodeTypes: ['qr'] }} facing="back" onBarcodeScanned={scanning ? (result) => void handleBarcode(result) : undefined} style={styles.camera} /><Text style={styles.help}>Apunta al código QR completo. GymTrack pausará el escáner al detectar una rutina.</Text></Card> : null}
      {working ? <View style={styles.loading}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.muted}>Validando rutina…</Text></View> : null}
      {errorMessage ? <Card style={styles.errorCard}><Text style={styles.errorTitle}>No pudimos importar el código</Text><Text style={styles.warning}>{errorMessage}</Text><SecondaryButton icon="scan-outline" title="Intentar de nuevo" onPress={retry} /></Card> : null}
    </>}
  </Screen>;
}

function PermissionCard({ canAskAgain, onRequest }: { canAskAgain: boolean; onRequest: () => void }) {
  return <Card style={styles.permissionCard}><Text style={styles.cardTitle}>Permiso de cámara</Text><Text style={styles.muted}>GymTrack usa la cámara únicamente para leer códigos QR de rutinas. No toma ni envía fotografías.</Text>{canAskAgain ? <PrimaryButton icon="camera-outline" title="Permitir cámara" onPress={onRequest} /> : <><Text style={styles.warning}>El permiso está desactivado. Puedes habilitarlo desde la configuración de Android.</Text><SecondaryButton icon="settings-outline" title="Abrir configuración" onPress={() => void Linking.openSettings()} /></>}</Card>;
}

function ImportPreview({ preparation, saving, onSave }: { preparation: Extract<SharedRoutineImportPreparation, { status: 'ready' }>; saving: boolean; onSave: () => void }) {
  const { preview, unavailableEquipmentCount } = preparation;
  return <View style={styles.section}><SectionTitle detail="QR V1">Rutina compartida</SectionTitle><Card style={styles.previewCard}><Text style={styles.cardTitle}>{preview.name}</Text><Text style={styles.meta}>{preview.exercises.length} ejercicios · ≈ {formatDuration(preview.estimatedDurationMinutes)}</Text><Text style={styles.meta}>Ubicación activa · {preview.locationName}</Text>{unavailableEquipmentCount > 0 ? <Text style={styles.warning}>{unavailableEquipmentCount} {unavailableEquipmentCount === 1 ? 'ejercicio utiliza' : 'ejercicios utilizan'} equipo que no tienes disponible en {preview.locationName}. Puedes guardar la rutina de todos modos.</Text> : <Text style={styles.success}>Todos los ejercicios son compatibles con tu equipo actual.</Text>}{preview.exercises.map((exercise, index) => <View key={exercise.exerciseId} style={styles.exerciseRow}><Text style={styles.number}>{index + 1}</Text><View style={styles.flex}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.muted}>{exercise.muscle}</Text></View></View>)}<PrimaryButton icon="save-outline" loading={saving} title="Guardar rutina" onPress={onSave} /></Card></View>;
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  loading: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  cameraCard: { gap: spacing.md, padding: spacing.md },
  camera: { height: 420, borderRadius: radii.md, overflow: 'hidden' },
  help: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  permissionCard: { gap: spacing.lg },
  errorCard: { gap: spacing.lg },
  previewCard: { gap: spacing.md },
  cardTitle: { ...typography.heading, color: colors.text },
  errorTitle: { ...typography.heading, color: colors.warning },
  meta: { ...typography.body, color: colors.textMuted },
  muted: { ...typography.caption, color: colors.textMuted },
  warning: { ...typography.caption, color: colors.warning },
  success: { ...typography.caption, color: colors.success },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 48 },
  number: { ...typography.label, color: colors.primary, width: 24 },
  flex: { flex: 1 },
  exerciseName: { ...typography.body, color: colors.text, fontWeight: '700' },
});
