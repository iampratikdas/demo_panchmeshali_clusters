import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useNoteStore } from '../store/useNoteStore';
import { Plus, Search, FileText } from 'lucide-react-native';
import { useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const notes = useNoteStore((state) => state.notes);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter((n) => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNoteCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => {}}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardPreview} numberOfLines={2}>
        {item.content.replace(/<[^>]*>?/gm, '')}
      </Text>
      <Text style={styles.cardDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText size={48} color="#ccc" />
          <Text style={styles.emptyText}>No notes found</Text>
          <Text style={styles.emptySubtext}>Tap the + button to create one</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/create')}
      >
        <Plus size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fcfcfc', paddingTop: Platform.OS === 'android' ? 34 : 0 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#111' },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 16 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#333' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1, borderColor: '#f0f0f0' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 8 },
  cardPreview: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  cardDate: { fontSize: 12, color: '#aaa', fontWeight: '500' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#0066cc', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#0066cc', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 }
});
