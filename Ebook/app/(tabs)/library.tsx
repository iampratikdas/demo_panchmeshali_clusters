import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const MY_LIBRARY_BOOKS = [
  { id: '1', title: 'The Psychology of Money', author: 'Morgan Housel', cover: 'https://picsum.photos/seed/money/200/300', progress: 40, lastRead: '2 days ago' },
  { id: '2', title: 'Sapiens', author: 'Yuval Noah Harari', cover: 'https://picsum.photos/seed/sapiens/200/300', progress: 85, lastRead: 'Today' },
  { id: '3', title: 'The Design of Everyday Things', author: 'Don Norman', cover: 'https://picsum.photos/seed/design/200/300', progress: 12, lastRead: '1 week ago' },
  { id: '4', title: 'Fairy Tale', author: 'Stephen King', cover: 'https://picsum.photos/seed/fairy/200/300', progress: 100, lastRead: 'Finished' },
];

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleBookPress = (id: string) => {
    router.push(`/book/${id}` as any);
  };

  const filteredBooks = MY_LIBRARY_BOOKS.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBookItem = ({ item }: { item: typeof MY_LIBRARY_BOOKS[0] }) => (
    <TouchableOpacity style={styles.bookCard} onPress={() => handleBookPress(item.id)}>
      <Image source={{ uri: item.cover }} style={styles.bookCover} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>{item.progress}% Completed</Text>
            <Text style={styles.lastReadText}>{item.lastRead}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Library</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={24} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your library..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
               <TouchableOpacity onPress={() => setSearchQuery('')}>
                 <MaterialIcons name="cancel" size={20} color="#888" />
               </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Book List */}
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          renderItem={renderBookItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="menu-book" size={60} color="#ddd" />
              <Text style={styles.emptyText}>No books found.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fdfbf7', paddingTop: Platform.OS === 'android' ? 34 : 0 },
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111' },
  searchContainer: { paddingHorizontal: 24, marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 52, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#111', height: '100%' },
  listContent: { paddingHorizontal: 24, paddingBottom: 24 },
  bookCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5 },
  bookCover: { width: 75, height: 110, borderRadius: 8, marginRight: 16 },
  bookInfo: { flex: 1, justifyContent: 'center' },
  bookTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 6 },
  bookAuthor: { fontSize: 13, color: '#666', marginBottom: 16, fontWeight: '500' },
  progressSection: { marginTop: 'auto' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 12, fontWeight: '700', color: '#d4af37' },
  lastReadText: { fontSize: 11, color: '#aaa', fontWeight: '500' },
  progressBarBg: { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, width: '100%' },
  progressBarFill: { height: 6, backgroundColor: '#f4c242', borderRadius: 3 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#888', fontWeight: '500' },
});
