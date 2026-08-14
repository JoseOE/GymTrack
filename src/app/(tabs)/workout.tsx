import { StyleSheet, Text, View } from 'react-native';

export default function WorkoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrenar</Text>

      <Text style={styles.subtitle}>
        Inicia y registra tu entrenamiento.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },

  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 8,
  },
});
