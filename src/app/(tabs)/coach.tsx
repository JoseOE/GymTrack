import { StyleSheet, Text, View } from 'react-native';

export default function CoachScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coach IA</Text>

      <Text style={styles.subtitle}>
        Genera y adapta tus entrenamientos.
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