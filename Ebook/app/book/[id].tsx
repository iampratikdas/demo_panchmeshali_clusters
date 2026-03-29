import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MaterialIcons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import { useState, useRef } from 'react';
import { DUMMY_STORY_PAGES } from '@/constants/dummy-story';

const BOOK_DETAILS: any = {
  '1': { id: '1', title: 'The Psychology of Money', author: 'Morgan Housel', cover: 'https://picsum.photos/seed/money/200/300', rating: 4.4, pages: 262, language: 'Eng', audio: '2h14m', synopsis: 'Read is a gas station janitor in the United States with a meager income and no economics background. On the other hand, a business executive at Merrill Lynch and a graduate of Harvard University had a vastly different approach to money.\n\nMoney is not just about what you know, but how you behave. Getting wealthy is one thing, but staying wealthy is another. The financial behavior of the two is narrated as the story that builds the book.' },
  '2': { id: '2', title: 'Sapiens', author: 'Yuval Noah Harari', cover: 'https://picsum.photos/seed/sapiens/200/300', rating: 4.7, pages: 498, language: 'Eng', audio: '15h18m', synopsis: 'A Brief History of Humankind. One hundred thousand years ago, at least six different species of humans inhabited Earth. Yet today there is only one—homo sapiens. What happened to the others? And what may happen to us?' },
  '3': { id: '3', title: 'The Design of Everyday Things', author: 'Don Norman', cover: 'https://picsum.photos/seed/design/200/300', rating: 4.6, pages: 347, language: 'Eng', audio: '10h22m', synopsis: 'The ultimate guide to human-centered design. Even the smartest among us can feel inept as we fail to figure out which light switch or oven burner to turn on, or whether to push, pull, or slide a door. The fault, argues this ingenious-even liberating-book, lies not in ourselves, but in product design that ignores the needs of users and the principles of cognitive psychology.' },
  '4': { id: '4', title: 'Fairy Tale', author: 'Stephen King', cover: 'https://picsum.photos/seed/fairy/200/300', rating: 4.7, pages: 608, language: 'Eng', audio: '24h6m', synopsis: 'Legendary storyteller Stephen King goes into the deepest well of his imagination in this spellbinding novel about a seventeen-year-old boy who inherits the keys to a parallel world where good and evil are at war, and the stakes could not be higher—for that world or ours.' },
  // default fallback
  'default': { id: 'default', title: 'Unknown Book', author: 'Unknown Author', cover: 'https://picsum.photos/seed/unknown/200/300', rating: 4.0, pages: 100, language: 'Eng', audio: '1h0m', synopsis: 'This is a sample synopsis for a book that was not found.' }
};

export default function BookReaderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);
  const totalPages = DUMMY_STORY_PAGES.length;
  
  const book = BOOK_DETAILS[id as string] || BOOK_DETAILS['default'];

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <IconSymbol name="chevron.left" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialIcons name="closed-caption" size={24} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialIcons name="share" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Cover & Title */}
          <View style={styles.coverSection}>
            <Image source={{ uri: book.cover }} style={styles.coverImage} />
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{book.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{book.pages}</Text>
              <Text style={styles.statLabel}>Number Of Page</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{book.language}</Text>
              <Text style={styles.statLabel}>Language</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{book.audio}</Text>
              <Text style={styles.statLabel}>Audio</Text>
            </View>
          </View>

          {/* Synopsis */}
          <View style={styles.synopsisSection}>
            <RenderHtml
              contentWidth={width - 48}
              source={{ html: DUMMY_STORY_PAGES[currentPage - 1] }}
              baseStyle={{ fontSize: 16, lineHeight: 26, color: '#444' }}
              tagsStyles={{
                h1: { fontSize: 24, fontWeight: 'bold', color: '#111', marginTop: 10, marginBottom: 16, textAlign: 'center' },
                p: { marginBottom: 16 },
                blockquote: { borderLeftWidth: 4, borderLeftColor: '#f4c242', paddingLeft: 12, fontStyle: 'italic', marginBottom: 16 },
                li: { marginBottom: 8 }
              }}
            />
          </View>
          
          <View style={{ height: 160 }} />
        </ScrollView>

        {/* Playback & Bottom Controls */}
        <View style={styles.bottomFooter}>
          {/* Playback Bar */}
          <View style={styles.playbackBar}>
            <TouchableOpacity>
              <MaterialIcons name="menu-book" size={20} color="#111" />
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${(currentPage / totalPages) * 100}%` }]} />
              <View style={styles.sliderThumb} />
            </View>
            <Text style={styles.timeText}>{Math.round((currentPage / totalPages) * 100)}%</Text>
          </View>

          {/* Control Panel */}
          <View style={styles.controlPanel}>
            <TouchableOpacity style={styles.controlIconBtn}>
              <MaterialIcons name="bookmark" size={24} color="#f4c242" />
            </TouchableOpacity>
            
            <View style={styles.pagePill}>
              <TouchableOpacity onPress={handlePrev} disabled={currentPage === 1}>
                <MaterialIcons name="chevron-left" size={24} color={currentPage > 1 ? "#fff" : "#555"} />
              </TouchableOpacity>
              <Text style={styles.pageText}>{currentPage} / {totalPages}</Text>
              <TouchableOpacity onPress={handleNext} disabled={currentPage === totalPages}>
                <MaterialIcons name="chevron-right" size={24} color={currentPage < totalPages ? "#fff" : "#555"} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.controlIconBtn}>
              <MaterialIcons name="import-contacts" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fdfbf7' },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  headerRight: { flexDirection: 'row', gap: 16 },
  iconBtn: { padding: 4 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  coverSection: { alignItems: 'center', marginTop: 10, paddingBottom: 30 },
  coverImage: { width: 140, height: 210, borderRadius: 8, marginBottom: 20, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: 6 },
  author: { fontSize: 14, color: '#666' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 30, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#f4c242', marginBottom: 4 },
  statLabel: { fontSize: 10, color: '#888', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: '#f0f0f0', height: '80%', alignSelf: 'center' },
  synopsisSection: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#111', textAlign: 'center' },
  synopsisText: { fontSize: 14, lineHeight: 24, color: '#444', textAlign: 'center' },
  bottomFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fdfbf7', paddingHorizontal: 24, paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 24, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  playbackBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sliderTrack: { flex: 1, height: 3, backgroundColor: '#e0e0e0', marginHorizontal: 12, borderRadius: 1.5, flexDirection: 'row', alignItems: 'center' },
  sliderFill: { height: '100%', backgroundColor: '#f4c242', borderRadius: 1.5 },
  sliderThumb: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#f4c242', marginLeft: -5 },
  timeText: { fontSize: 12, color: '#666', fontWeight: '500' },
  controlPanel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  controlIconBtn: { padding: 8 },
  pagePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, width: 220, justifyContent: 'space-between', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  pageText: { color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 }
});
