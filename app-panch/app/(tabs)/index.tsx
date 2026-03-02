import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StoryCard } from '@/components/story-card';
import { AuthorAvatar } from '@/components/author-avatar';
import { CategoryButton } from '@/components/category-button';
import { SectionHeader } from '@/components/section-header';

// Dummy data
const RECOMMENDATIONS = [
  { id: '1', title: 'The Curious Little Fox', chapters: 7, image: require('@/assets/images/icon.png') },
  { id: '2', title: 'Ocean Adventures', chapters: 5, image: require('@/assets/images/icon.png') },
  { id: '3', title: 'Mountain Friends', chapters: 6, image: require('@/assets/images/icon.png') },
];

const AUTHORS = [
  { id: '1', name: 'Lia M.', image: require('@/assets/images/icon.png'), bgColor: '#FFD4D4' },
  { id: '2', name: 'Kento R.', image: require('@/assets/images/icon.png'), bgColor: '#FFE0B5' },
  { id: '3', name: 'Mila S.', image: require('@/assets/images/icon.png'), bgColor: '#D4B5FF' },
  { id: '4', name: 'Rio T. M.', image: require('@/assets/images/icon.png'), bgColor: '#FFB5C5' },
];

const CATEGORIES = ['All', 'Adventure', 'Animal', 'Fantasy', 'Science', 'Mystery'];

const STORIES = [
  { id: '1', title: 'Bear & Bird Adventure', chapters: 8, image: require('@/assets/images/icon.png') },
  { id: '2', title: 'Horse & Friends', chapters: 6, image: require('@/assets/images/icon.png') },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#C5F1D6', '#D4F5E3', '#E8F9EF']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.appIcon}>
                  <Text style={styles.appIconText}>📚</Text>
                </View>
                <Text style={styles.appName}>StoryNest</Text>
              </View>
              <View style={styles.profilePic}>
                <Text style={styles.profileEmoji}>👤</Text>
              </View>
            </View>

            {/* Recommendations Section */}
            <View style={styles.section}>
              <SectionHeader title="Recommendations" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {RECOMMENDATIONS.map((story) => (
                  <View key={story.id} style={styles.cardWrapper}>
                    <StoryCard
                      title={story.title}
                      chapters={story.chapters}
                      imageSource={story.image}
                      onPress={() => console.log('Story pressed:', story.title)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Top Authors Section */}
            <View style={styles.section}>
              <SectionHeader title="Top Authors" showViewAll onViewAllPress={() => console.log('View all authors')} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.authorsContainer}
              >
                {AUTHORS.map((author) => (
                  <AuthorAvatar
                    key={author.id}
                    name={author.name}
                    imageSource={author.image}
                    backgroundColor={author.bgColor}
                    onPress={() => console.log('Author pressed:', author.name)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Categories Section */}
            <View style={styles.section}>
              <SectionHeader title="Categories" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {CATEGORIES.map((category) => (
                  <CategoryButton
                    key={category}
                    label={category}
                    isActive={selectedCategory === category}
                    onPress={() => setSelectedCategory(category)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Story Grid */}
            <View style={styles.storyGrid}>
              {STORIES.map((story) => (
                <View key={story.id} style={styles.gridItem}>
                  <StoryCard
                    title={story.title}
                    chapters={story.chapters}
                    imageSource={story.image}
                    onPress={() => console.log('Story pressed:', story.title)}
                  />
                </View>
              ))}
            </View>

            {/* Bottom Padding */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    fontSize: 24,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE0B5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileEmoji: {
    fontSize: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  horizontalScroll: {
    paddingRight: 20,
  },
  cardWrapper: {
    marginRight: 16,
  },
  authorsContainer: {
    gap: 12,
    paddingRight: 20,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  storyGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '47%',
  },
  bottomPadding: {
    height: 40,
  },
});
