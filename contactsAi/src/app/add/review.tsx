import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAddPerson } from '../../context/AddPersonContext';
import { useContacts } from '../../context/ContactsContext';
import { useRouter } from 'expo-router';
import { Sparkles, MapPin, Phone, User as UserIcon } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';

export default function ReviewScreen() {
  const { data, reset } = useAddPerson();
  const { addContact } = useContacts();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Simulate network delay for premium feel
    setTimeout(() => {
      addContact({
        name: data.name || 'Unknown',
        phone: data.phone || '',
        location: data.location,
        notes: data.notes,
        relationship: data.relationship || 'Unknown',
        image: data.image,
        imported: false,
        hasDetails: true,
      });
      setSuccess(true);
      
      setTimeout(() => {
        reset();
        router.dismissAll();
        router.replace('/');
      }, 2000);
    }, 1000);
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Animated.View entering={SlideInUp.springify()} style={styles.successContent}>
          <Sparkles color={Colors.primary} size={64} style={styles.successIcon} />
          <Text style={styles.successTitle}>Person saved!</Text>
          <Text style={styles.successSubtitle}>You'll be able to find them whenever you need.</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeIn}>
          <Text style={styles.title}>Review Profile</Text>
          
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                {data.image ? (
                  <Image source={{ uri: data.image }} style={styles.avatar} />
                ) : (
                  <View style={styles.placeholderAvatar}>
                    <UserIcon color={Colors.textMuted} size={32} />
                  </View>
                )}
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{data.name}</Text>
                {data.location && (
                  <View style={styles.row}>
                    <MapPin color={Colors.accent} size={14} />
                    <Text style={styles.textValue}>{data.location}</Text>
                  </View>
                )}
                {data.phone && (
                  <View style={styles.row}>
                    <Phone color={Colors.textMuted} size={14} />
                    <Text style={styles.textValue}>{data.phone}</Text>
                  </View>
                )}
              </View>
            </View>

            {data.notes && (
              <View style={styles.contextSection}>
                <Text style={styles.sectionTitle}>Who are they?</Text>
                <Text style={styles.notesText}>{data.notes}</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInDown} style={styles.footer}>
        <Pressable 
          style={[styles.button, saving && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Person'}</Text>
        </Pressable>
      </Animated.View>
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
    paddingBottom: 100,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
    marginTop: 10,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.cardHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  info: {
    flex: 1,
    gap: 8,
  },
  name: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textValue: {
    color: Colors.textMuted,
    fontSize: 14,
    marginLeft: 6,
  },
  contextSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.warning,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  successSubtitle: {
    color: Colors.textMuted,
    fontSize: 18,
    textAlign: 'center',
  }
});
