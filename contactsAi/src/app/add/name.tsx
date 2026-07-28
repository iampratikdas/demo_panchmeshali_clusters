import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAddPerson } from '../../context/AddPersonContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AddNameScreen() {
  const { data, updateData } = useAddPerson();
  const [name, setName] = useState(data.name || '');
  const router = useRouter();

  const handleContinue = () => {
    if (name.trim()) {
      updateData({ name: name.trim() });
      router.push('/add/photo');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View entering={FadeIn} style={styles.content}>
        <Text style={styles.title}>Who are you adding?</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter their name"
          placeholderTextColor={Colors.textMuted}
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <Pressable 
          style={[styles.button, !name.trim() && styles.buttonDisabled]} 
          onPress={handleContinue}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
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
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
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
