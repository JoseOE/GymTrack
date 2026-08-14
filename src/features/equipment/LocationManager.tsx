import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Card, Chip, PrimaryButton, SecondaryButton, SectionTitle } from '@/components/ui';
import type { TrainingLocation, TrainingLocationType } from '@/domain/models';
import { useFeedback } from '@/providers/FeedbackProvider';

import { equipmentStyles as styles } from './equipmentStyles';

type Props = {
  locations: TrainingLocation[];
  activeLocation: TrainingLocation | null;
  workingId: string | null;
  onSelect: (id: string) => Promise<void>;
  onCreate: (input: { name: string; locationType: TrainingLocationType }) => Promise<void>;
  onUpdate: (id: string, input: { name: string; locationType: TrainingLocationType }) => Promise<void>;
  onDefault: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function LocationManager({ locations, activeLocation, workingId, onSelect, onCreate, onUpdate, onDefault, onDelete }: Props) {
  const { confirm, showToast } = useFeedback();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [locationType, setLocationType] = useState<TrainingLocationType>('gym');

  const run = async (action: () => Promise<void>, success: string) => {
    try { await action(); showToast({ type: 'success', title: success }); return true; }
    catch (reason) { showToast({ type: 'error', title: 'No se pudo completar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); return false; }
  };
  const startEditing = () => {
    if (!activeLocation) return;
    setName(activeLocation.name);
    setLocationType(activeLocation.locationType);
    setEditing(true);
    setShowCreate(false);
  };
  const submitCreate = async () => {
    if (!await run(() => onCreate({ name, locationType }), 'Ubicación creada')) return;
    setName('');
    setLocationType('gym');
    setShowCreate(false);
  };
  const submitEdit = async () => {
    if (!activeLocation) return;
    if (!await run(() => onUpdate(activeLocation.id, { name, locationType }), 'Ubicación actualizada')) return;
    setEditing(false);
  };
  const requestDelete = () => {
    if (!activeLocation) return;
    confirm({
      title: `¿Eliminar ${activeLocation.name}?`,
      message: 'Su inventario y equipo personalizado se eliminarán de este dispositivo. Tus entrenamientos anteriores no cambian.',
      confirmLabel: 'Eliminar ubicación',
      cancelLabel: 'Cancelar',
      tone: 'danger',
      icon: 'trash-outline',
      onConfirm: () => onDelete(activeLocation.id),
    });
  };

  return <View style={styles.section}>
    <SectionTitle detail={`${locations.length} ${locations.length === 1 ? 'UBICACIÓN' : 'UBICACIONES'}`}>Dónde entrenas</SectionTitle>
    <View style={styles.wrap}>{locations.map((location) => <Chip key={location.id} label={`${location.name}${location.isDefault ? ' · predeterminada' : ''}`} selected={location.id === activeLocation?.id} onPress={() => void run(() => onSelect(location.id), `${location.name} es la ubicación activa`)} />)}</View>
    {activeLocation ? <Card style={styles.card}>
      <View><Text style={styles.title}>{activeLocation.name}</Text><Text style={styles.caption}>{activeLocation.equipmentCount} equipos disponibles · {activeLocation.locationType === 'gym' ? 'Gimnasio' : activeLocation.locationType === 'home' ? 'Casa' : 'Otra ubicación'}</Text></View>
      <View style={styles.row}><View style={styles.flex}><SecondaryButton title="Renombrar" icon="create-outline" onPress={startEditing} /></View>{!activeLocation.isDefault ? <View style={styles.flex}><SecondaryButton title="Predeterminada" icon="star-outline" loading={workingId === `location-${activeLocation.id}`} onPress={() => void run(() => onDefault(activeLocation.id), 'Ubicación predeterminada actualizada')} /></View> : null}</View>
      <SecondaryButton title="Eliminar ubicación" icon="trash-outline" tone="danger" onPress={requestDelete} disabled={locations.length === 1} />
    </Card> : null}
    {showCreate || editing ? <LocationForm name={name} locationType={locationType} saving={workingId === 'location-create' || Boolean(activeLocation && workingId === `location-${activeLocation.id}`)} title={editing ? 'Editar ubicación' : 'Nueva ubicación'} onName={setName} onType={setLocationType} onCancel={() => { setShowCreate(false); setEditing(false); }} onSave={() => void (editing ? submitEdit() : submitCreate())} /> : <SecondaryButton title="Agregar ubicación" icon="add-circle-outline" onPress={() => { setName(''); setLocationType('gym'); setShowCreate(true); setEditing(false); }} />}
  </View>;
}

function LocationForm({ title, name, locationType, saving, onName, onType, onCancel, onSave }: { title: string; name: string; locationType: TrainingLocationType; saving: boolean; onName: (value: string) => void; onType: (value: TrainingLocationType) => void; onCancel: () => void; onSave: () => void }) {
  return <Card style={styles.card}><Text style={styles.title}>{title}</Text><TextInput accessibilityLabel="Nombre de la ubicación" autoCapitalize="words" onChangeText={onName} placeholder="Ej. Gym universidad" placeholderTextColor="#626A64" style={styles.input} value={name} /><View style={styles.wrap}><Chip label="Gimnasio" selected={locationType === 'gym'} onPress={() => onType('gym')} /><Chip label="Casa" selected={locationType === 'home'} onPress={() => onType('home')} /><Chip label="Otro" selected={locationType === 'other'} onPress={() => onType('other')} /></View><View style={styles.row}><View style={styles.flex}><SecondaryButton title="Cancelar" onPress={onCancel} /></View><View style={styles.flex}><PrimaryButton title="Guardar" icon="save-outline" loading={saving} disabled={!name.trim()} onPress={onSave} /></View></View></Card>;
}
