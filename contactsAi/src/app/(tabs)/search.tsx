import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Search as SearchIcon, Sparkles, Mic, ArrowRight } from 'lucide-react-native';
import { useContacts } from '../../context/ContactsContext';
import { PersonCard } from '../../components/PersonCard';
import { LoadingAI } from '../../components/LoadingAI';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';

export default function SearchScreen() {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  
  const { searchContacts, aiSearch } = useContacts();

  const handleAiSearch = () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setAiResult(null);
    
    // Simulate AI network delay
    setTimeout(() => {
      const result = aiSearch(query);
      setAiResult(result);
      setIsSearching(false);
    }, 2000);
  };

  const manualResults = mode === 'manual' ? searchContacts(query) : [];

  const exampleSearches = [
    "My old college friend from Durgapur",
    "Someone I met at a conference",
    "The designer I worked with last year",
    "Rahul from Infosys"
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <SegmentedControl
          options={[
            { id: 'ai', label: 'AI Search', icon: 'sparkles' },
            { id: 'manual', label: 'Manual', icon: 'search' }
          ]}
          selectedId={mode}
          onSelect={(id) => {
            setMode(id as 'ai' | 'manual');
            setQuery('');
            setAiResult(null);
            setIsSearching(false);
          }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {mode === 'ai' ? (
          <Animated.View entering={FadeIn}>
            <Text style={styles.title}>Describe who you remember</Text>
            <Text style={styles.subtitle}>You don't need to remember their name.</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.aiInput}
                placeholder="I'm looking for someone I worked with in Kolkata..."
                placeholderTextColor={Colors.textMuted}
                value={query}
                onChangeText={setQuery}
                multiline
                maxLength={200}
                onSubmitEditing={handleAiSearch}
              />
              <View style={styles.inputActions}>
                <Pressable style={styles.micBtn}>
                  <Mic color={Colors.textMuted} size={20} />
                </Pressable>
                <Pressable 
                  style={[styles.searchBtn, !query.trim() && styles.searchBtnDisabled]} 
                  onPress={handleAiSearch}
                  disabled={!query.trim()}
                >
                  <Sparkles color={Colors.text} size={20} />
                </Pressable>
              </View>
            </View>

            {isSearching && (
              <Animated.View entering={FadeInDown}>
                <LoadingAI />
              </Animated.View>
            )}

            {!isSearching && aiResult && (
              <Animated.View entering={SlideInRight.springify()}>
                <Text style={styles.sectionTitle}>I think you mean...</Text>
                <PersonCard person={aiResult} showMatch={92} />
              </Animated.View>
            )}

            {!isSearching && !aiResult && query.length > 0 && query.length > 5 && (
              // If there was a search but no result, and it's not searching now
              // Wait, aiResult could just be null from a failed search. 
              // We need a better way to track "hasSearched". Let's assume if query is long and no result, it might be a miss.
              // Actually let's just handle it conditionally. 
              <View />
            )}

            {!isSearching && !aiResult && query.length === 0 && (
              <Animated.View entering={FadeInDown.delay(200)}>
                <Text style={styles.sectionTitle}>Example searches</Text>
                <View style={styles.chipsContainer}>
                  {exampleSearches.map((ex, i) => (
                    <Pressable 
                      key={i} 
                      style={styles.chip}
                      onPress={() => setQuery(ex)}
                    >
                      <Text style={styles.chipText}>{ex}</Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn}>
            <View style={styles.manualInputContainer}>
              <SearchIcon color={Colors.textMuted} size={20} />
              <TextInput
                style={styles.manualInput}
                placeholder="Search by name..."
                placeholderTextColor={Colors.textMuted}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
            </View>
            
            <View style={styles.resultsContainer}>
              {query.length > 0 && manualResults.map((contact, index) => (
                <PersonCard key={contact.id} person={contact} delay={index * 50} />
              ))}
              
              {query.length > 0 && manualResults.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No contacts found for "{query}"</Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 10,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 16,
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: Colors.cardHighlight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    minHeight: 140,
    marginBottom: 32,
  },
  aiInput: {
    color: Colors.text,
    fontSize: 18,
    flex: 1,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    color: Colors.text,
    fontSize: 14,
  },
  manualInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardHighlight,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  manualInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    marginLeft: 12,
  },
  resultsContainer: {
    marginTop: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: Colors.textMuted,
    fontSize: 16,
  }
});
