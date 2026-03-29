import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FILTERS = ['All Result', 'Free', 'Premium', 'Author', 'Genre'];

const SEARCH_BOOKS = [
  { id: '1', title: 'The Psychology of Money', author: 'Morgan Housel', cover: 'https://picsum.photos/seed/money/200/300', rating: 4.4, badge: 'Picked' },
  { id: '2', title: 'Sapiens: A Brief History', author: 'Yuval Noah Harari', cover: 'https://picsum.photos/seed/sapiens/200/300', rating: 4.7, badge: null },
  { id: '5', title: 'Filosofi Teras', author: 'Henry Manampiring', cover: 'https://picsum.photos/seed/filosofi/200/300', rating: 4.8, badge: 'Picked' },
  { id: '3', title: 'The Design of Everyday Things', author: 'Don Norman', cover: 'https://picsum.photos/seed/design/200/300', rating: 4.6, badge: null },
  { id: '6', title: 'Atomic Habits', author: 'James Clear', cover: 'https://picsum.photos/seed/atomic/200/300', rating: 4.9, badge: 'Picked' },
  { id: '4', title: 'Fairy Tale', author: 'Stephen King', cover: 'https://picsum.photos/seed/fairy/200/300', rating: 4.7, badge: null },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Result');
  const router = useRouter();

  const handleBookPress = (id: string) => {
    router.push(`/book/${id}` as any);
  };

  const filteredBooks = SEARCH_BOOKS.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBookGridItem = ({ item }: { item: typeof SEARCH_BOOKS[0] }) => (
    <View style={styles.gridItemWrapper}>
      <TouchableOpacity style={styles.gridCard} onPress={() => handleBookPress(item.id)}>
        <View style={styles.gridCoverContainer}>
          <Image source={{ uri: item.cover }} style={styles.gridCover} />
          {item.badge && (
             <View style={styles.badgePill}>
               <MaterialIcons name="play-arrow" size={10} color="#f4c242" />
             </View>
          )}
        </View>
        <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.gridAuthor} numberOfLines={1}>{item.author}</Text>
        
        <View style={styles.gridFooter}>
          <View style={styles.ratingPill}>
            <MaterialIcons name="menu-book" size={12} color="#f4c242" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          {item.badge === 'Picked' && (
            <View style={styles.pickedPill}>
              <Text style={styles.pickedText}>Picked</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={24} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Book"
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
          <TouchableOpacity style={styles.sortBtn}>
            <MaterialIcons name="swap-vert" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterSection}>
          <FlatList
            horizontal
            data={FILTERS}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterChip, activeFilter === item && styles.activeFilterChip]}
                onPress={() => setActiveFilter(item)}
              >
                <Text style={[styles.filterText, activeFilter === item && styles.activeFilterText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Book Grid */}
        <FlatList
          data={filteredBooks}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={renderBookGridItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={60} color="#ddd" />
              <Text style={styles.emptyText}>No matching books found</Text>
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 16, height: 48, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#111', height: '100%' },
  sortBtn: { marginLeft: 16, padding: 8, backgroundColor: '#fff', borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  filterSection: { marginBottom: 16 },
  filterContent: { paddingHorizontal: 20, gap: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'transparent' },
  activeFilterChip: { backgroundColor: '#fcf4de' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#888' },
  activeFilterText: { color: '#d4af37' },
  listContent: { paddingHorizontal: 12, paddingBottom: 24 },
  gridItemWrapper: { width: '50%', padding: 8 },
  gridCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  gridCoverContainer: { position: 'relative', marginBottom: 12, alignItems: 'center' },
  gridCover: { width: '100%', aspectRatio: 0.65, borderRadius: 8 },
  badgePill: { position: 'absolute', top: -6, right: -6, backgroundColor: '#fff', padding: 4, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 2 } },
  gridTitle: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 4 },
  gridAuthor: { fontSize: 11, color: '#888', marginBottom: 8, fontWeight: '500' },
  gridFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef8e7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 },
  ratingText: { fontSize: 10, fontWeight: '700', color: '#f4c242' },
  pickedPill: { backgroundColor: '#f0f5ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  pickedText: { fontSize: 10, fontWeight: '600', color: '#666' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#888', fontWeight: '500' },
});
