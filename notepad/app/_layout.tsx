import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="create" options={{ presentation: 'modal', title: 'Create Note', headerStyle: { backgroundColor: '#f0f0f0' } }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
