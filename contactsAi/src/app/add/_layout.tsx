import { Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Pressable, Text, StyleSheet } from 'react-native';
import { ChevronLeft, X } from 'lucide-react-native';
import { AddPersonProvider, useAddPerson } from '../../context/AddPersonContext';

export default function AddLayout() {
  return (
    <AddPersonProvider>
      <AddStack />
    </AddPersonProvider>
  );
}

function AddStack() {
  const router = useRouter();
  const { reset } = useAddPerson();

  const handleClose = () => {
    reset();
    router.back();
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={Colors.text} size={24} />
          </Pressable>
        ),
        headerRight: () => (
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <X color={Colors.text} size={24} />
          </Pressable>
        ),
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen name="name" options={{ title: 'Step 1 of 5', headerLeft: () => null }} />
      <Stack.Screen name="photo" options={{ title: 'Step 2 of 5' }} />
      <Stack.Screen name="phone" options={{ title: 'Step 3 of 5' }} />
      <Stack.Screen name="location" options={{ title: 'Step 4 of 5' }} />
      <Stack.Screen name="context" options={{ title: 'Step 5 of 5' }} />
      <Stack.Screen name="review" options={{ title: 'Review' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  closeBtn: {
    padding: 8,
    marginRight: -8,
  }
});
