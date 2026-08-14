import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { Card, IconButton, Screen, ScreenHeader, SecondaryButton } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useFeedback } from '@/providers/FeedbackProvider';

import { CustomEquipmentSection } from './CustomEquipmentSection';
import { EquipmentCatalogSection } from './EquipmentCatalogSection';
import { equipmentStyles as styles } from './equipmentStyles';
import { LocationManager } from './LocationManager';
import { useEquipmentInventory } from './useEquipmentInventory';

export function EquipmentScreen() {
  const inventory = useEquipmentInventory();
  const { showToast } = useFeedback();
  const showError = (reason: unknown) => showToast({ type: 'error', title: 'No se pudo actualizar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });

  return <Screen>
    <ScreenHeader title="Mi gimnasio" subtitle="Equipo disponible para tus próximas rutinas" action={<IconButton icon="close" label="Cerrar equipo" onPress={() => router.back()} />} />
    {inventory.loading && !inventory.activeLocation ? <View style={styles.section}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.empty}>Preparando tu inventario local…</Text></View> : <>
      <Card style={styles.card}><View style={styles.row}><Ionicons color={colors.primary} name="location" size={24} /><View style={styles.flex}><Text style={styles.title}>{inventory.activeLocation?.name ?? 'Sin ubicación'}</Text><Text style={styles.caption}>{inventory.activeLocation?.equipmentCount ?? 0} equipos disponibles</Text></View></View><Text style={styles.body}>El Coach y los entrenamientos futuros usan únicamente el equipo de esta ubicación.</Text></Card>
      <LocationManager activeLocation={inventory.activeLocation} locations={inventory.locations} workingId={inventory.workingId} onCreate={inventory.createLocation} onDefault={inventory.makeDefault} onDelete={inventory.removeLocation} onSelect={inventory.selectLocation} onUpdate={inventory.updateLocation} />
      <Card style={styles.card}><Text style={styles.title}>Agregar equipo</Text><Text style={styles.body}>Busca primero en el catálogo universal de GymTrack o registra una máquina con tu propio nombre.</Text><SecondaryButton title="Buscar en catálogo" icon="search-outline" onPress={() => inventory.setQuery('')} /><SecondaryButton title="Escanear máquina · IA próximamente" icon="camera-outline" disabled /><SecondaryButton title="Agregar manualmente" icon="create-outline" onPress={() => showToast({ type: 'info', title: 'Formulario manual', message: 'Está disponible en la sección Equipo personalizado de esta pantalla.' })} /><Text style={styles.subtle}>El escaneo no abre cámara, no pide permisos y no envía fotografías.</Text></Card>
      {inventory.activeLocation ? <EquipmentCatalogSection available={inventory.availableEquipment} unavailable={inventory.unavailableEquipment} categories={inventory.categories} category={inventory.category} query={inventory.query} workingId={inventory.workingId} onCategory={inventory.setCategory} onError={showError} onQuery={inventory.setQuery} onToggle={inventory.toggleEquipment} /> : null}
      {inventory.activeLocation ? <CustomEquipmentSection items={inventory.customEquipment} exercises={inventory.exerciseCatalog} workingId={inventory.workingId} onCreate={inventory.addCustomEquipment} onDelete={inventory.removeCustomEquipment} onToggleExercise={inventory.toggleCustomExercise} onUpdate={inventory.editCustomEquipment} /> : null}
    </>}
  </Screen>;
}
