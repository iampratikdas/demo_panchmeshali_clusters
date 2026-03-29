import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ContactScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!subject || !message) {
      Alert.alert("Missing Fields", "Please fill out both the subject and message.");
      return;
    }
    Alert.alert("Message Sent", "We have received your message and will get back to you shortly.");
    setSubject('');
    setMessage('');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="chevron-left" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.infoCard}>
          <MaterialIcons name="support-agent" size={50} color="#d4af37" style={styles.infoIcon} />
          <Text style={styles.infoTitle}>We're here to help!</Text>
          <Text style={styles.infoDesc}>Have an issue or a question? Send us a message below and our support team will reach out to you directly via your registered email.</Text>
        </View>

        <Text style={styles.inputLabel}>Subject</Text>
        <TextInput 
          style={styles.input}
          placeholder="What is this regarding?"
          placeholderTextColor="#aaa"
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.inputLabel}>Message</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Describe your issue in detail..."
          placeholderTextColor="#aaa"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>Send Message</Text>
          <MaterialIcons name="send" size={20} color="#fff" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fdfbf7', paddingTop: Platform.OS === 'android' ? 34 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  content: { padding: 24 },
  infoCard: { backgroundColor: '#fef8e7', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: '#fcf4de' },
  infoIcon: { marginBottom: 12 },
  infoTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 8 },
  infoDesc: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, fontSize: 16, color: '#111', borderWidth: 1, borderColor: '#eee', marginBottom: 20, height: 52 },
  textArea: { height: 140, paddingTop: 16, paddingBottom: 16 },
  sendBtn: { flexDirection: 'row', backgroundColor: '#d4af37', borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10, elevation: 3, shadowColor: '#d4af37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  sendText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
