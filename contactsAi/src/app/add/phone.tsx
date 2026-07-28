import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAddPerson } from '../../context/AddPersonContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AddPhoneScreen() {
  const { data, updateData } = useAddPerson();
  const [phone, setPhone] = useState(data.phone || '');
  const router = useRouter();

  const handleContinue = () => {
    if (phone.trim()) {
      updateData({ phone: phone.trim() });
      router.push('/add/location');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View entering={FadeIn} style={styles.content}>
        <Text style={styles.title}>How can you reach them?</Text>
        
        <View style={styles.phoneInputContainer}>
          <Text style={styles.countryCode}>+91</Text>
          <View style={styles.divider} />
          <TextInput
            style={styles.input}
            placeholder="98765 43210"
            placeholderTextColor={Colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoFocus
          />
        </View>

        <Pressable 
          style={[styles.button, !phone.trim() && styles.buttonDisabled]} 
          onPress={handleContinue}
          disabled={!phone.trim()}
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 12,
    marginBottom: 40,
  },
  countryCode: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '500',
  },
  divider: {
    width: 2,
    height: 30,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  input: {
    color: Colors.text,
    fontSize: 24,
    flex: 1,
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
