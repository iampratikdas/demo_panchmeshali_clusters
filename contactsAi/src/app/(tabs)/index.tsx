import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Colors, Gradients } from '../../constants/Colors';
import { useContacts } from '../../context/ContactsContext';
import { GradientCard } from '../../components/GradientCard';
import { PersonCard } from '../../components/PersonCard';
import { Sparkles, Plus, Users, Search, User as UserIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function Home() {
  const { contacts } = useContacts();
  const router = useRouter();
  
  const recentContacts = contacts.slice(0, 4);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Remember everyone.</Text>
            <Text style={styles.subtitle}>Find the people you're trying to remember.</Text>
          </View>
          <View style={styles.profileBtn}>
            <UserIcon color={Colors.text} size={20} />
          </View>
        </Animated.View>

        {/* Hero AI Search Card */}
        <Pressable onPress={() => router.push('/search')}>
          <GradientCard colors={Gradients.hero as any} style={styles.heroCard} delay={200}>
            <View style={styles.heroHeader}>
              <Text style={styles.heroTitle}>Who are you looking for?</Text>
              <Text style={styles.heroSubtitle}>Tell me what you remember. I'll help you find them.</Text>
            </View>
            
            <View style={styles.searchBox}>
              <Sparkles color={Colors.primary} size={20} style={{ marginRight: 8 }} />
              <Text style={styles.searchPlaceholder}>Try: 'My old colleague from Kolkata...'</Text>
            </View>
            
            <View style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Find Person</Text>
            </View>
          </GradientCard>
        </Pressable>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.quickActionsContainer}>
          <Pressable style={styles.actionCard} onPress={() => router.push('/add/name')}>
            <View style={[styles.iconBox, { backgroundColor: Colors.primary + '33' }]}>
              <Plus color={Colors.primary} size={24} />
            </View>
            <Text style={styles.actionText}>Add someone</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => router.push('/import')}>
            <View style={[styles.iconBox, { backgroundColor: Colors.accent + '33' }]}>
              <Users color={Colors.accent} size={24} />
            </View>
            <Text style={styles.actionText}>Import contacts</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => router.push('/search')}>
            <View style={[styles.iconBox, { backgroundColor: Colors.warning + '33' }]}>
              <Search color={Colors.warning} size={24} />
            </View>
            <Text style={styles.actionText}>Search by name</Text>
          </Pressable>
        </Animated.View>

        {/* Recently Added */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={styles.sectionTitle}>Recently added</Text>
          {recentContacts.map((contact, index) => (
            <PersonCard key={contact.id} person={contact} delay={500 + index * 100} />
          ))}
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroCard: {
    marginBottom: 32,
  },
  heroHeader: {
    marginBottom: 24,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: Colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardHighlight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  searchPlaceholder: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  heroButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  heroButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  }
});
