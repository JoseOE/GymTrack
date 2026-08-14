import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Card, Chip, SecondaryButton, SectionTitle } from '@/components/ui';
import { colors } from '@/constants/theme';
import type { EquipmentCatalogItem } from '@/domain/models';

import { equipmentStyles as styles } from './equipmentStyles';

type Props = {
  available: EquipmentCatalogItem[];
  unavailable: EquipmentCatalogItem[];
  categories: string[];
  category: string;
  query: string;
  workingId: string | null;
  onCategory: (value: string) => void;
  onQuery: (value: string) => void;
  onToggle: (item: EquipmentCatalogItem) => Promise<void>;
  onError: (reason: unknown) => void;
};

export function EquipmentCatalogSection({ available, unavailable, categories, category, query, workingId, onCategory, onQuery, onToggle, onError }: Props) {
  return <View style={styles.section}>
    <SectionTitle>Catálogo GymTrack</SectionTitle>
    <View style={styles.row}><Ionicons color={colors.textMuted} name="search" size={20} /><TextInput accessibilityLabel="Buscar equipo" autoCapitalize="none" onChangeText={onQuery} placeholder="Buscar: jalón, lat pulldown, hack…" placeholderTextColor={colors.textSubtle} style={[styles.input, styles.flex]} value={query} /></View>
    <View style={styles.wrap}>{categories.map((item) => <Chip key={item} label={item} selected={category === item} onPress={() => onCategory(item)} />)}</View>
    <EquipmentList empty="No hay equipos agregados que coincidan con la búsqueda." items={available} title="MI EQUIPO" workingId={workingId} onToggle={onToggle} onError={onError} />
    <EquipmentList empty="No encontramos otros equipos con esos filtros." items={unavailable} title="OTROS EQUIPOS" workingId={workingId} onToggle={onToggle} onError={onError} />
  </View>;
}

function EquipmentList({ title, items, empty, workingId, onToggle, onError }: { title: string; items: EquipmentCatalogItem[]; empty: string; workingId: string | null; onToggle: (item: EquipmentCatalogItem) => Promise<void>; onError: (reason: unknown) => void }) {
  return <View style={styles.section}><SectionTitle detail={`${items.length}`}>{title}</SectionTitle>{items.length === 0 ? <Text style={styles.empty}>{empty}</Text> : items.map((item) => <Card key={item.id} style={styles.card}><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/equipment/[equipmentId]', params: { equipmentId: item.id } })} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}><Ionicons color={item.enabled ? colors.success : colors.textMuted} name={item.enabled ? 'checkmark-circle' : 'barbell-outline'} size={22} /><View style={styles.flex}><Text style={styles.title}>{item.name}</Text><Text style={styles.caption}>{item.category} · catálogo v{item.catalogVersion}</Text></View><Ionicons color={colors.textMuted} name="chevron-forward" size={18} /></Pressable><SecondaryButton title={item.enabled ? 'Quitar de mi gimnasio' : 'Agregar a mi gimnasio'} icon={item.enabled ? 'remove-circle-outline' : 'add-circle-outline'} loading={workingId === item.id} onPress={() => void onToggle(item).catch(onError)} /></Card>)}</View>;
}
