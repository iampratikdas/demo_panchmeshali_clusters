import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FAQS = [
  { question: "How do I download a book?", answer: "Books will be auto-downloaded securely to your library when you hit the 'Save' button under the reader or library tab." },
  { question: "How do I contact customer service?", answer: "Hit the 'Contact Us' tab under the Account menu and submit a ticket. We'll reply in 24 hours." },
  { question: "Can I share a book?", answer: "You can share the book metadata and store-links using the 'Share' icon in the upper right header during reading." }
];

export default function HelpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="chevron-left" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {FAQS.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <MaterialIcons name="help-outline" size={20} color="#d4af37" style={{ marginRight: 8 }} />
              <Text style={styles.faqQuestion}>{faq.question}</Text>
            </View>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Further Assistance</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/contact')}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="mail-outline" size={20} color="#888" style={{ marginRight: 12 }} />
              <Text style={styles.rowText}>Send us an email</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="chat-bubble-outline" size={20} color="#888" style={{ marginRight: 12 }} />
              <Text style={styles.rowText}>Live Chat</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
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
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginLeft: 8 },
  faqCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  faqQuestion: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111' },
  faqAnswer: { fontSize: 14, color: '#666', lineHeight: 22 },
  card: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, marginBottom: 32, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowText: { fontSize: 16, color: '#333', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f4f4f4' }
});
