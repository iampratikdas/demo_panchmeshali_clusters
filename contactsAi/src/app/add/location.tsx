import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAddPerson } from '../../context/AddPersonContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AddLocationScreen() {
  const { data, updateData } = useAddPerson();
  const [location, setLocation] = useState(data.location || '');
  const router = useRouter();

  const handleContinue = () => {
    updateData({ location: location.trim() });
    router.push('/add/context');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View entering={FadeIn} style={styles.content}>
        <Text style={styles.title}>Where do you know them from?</Text>
        
        <TextInput
          style={styles.input}
          placeholder="City, area or place"
          placeholderTextColor={Colors.textMuted}
          value={location}
          onChangeText={setLocation}
          autoFocus
        />

        <View style={styles.footer}>
          <Pressable style={styles.skipBtn} onPress={() => router.push('/add/context')}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
          <Pressable 
            style={[styles.button, !location.trim() && styles.buttonDisabled]} 
            onPress={handleContinue}
            disabled={!location.trim()}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 40,
    marginTop: 20,
  },
  input: {
    color: Colors.text,
    fontSize: 24,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 12,
    marginBottom: 40,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 40,
    gap: 16,
  },
  skipBtn: {
    padding: 16,
    alignItems: 'center',
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  }
});
