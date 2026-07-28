import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useContacts } from '../../context/ContactsContext';
import { MapPin, Phone, User as UserIcon, ChevronLeft, Edit2, MessageSquare, PhoneCall } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

export default function PersonProfileScreen() {
  const { id } = useLocalSearchParams();
  const { contacts } = useContacts();
  const router = useRouter();
  
  const person = contacts.find(c => c.id === id);

  if (!person) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Person not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft color={Colors.text} size={28} />
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <Edit2 color={Colors.text} size={24} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(500)} style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {person.image ? (
              <Image source={{ uri: person.image }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <UserIcon color={Colors.textMuted} size={48} />
              </View>
            )}
          </View>
          
          <Text style={styles.name}>{person.name}</Text>
          
          <View style={styles.tagsRow}>
            {person.location && (
              <View style={styles.tag}>
                <MapPin color={Colors.accent} size={14} />
                <Text style={styles.tagText}>{person.location}</Text>
              </View>
            )}
            <View style={styles.tag}>
              <Phone color={Colors.textMuted} size={14} />
              <Text style={styles.tagText}>{person.phone}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={SlideInDown.duration(600).springify()} style={styles.actionsRow}>
          <Pressable style={[styles.actionBtn, { backgroundColor: Colors.primary }]}>
            <PhoneCall color={Colors.text} size={20} />
            <Text style={styles.actionBtnText}>Call</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: Colors.cardHighlight }]}>
            <MessageSquare color={Colors.text} size={20} />
            <Text style={styles.actionBtnText}>Message</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300)}>
          {person.hasDetails ? (
            <>
              {person.relationship && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Who are they?</Text>
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionText}>{person.relationship}</Text>
                    {person.notes && (
                      <Text style={[styles.sectionText, styles.notesText]}>
                        {person.notes}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyDetails}>
              <Text style={styles.emptyTitle}>Missing Details</Text>
              <Text style={styles.emptyText}>You haven't added any context for this person yet.</Text>
              <Pressable style={styles.addDetailsBtn}>
                <Text style={styles.addDetailsText}>Add Context</Text>
              </Pressable>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  iconBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 24,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: Colors.cardHighlight,
  },
  placeholderAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.cardHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  name: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    color: Colors.textMuted,
    fontSize: 14,
    marginLeft: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionBtnText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionText: {
    color: Colors.warning,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  notesText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '400',
    marginTop: 8,
    lineHeight: 24,
  },
  emptyDetails: {
    backgroundColor: Colors.cardHighlight,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  addDetailsBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addDetailsText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.text,
    fontSize: 20,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
  },
  backBtnText: {
    color: Colors.text,
    fontSize: 16,
  }
});
