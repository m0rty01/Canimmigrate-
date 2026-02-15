import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.emoji}>🍁</Text>
        <Text style={[styles.title, { color: colors.text }]}>Page not found</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>The screen you're looking for doesn't exist.</Text>
        <Link href="/" style={[styles.link, { backgroundColor: colors.primary }]}>
          <Text style={[styles.linkText, { color: colors.textLight }]}>Back to Dashboard</Text>
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
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
