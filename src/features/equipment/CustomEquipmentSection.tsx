import { useEffect, useMemo, useState, type RefObject } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Card, Chip, PrimaryButton, SecondaryButton, SectionTitle } from '@/components/ui';
import { colors } from '@/constants/theme';
import type { CustomEquipment, EquipmentExerciseSummary } from '@/domain/models';
import { useFeedback } from '@/providers/FeedbackProvider';
import { normalizeSearchText } from '@/utils/search';

import { equipmentStyles as styles } from './equipmentStyles';

type Props = {
  items: CustomEquipment[];
  exercises: EquipmentExerciseSummary[];
  workingId: string | null;
  onCreate: (input: { name: string; category?: string; notes?: string }) => Promise<void>;
  onUpdate: (id: string, input: { name: string; category?: string; notes?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleExercise: (item: CustomEquipment, exerciseId: string) => Promise<void>;
  adding: boolean;
  nameInputRef: RefObject<TextInput | null>;
  onAddingChange: (adding: boolean) => void;
};

export function CustomEquipmentSection(props: Props) {
  const { showToast } = useFeedback();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  useEffect(() => {
    if (!props.adding) return;
    const frame = requestAnimationFrame(() => props.nameInputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [props.adding, props.nameInputRef]);
  const closeForm = () => {
    setName('');
    setCategory('');
    setNotes('');
    props.onAddingChange(false);
  };
  const submit = async () => {
    try {
      await props.onCreate({ name, category, notes });
      closeForm();
      showToast({ type: 'success', title: 'Máquina agregada', message: 'Ahora puedes relacionarla con ejercicios oficiales.' });
    } catch (reason) { showToast({ type: 'error', title: 'No se pudo agregar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); }
  };
  return <View style={styles.section}><SectionTitle detail="LOCAL Y PRIVADO">Equipo personalizado</SectionTitle><Card style={styles.card}><Text style={styles.title}>¿No encuentras tu máquina?</Text><Text style={styles.body}>Agrégala manualmente y vincúlala con ejercicios del catálogo oficial.</Text>{props.adding ? <CustomForm name={name} category={category} notes={notes} nameInputRef={props.nameInputRef} saving={props.workingId === 'custom-create'} onName={setName} onCategory={setCategory} onNotes={setNotes} onCancel={closeForm} onSave={() => void submit()} /> : <SecondaryButton title="Agregar equipo manualmente" icon="add-circle-outline" onPress={() => props.onAddingChange(true)} />}</Card>{props.items.map((item) => <CustomEquipmentCard key={item.id} item={item} {...props} />)}</View>;
}

function CustomForm({ name, category, notes, nameInputRef, saving, onName, onCategory, onNotes, onCancel, onSave }: { name: string; category: string; notes: string; nameInputRef?: RefObject<TextInput | null>; saving: boolean; onName: (value: string) => void; onCategory: (value: string) => void; onNotes: (value: string) => void; onCancel: () => void; onSave: () => void }) {
  return <View style={styles.section}><TextInput accessibilityLabel="Nombre de la máquina" autoCapitalize="sentences" onChangeText={onName} placeholder="Nombre *" placeholderTextColor={colors.textSubtle} ref={nameInputRef} style={styles.input} value={name} /><TextInput accessibilityLabel="Categoría de la máquina" autoCapitalize="words" onChangeText={onCategory} placeholder="Categoría" placeholderTextColor={colors.textSubtle} style={styles.input} value={category} /><TextInput accessibilityLabel="Notas de la máquina" multiline onChangeText={onNotes} placeholder="Notas" placeholderTextColor={colors.textSubtle} style={[styles.input, styles.multiline]} value={notes} /><View style={styles.row}><View style={styles.flex}><SecondaryButton title="Cancelar" onPress={onCancel} /></View><View style={styles.flex}><PrimaryButton title="Guardar" icon="save-outline" loading={saving} disabled={!name.trim()} onPress={onSave} /></View></View></View>;
}

function CustomEquipmentCard({ item, exercises, workingId, onUpdate, onDelete, onToggleExercise }: Props & { item: CustomEquipment }) {
  const { confirm, showToast } = useFeedback();
  const [editing, setEditing] = useState(false);
  const [linking, setLinking] = useState(false);
  const [query, setQuery] = useState('');
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category ?? '');
  const [notes, setNotes] = useState(item.notes ?? '');
  const matches = useMemo(() => {
    const normalized = normalizeSearchText(query);
    return exercises.filter((exercise) => !normalized || normalizeSearchText(`${exercise.name} ${exercise.muscle}`).includes(normalized)).slice(0, 18);
  }, [exercises, query]);
  const save = async () => {
    try { await onUpdate(item.id, { name, category, notes }); setEditing(false); showToast({ type: 'success', title: 'Máquina actualizada' }); }
    catch (reason) { showToast({ type: 'error', title: 'No se pudo actualizar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); }
  };
  const toggle = async (exerciseId: string) => {
    try { await onToggleExercise(item, exerciseId); }
    catch (reason) { showToast({ type: 'error', title: 'No se pudo vincular', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); }
  };
  const requestDelete = () => confirm({ title: `¿Eliminar ${item.name}?`, message: 'Se quitará de esta ubicación junto con sus relaciones de ejercicios.', confirmLabel: 'Eliminar', cancelLabel: 'Cancelar', tone: 'danger', icon: 'trash-outline', onConfirm: () => onDelete(item.id) });
  return <Card style={styles.card}>{editing ? <CustomForm name={name} category={category} notes={notes} saving={workingId === item.id} onName={setName} onCategory={setCategory} onNotes={setNotes} onCancel={() => setEditing(false)} onSave={() => void save()} /> : <><View><Text style={styles.title}>{item.name}</Text><Text style={styles.caption}>{item.category || 'Sin categoría'} · manual · {item.linkedExerciseIds.length} ejercicios vinculados</Text>{item.notes ? <Text style={styles.body}>{item.notes}</Text> : null}</View><View style={styles.row}><View style={styles.flex}><SecondaryButton title="Editar" icon="create-outline" onPress={() => setEditing(true)} /></View><View style={styles.flex}><SecondaryButton title="Eliminar" icon="trash-outline" tone="danger" onPress={requestDelete} /></View></View><SecondaryButton title={linking ? 'Cerrar ejercicios' : 'Relacionar ejercicios'} icon="link-outline" onPress={() => setLinking((value) => !value)} />{linking ? <View style={styles.section}><TextInput accessibilityLabel="Buscar ejercicios para relacionar" autoCapitalize="none" onChangeText={setQuery} placeholder="Buscar ejercicio o músculo" placeholderTextColor={colors.textSubtle} style={styles.input} value={query} /><Text style={styles.subtle}>Un vínculo explícito hace disponible el ejercicio mediante esta máquina personalizada.</Text><View style={styles.wrap}>{matches.map((exercise) => <Chip key={exercise.id} label={`${exercise.name} · ${exercise.muscle}`} selected={item.linkedExerciseIds.includes(exercise.id)} onPress={() => void toggle(exercise.id)} />)}</View>{matches.length === 0 ? <Text style={styles.empty}>No encontramos ejercicios oficiales.</Text> : null}</View> : null}</>}</Card>;
}
