import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.text}>This screen doesn't exist.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1F2937',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
