import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Card, IconButton, PrimaryButton, Screen, ScreenHeader, SectionTitle } from '@/components/ui';
import { colors } from '@/constants/theme';
import { getEquipmentDetails, setEquipmentEnabled } from '@/database/repositories/equipmentRepository';
import type { EquipmentDetails, EquipmentType } from '@/domain/models';
import { useAuth } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';

import { equipmentStyles as styles } from './equipmentStyles';

const typeLabels: Record<EquipmentType, string> = {
  free_weight: 'Peso libre', machine: 'Máquina', cable: 'Polea', bench: 'Banco', rack: 'Rack',
  bodyweight: 'Peso corporal', cardio: 'Cardio', accessory: 'Accesorio', other: 'Otro',
};

export function EquipmentDetailScreen() {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const { activeTrainingLocation, refresh } = useGymTrack();
  const { showToast } = useFeedback();
  const params = useLocalSearchParams<{ equipmentId: string }>();
  const equipmentId = Array.isArray(params.equipmentId) ? params.equipmentId[0] : params.equipmentId;
  const [details, setDetails] = useState<EquipmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    if (!user || !activeTrainingLocation || !equipmentId) { setLoading(false); return; }
    setLoading(true);
    try { setDetails(await getEquipmentDetails(db, user.id, activeTrainingLocation.id, equipmentId)); }
    finally { setLoading(false); }
  }, [activeTrainingLocation, db, equipmentId, user]);
  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);
  const toggle = async () => {
    if (!details || !user || !activeTrainingLocation) return;
    setWorking(true);
    try {
      await setEquipmentEnabled(db, user.id, activeTrainingLocation.id, details.id, !details.enabled);
      await load();
      await refresh();
      showToast({ type: 'success', title: details.enabled ? 'Equipo quitado' : 'Equipo agregado', message: `${details.name} se actualizó en ${activeTrainingLocation.name}.` });
    } catch (reason) { showToast({ type: 'error', title: 'No se pudo actualizar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); }
    finally { setWorking(false); }
  };

  return <Screen><ScreenHeader title="Detalle de equipo" subtitle={activeTrainingLocation?.name ?? 'Ubicación no disponible'} action={<IconButton icon="close" label="Cerrar detalle y volver a Mi gimnasio" onPress={() => router.replace('/equipment')} />} />{loading ? <ActivityIndicator color={colors.primary} size="large" /> : !details ? <Card><Text style={styles.empty}>Este equipo ya no está disponible en el catálogo.</Text></Card> : <><Card style={styles.card}><View style={styles.row}><Ionicons color={details.enabled ? colors.success : colors.textMuted} name={details.enabled ? 'checkmark-circle' : 'barbell-outline'} size={26} /><View style={styles.flex}><Text style={styles.title}>{details.name}</Text><Text style={details.enabled ? styles.success : styles.caption}>{details.enabled ? `Disponible en ${activeTrainingLocation?.name}` : 'No disponible'}</Text></View></View><Text style={styles.body}>{details.description}</Text><View style={styles.divider} /><Text style={styles.caption}>Categoría · {details.category}</Text><Text style={styles.caption}>Tipo · {typeLabels[details.equipmentType]}</Text><Text style={styles.caption}>Catálogo · v{details.catalogVersion}</Text>{details.aliases.length ? <Text style={styles.subtle}>También se encuentra como: {details.aliases.join(', ')}</Text> : null}<PrimaryButton title={details.enabled ? 'Quitar de mi gimnasio' : 'Agregar a mi gimnasio'} icon={details.enabled ? 'remove-circle-outline' : 'add-circle-outline'} loading={working} onPress={() => void toggle()} /></Card><View style={styles.section}><SectionTitle detail={`${details.exercises.length}`}>Ejercicios compatibles</SectionTitle>{details.exercises.length ? details.exercises.map((exercise) => <Card key={exercise.id} style={styles.card}><Text style={styles.title}>{exercise.name}</Text><Text style={styles.caption}>{exercise.muscle}</Text></Card>) : <Text style={styles.empty}>Todavía no hay ejercicios asociados.</Text>}</View></>}</Screen>;
}
