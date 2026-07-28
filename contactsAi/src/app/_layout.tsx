import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ContactsProvider } from '../context/ContactsContext';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/Colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Custom theme reflecting our premium design
  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.background,
      card: Colors.card,
      text: Colors.text,
      border: Colors.border,
      primary: Colors.primary,
    },
  };

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={CustomDarkTheme}>
      <ContactsProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="person/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="import" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
      </ContactsProvider>
    </ThemeProvider>
  );
}
