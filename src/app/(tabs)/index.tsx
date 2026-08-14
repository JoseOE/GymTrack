import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GymTrack</Text>

      <Text style={styles.subtitle}>
        Tu entrenamiento. Tu progreso.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>ENTRENAMIENTO DE HOY</Text>

        <Text style={styles.workout}>
          Pecho + Tríceps
        </Text>

        <Text style={styles.info}>
          5 ejercicios · 60 min
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 24,
    paddingTop: 80,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },

  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 6,
  },

  card: {
    backgroundColor: '#181818',
    borderRadius: 20,
    padding: 22,
    marginTop: 40,
  },

  cardLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },

  workout: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 12,
  },

  info: {
    color: '#9CA3AF',
    fontSize: 15,
    marginTop: 8,
  },
});