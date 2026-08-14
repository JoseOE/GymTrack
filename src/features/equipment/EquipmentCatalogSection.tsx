import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState, type RefObject } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { SectionTitle } from '@/components/ui';
import { colors } from '@/constants/theme';
import type { EquipmentCatalogItem } from '@/domain/models';

import { equipmentStyles as styles } from './equipmentStyles';

type Props = {
  available: EquipmentCatalogItem[];
  unavailable: EquipmentCatalogItem[];
  query: string;
  searchInputRef: RefObject<TextInput | null>;
  workingId: string | null;
  onQuery: (value: string) => void;
  onToggle: (item: EquipmentCatalogItem) => Promise<void>;
  onError: (reason: unknown) => void;
};

type EquipmentGroup = { id: string; label: string; items: EquipmentCatalogItem[] };

const zones = [
  { id: 'general', label: 'General', categories: ['General'] },
  { id: 'pecho', label: 'Pecho', categories: ['Pecho'] },
  { id: 'espalda', label: 'Espalda', categories: ['Espalda'] },
  { id: 'hombro', label: 'Hombro', categories: ['Hombro'] },
  { id: 'pierna', label: 'Pierna', categories: ['Pierna'] },
  { id: 'brazos', label: 'Brazos', categories: ['Brazos'] },
  { id: 'abdomen-core', label: 'Abdomen / Core', categories: ['Abdomen', 'Core'] },
  { id: 'cardio', label: 'Cardio', categories: ['Cardio'] },
] as const;

function groupEquipment(items: EquipmentCatalogItem[]): EquipmentGroup[] {
  const knownCategories = new Set<string>(zones.flatMap((zone) => [...zone.categories]));
  const groups: EquipmentGroup[] = zones
    .map((zone) => ({ id: zone.id, label: zone.label, items: items.filter((item) => zone.categories.some((category) => category === item.category)) }))
    .filter((group) => group.items.length > 0);
  const other = items.filter((item) => !knownCategories.has(item.category));
  if (other.length > 0) groups.push({ id: 'otros', label: 'Otros', items: other });
  return groups;
}

export function EquipmentCatalogSection({ available, unavailable, query, searchInputRef, workingId, onQuery, onToggle, onError }: Props) {
  return <View style={styles.section}>
    <SectionTitle>Catálogo GymTrack</SectionTitle>
    <View style={styles.row}><Ionicons color={colors.textMuted} name="search" size={20} /><TextInput accessibilityLabel="Buscar equipo" autoCapitalize="none" onChangeText={onQuery} placeholder="Buscar: jalón, lat pulldown, hack…" placeholderTextColor={colors.textSubtle} ref={searchInputRef} returnKeyType="search" style={[styles.input, styles.flex]} value={query} /></View>
    <EquipmentList empty="No hay equipos agregados que coincidan con la búsqueda." initiallyExpanded="general" items={available} query={query} title="MI EQUIPO" workingId={workingId} onToggle={onToggle} onError={onError} />
    <EquipmentList empty="No encontramos otros equipos con esa búsqueda." items={unavailable} query={query} title="OTROS EQUIPOS" workingId={workingId} onToggle={onToggle} onError={onError} />
  </View>;
}

function EquipmentList({ title, items, empty, query, initiallyExpanded, workingId, onToggle, onError }: { title: string; items: EquipmentCatalogItem[]; empty: string; query: string; initiallyExpanded?: string; workingId: string | null; onToggle: (item: EquipmentCatalogItem) => Promise<void>; onError: (reason: unknown) => void }) {
  const groups = useMemo(() => groupEquipment(items), [items]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => initiallyExpanded ? { [initiallyExpanded]: true } : {});
  const searching = query.trim().length > 0;
  const toggleGroup = (groupId: string) => setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }));

  return <View style={styles.section}>
    <SectionTitle>{`${title} · ${items.length}`}</SectionTitle>
    {groups.length === 0 ? <Text style={styles.empty}>{empty}</Text> : groups.map((group) => {
      const expanded = searching || expandedGroups[group.id] === true;
      return <View key={group.id} style={styles.group}>
        <Pressable accessibilityLabel={`${expanded ? 'Contraer' : 'Expandir'} ${group.label}`} accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => toggleGroup(group.id)} style={({ pressed }) => [styles.groupHeader, pressed && styles.pressed]}>
          <Ionicons color={colors.primary} name={expanded ? 'chevron-down' : 'chevron-forward'} size={19} />
          <Text style={styles.groupTitle}>{group.label}</Text>
          <Text style={styles.caption}>{group.items.length}</Text>
        </Pressable>
        {expanded ? group.items.map((item) => <CompactEquipmentItem key={item.id} item={item} working={workingId === item.id} onToggle={onToggle} onError={onError} />) : null}
      </View>;
    })}
  </View>;
}

function CompactEquipmentItem({ item, working, onToggle, onError }: { item: EquipmentCatalogItem; working: boolean; onToggle: (item: EquipmentCatalogItem) => Promise<void>; onError: (reason: unknown) => void }) {
  const actionLabel = item.enabled
    ? `Quitar ${item.name} de Mi gimnasio`
    : `Agregar ${item.name} a Mi gimnasio`;
  return <View style={styles.compactItem}>
    <Pressable accessibilityLabel={`Ver detalle de ${item.name}`} accessibilityRole="button" onPress={() => router.push({ pathname: '/equipment/[equipmentId]', params: { equipmentId: item.id } })} style={({ pressed }) => [styles.compactItemBody, pressed && styles.pressed]}>
      <Ionicons color={item.enabled ? colors.success : colors.textMuted} name={item.enabled ? 'checkmark-circle' : 'barbell-outline'} size={22} />
      <View style={styles.flex}><Text numberOfLines={2} style={styles.compactItemTitle}>{item.name}</Text><Text style={styles.caption}>{item.category}</Text></View>
      <Ionicons color={colors.textSubtle} name="chevron-forward" size={17} />
    </Pressable>
    <Pressable accessibilityLabel={actionLabel} accessibilityRole="button" accessibilityState={{ busy: working, disabled: working }} disabled={working} hitSlop={4} onPress={() => void onToggle(item).catch(onError)} style={({ pressed }) => [styles.compactAction, pressed && styles.pressed, working && { opacity: 0.55 }]}>
      {working ? <ActivityIndicator color={colors.primary} size="small" /> : <Ionicons color={item.enabled ? colors.danger : colors.primary} name={item.enabled ? 'remove-circle-outline' : 'add-circle-outline'} size={27} />}
    </Pressable>
  </View>;
}
