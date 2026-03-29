import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MaterialIcons } from '@expo/vector-icons';

const CATEGORIES = ['All Genre', 'Comedy', 'Fiction', 'Romance', 'Biography', 'Business'];

const FEATURED_BOOK = {
  id: '1', title: 'The Psychology Of\nMoney', author: 'Morgan Housel (2020)', cover: 'https://picsum.photos/seed/money/200/300'
};

const BOOKS = [
  { id: '1', title: 'The Psychology ...', author: 'Morgan Housel', cover: 'https://picsum.photos/seed/money/200/300', rating: 4.4, badge: 'Picked', category: 'Business' },
  { id: '3', title: 'The Design of Ev...', author: 'Don Norman', cover: 'https://picsum.photos/seed/design/200/300', rating: 4.6, badge: null, category: 'Business' },
  { id: '4', title: 'Fairy Tale', author: 'Stephen King', cover: 'https://picsum.photos/seed/fairy/200/300', rating: 4.7, badge: null, category: 'Fiction' },
  { id: '2', title: 'Sapiens', author: 'Yuval Noah Harari', cover: 'https://picsum.photos/seed/sapiens/200/300', rating: 4.7, badge: null, category: 'Biography' },
  { id: '7', title: 'Bossypants', author: 'Tina Fey', cover: 'https://picsum.photos/seed/comedy1/200/300', rating: 4.8, badge: 'Picked', category: 'Comedy' },
  { id: '8', title: 'Catch-22', author: 'Joseph Heller', cover: 'https://picsum.photos/seed/comedy2/200/300', rating: 4.5, badge: null, category: 'Comedy' },
  { id: '9', title: 'Dune', author: 'Frank Herbert', cover: 'https://picsum.photos/seed/dune/200/300', rating: 4.9, badge: 'Picked', category: 'Fiction' },
  { id: '10', title: 'Pride & Prejudice', author: 'Jane Austen', cover: 'https://picsum.photos/seed/romance1/200/300', rating: 4.7, badge: null, category: 'Romance' },
];

const CONTINUE_READING = [
  { id: '1', title: 'The Psychology ...', author: 'Morgan Housel', cover: 'https://picsum.photos/seed/money/200/300', rating: 4.4 },
  { id: '5', title: 'Earth', author: 'Teres...', cover: 'https://picsum.photos/seed/earth/200/300', rating: 4.2 },
  { id: '3', title: 'The Design of Ev...', author: 'Don Norman', cover: 'https://picsum.photos/seed/design/200/300', rating: 4.6 },
  { id: '6', title: 'Atomic Habits', author: 'James Clear', cover: 'https://picsum.photos/seed/atomic/200/300', rating: 4.9 },
  { id: '4', title: 'Fairy Tale', author: 'Stephen King', cover: 'https://picsum.photos/seed/fairy/200/300', rating: 4.7 },
];

export default function HomeScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const screenWidth = Dimensions.get('window').width;
  const flatListRef = useRef<FlatList>(null);
  const tabsScrollRef = useRef<ScrollView>(null);

  const handleCategoryPress = (cat: string) => {
    setActiveCategory(cat);
    const idx = CATEGORIES.indexOf(cat);
    flatListRef.current?.scrollToIndex({ index: idx, animated: true });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index >= 0 && index < CATEGORIES.length) {
        setActiveCategory(CATEGORIES[index]);
        // Scroll the top tabs automatically based on an approximation
        tabsScrollRef.current?.scrollTo({ x: index * 80, animated: true });
      }
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleBookPress = (id: string) => {
    router.push(`/book/${id}` as any);
  };

  const renderBookGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.gridCard} onPress={() => handleBookPress(item.id)}>
      <View style={styles.gridCoverContainer}>
        <Image source={{ uri: item.cover }} style={styles.gridCover} />
        {item.badge && (
           <View style={styles.badgePill}>
             {/* Using Star as mock indicator instead of crown */}
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
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Featured Section */}
        <TouchableOpacity style={styles.featuredCard} onPress={() => handleBookPress(FEATURED_BOOK.id)}>
          <View style={styles.featuredContent}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>🔥 Popular</Text>
            </View>
            <Text style={styles.featuredTitle}>{FEATURED_BOOK.title}</Text>
            <Text style={styles.featuredAuthor}>{FEATURED_BOOK.author}</Text>
            <Text style={styles.readMore}>Read More</Text>
          </View>
          <Image source={{ uri: FEATURED_BOOK.cover }} style={styles.featuredImage} />
        </TouchableOpacity>

        {/* Categories */}
        <ScrollView ref={tabsScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={activeCategory === cat ? styles.activeCategory : styles.category}
              onPress={() => handleCategoryPress(cat)}
            >
              <Text style={activeCategory === cat ? styles.activeCategoryText : styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grid List Pager */}
        <FlatList
          ref={flatListRef}
          data={CATEGORIES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(item) => item}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          initialNumToRender={CATEGORIES.length}
          style={{ marginBottom: 12 }}
          renderItem={({ item: category }) => {
            const pageBooks = category === 'All Genre' 
              ? BOOKS 
              : BOOKS.filter(b => b.category === category);
            
            return (
              <View style={{ width: screenWidth }}>
                <View style={styles.gridContainer}>
                  {pageBooks.map((book) => (
                    <View key={book.id} style={styles.gridItemWrapper}>
                      {renderBookGridItem({ item: book })}
                    </View>
                  ))}
                </View>
              </View>
            );
          }}
        />

        {/* Continue Reading */}
        <Text style={styles.sectionHeader}>Continue Reading</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.continueReadingContent}>
          {CONTINUE_READING.map((book) => (
            <TouchableOpacity key={book.id} style={styles.continueCard} onPress={() => handleBookPress(book.id)}>
              <Image source={{ uri: book.cover }} style={styles.continueCover} />
              <View style={styles.continueInfo}>
                <View style={styles.continueTopRow}>
                  <MaterialIcons name="menu-book" size={12} color="#f4c242" />
                  <Text style={styles.continueRating}>{book.rating}</Text>
                </View>
                <Text style={styles.continueTitle} numberOfLines={1}>{book.title}</Text>
                <Text style={styles.continueAuthor} numberOfLines={1}>{book.author}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '40%' }]} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fcfaf6', paddingTop: Platform.OS === 'android' ? 34 : 0 },
  container: { paddingBottom: 20 },
  featuredCard: { marginHorizontal: 20, marginTop: 10, backgroundColor: '#fcf4de', borderRadius: 20, padding: 20, flexDirection: 'row', overflow: 'hidden', height: 170 },
  featuredContent: { flex: 1, justifyContent: 'center' },
  popularBadge: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  popularText: { fontSize: 10, fontWeight: '700', color: '#d4af37' },
  featuredTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 6, lineHeight: 22 },
  featuredAuthor: { fontSize: 11, color: '#666', marginBottom: 12, fontWeight: '500' },
  readMore: { fontSize: 12, fontWeight: '700', color: '#d4af37' },
  featuredImage: { width: 100, height: 145, borderRadius: 8, position: 'absolute', right: 20, bottom: -10, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 },
  categoriesScroll: { marginTop: 24, marginBottom: 16 },
  categoriesContent: { paddingHorizontal: 20, gap: 24 },
  category: { paddingBottom: 6 },
  activeCategory: { paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: '#d4af37' },
  categoryText: { fontSize: 15, color: '#aaa', fontWeight: '600' },
  activeCategoryText: { fontSize: 15, color: '#d4af37', fontWeight: '700' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  gridItemWrapper: { width: '50%', padding: 8 },
  gridCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  gridCoverContainer: { position: 'relative', marginBottom: 12, alignItems: 'center' },
  gridCover: { width: '100%', aspectRatio: 0.65, borderRadius: 8 },
  badgePill: { position: 'absolute', top: -6, right: -6, backgroundColor: '#fff', padding: 4, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 2 } },
  gridTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 4 },
  gridAuthor: { fontSize: 11, color: '#888', marginBottom: 8, fontWeight: '500' },
  gridFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef8e7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 },
  ratingText: { fontSize: 10, fontWeight: '700', color: '#f4c242' },
  pickedPill: { backgroundColor: '#f0f5ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  pickedText: { fontSize: 10, fontWeight: '600', color: '#666' },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 24, marginBottom: 16, paddingHorizontal: 20 },
  continueReadingContent: { paddingHorizontal: 20, gap: 16 },
  continueCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 12, width: 240, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  continueCover: { width: 55, height: 80, borderRadius: 6, marginRight: 12 },
  continueInfo: { flex: 1, justifyContent: 'center' },
  continueTopRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  continueRating: { fontSize: 10, fontWeight: '700', color: '#333' },
  continueTitle: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 4 },
  continueAuthor: { fontSize: 11, color: '#888', marginBottom: 8 },
  progressBarBg: { height: 4, backgroundColor: '#eee', borderRadius: 2, width: '100%' },
  progressBarFill: { height: 4, backgroundColor: '#d4af37', borderRadius: 2 },
});
