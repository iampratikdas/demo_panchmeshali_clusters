import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useContacts } from '../../context/ContactsContext';
import { PersonCard } from '../../components/PersonCard';
import { Search } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

type FilterType = 'All' | 'Recently Added' | 'Imported' | 'With Details' | 'Needs Details';

export default function ContactsScreen() {
  const { contacts } = useContacts();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  
  const filters: FilterType[] = ['All', 'Recently Added', 'Imported', 'With Details', 'Needs Details'];

  const filteredContacts = useMemo(() => {
    let result = contacts;
    
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }
    
    switch (activeFilter) {
      case 'Recently Added':
        result = result.slice(0, 5); // Just simulating "recent"
        break;
      case 'Imported':
        result = result.filter(c => c.imported);
        break;
      case 'With Details':
        result = result.filter(c => c.hasDetails);
        break;
      case 'Needs Details':
        result = result.filter(c => !c.hasDetails);
        break;
    }
    
    return result;
  }, [contacts, search, activeFilter]);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn} style={styles.header}>
        <Text style={styles.title}>Your people</Text>
        <Text style={styles.subtitle}>{contacts.length} people in your memory</Text>
        
        <View style={styles.searchContainer}>
          <Search color={Colors.textMuted} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersWrapper}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter, index) => (
            <Pressable 
              key={filter} 
              style={[
                styles.filterChip, 
                activeFilter === filter && styles.filterChipActive
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive
              ]}>{filter}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredContacts.map((contact, index) => (
          <PersonCard key={contact.id} person={contact} delay={index * 50} />
        ))}
        
        {filteredContacts.length === 0 && (
          <Animated.View entering={FadeInDown} style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Your people are waiting.</Text>
            <Text style={styles.emptyText}>No contacts found for this filter.</Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 16,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardHighlight,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    marginLeft: 8,
  },
  filtersWrapper: {
    maxHeight: 40,
  },
  filtersContainer: {
    gap: 8,
    paddingRight: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.text,
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  }
});
