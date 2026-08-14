import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState, type RefObject } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';

import { Card, IconButton, Screen, ScreenHeader, SecondaryButton } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useFeedback } from '@/providers/FeedbackProvider';

import { CustomEquipmentSection } from './CustomEquipmentSection';
import { EquipmentCatalogSection } from './EquipmentCatalogSection';
import { equipmentStyles as styles } from './equipmentStyles';
import { LocationManager } from './LocationManager';
import { useEquipmentInventory } from './useEquipmentInventory';

export function EquipmentScreen() {
  const inventory = useEquipmentInventory();
  const { showToast } = useFeedback();
  const scrollViewRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);
  const manualNameInputRef = useRef<TextInput>(null);
  const catalogY = useRef(0);
  const customEquipmentY = useRef(0);
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const showError = (reason: unknown) => showToast({ type: 'error', title: 'No se pudo actualizar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });
  const scrollTo = (position: RefObject<number>) => scrollViewRef.current?.scrollTo({ y: Math.max(0, position.current - spacing.lg), animated: true });
  const openCatalogSearch = () => {
    scrollTo(catalogY);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };
  const openManualEquipmentForm = () => {
    setManualFormOpen(true);
    scrollTo(customEquipmentY);
    requestAnimationFrame(() => manualNameInputRef.current?.focus());
  };

  return <Screen scrollViewRef={scrollViewRef}>
    <ScreenHeader title="Mi gimnasio" subtitle="Equipo disponible para tus próximas rutinas" action={<IconButton icon="close" label="Cerrar Mi gimnasio y volver al perfil" onPress={() => router.replace('/profile')} />} />
    {inventory.loading && !inventory.activeLocation ? <View style={styles.section}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.empty}>Preparando tu inventario local…</Text></View> : <>
      <Card style={styles.card}><View style={styles.row}><Ionicons color={colors.primary} name="location" size={24} /><View style={styles.flex}><Text style={styles.title}>{inventory.activeLocation?.name ?? 'Sin ubicación'}</Text><Text style={styles.caption}>{inventory.activeLocation?.equipmentCount ?? 0} equipos disponibles</Text></View></View><Text style={styles.body}>El Coach y los entrenamientos futuros usan únicamente el equipo de esta ubicación.</Text></Card>
      <LocationManager activeLocation={inventory.activeLocation} locations={inventory.locations} workingId={inventory.workingId} onCreate={inventory.createLocation} onDefault={inventory.makeDefault} onDelete={inventory.removeLocation} onSelect={inventory.selectLocation} onUpdate={inventory.updateLocation} />
      <Card style={styles.quickActions}><Text style={styles.title}>Agregar equipo</Text><SecondaryButton title="Buscar en catálogo" icon="search-outline" onPress={openCatalogSearch} /><SecondaryButton title="Escanear máquina · IA próximamente" icon="camera-outline" disabled /><SecondaryButton title="Agregar manualmente" icon="create-outline" onPress={openManualEquipmentForm} /></Card>
      {inventory.activeLocation ? <View onLayout={(event) => { catalogY.current = event.nativeEvent.layout.y; }}><EquipmentCatalogSection available={inventory.availableEquipment} unavailable={inventory.unavailableEquipment} query={inventory.query} searchInputRef={searchInputRef} workingId={inventory.workingId} onError={showError} onQuery={inventory.setQuery} onToggle={inventory.toggleEquipment} /></View> : null}
      {inventory.activeLocation ? <View onLayout={(event) => { customEquipmentY.current = event.nativeEvent.layout.y; }}><CustomEquipmentSection adding={manualFormOpen} items={inventory.customEquipment} exercises={inventory.exerciseCatalog} nameInputRef={manualNameInputRef} workingId={inventory.workingId} onAddingChange={setManualFormOpen} onCreate={inventory.addCustomEquipment} onDelete={inventory.removeCustomEquipment} onToggleExercise={inventory.toggleCustomExercise} onUpdate={inventory.editCustomEquipment} /></View> : null}
    </>}
  </Screen>;
}
