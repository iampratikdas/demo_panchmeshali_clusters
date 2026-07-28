import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAddPerson } from '../../context/AddPersonContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AddContextScreen() {
  const { data, updateData } = useAddPerson();
  const [notes, setNotes] = useState(data.notes || '');
  const router = useRouter();

  const handleContinue = () => {
    updateData({ notes: notes.trim(), relationship: 'Person met at an event' }); // Defaulting relationship for prototype
    router.push('/add/review');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn} style={styles.content}>
          <Text style={styles.title}>Who are they?</Text>
          <Text style={styles.subtitle}>Add a little context so you can remember them later.</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Example: My former colleague from Infosys. We worked together on a project in 2024."
              placeholderTextColor={Colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={300}
              autoFocus
            />
            <Text style={styles.charCount}>{notes.length}/300</Text>
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.skipBtn} onPress={() => router.push('/add/review')}>
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
            <Pressable 
              style={[styles.button, !notes.trim() && styles.buttonDisabled]} 
              onPress={handleContinue}
              disabled={!notes.trim()}
            >
              <Text style={styles.buttonText}>Review</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 16,
    marginBottom: 40,
  },
  inputContainer: {
    backgroundColor: Colors.cardHighlight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    minHeight: 200,
    marginBottom: 40,
  },
  input: {
    color: Colors.text,
    fontSize: 18,
    flex: 1,
    textAlignVertical: 'top',
  },
  charCount: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
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
