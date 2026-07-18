import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);

  if (!hasOnboarded) {
    return <Redirect href="/(auth)/splash" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
