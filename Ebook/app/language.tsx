import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const LANGUAGES = [
  'English (US)',
  'English (UK)',
  'Spanish',
  'French',
  'German',
  'Indonesian',
  'Japanese'
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="chevron-left" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionTitle}>Select Language</Text>
        <View style={styles.card}>
          {LANGUAGES.map((lang, index) => (
            <View key={lang}>
              <TouchableOpacity 
                style={styles.row} 
                onPress={() => setSelectedLanguage(lang)}
              >
                <Text style={[styles.rowText, selectedLanguage === lang && styles.activeText]}>
                  {lang}
                </Text>
                {selectedLanguage === lang && (
                  <MaterialIcons name="check" size={20} color="#d4af37" />
                )}
              </TouchableOpacity>
              {index < LANGUAGES.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

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
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 8 },
  card: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, marginBottom: 32, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  rowText: { fontSize: 16, color: '#333', fontWeight: '500' },
  activeText: { color: '#d4af37', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f4f4f4' }
});
