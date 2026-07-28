import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../constants/Colors';
import { useContacts } from '../context/ContactsContext';
import { useRouter } from 'expo-router';
import { Users, Shield, ArrowRight, X } from 'lucide-react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

export default function ImportScreen() {
  const { importContacts } = useContacts();
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImport = () => {
    setImporting(true);
    
    // Simulating expo-contacts permission & import for prototype
    setTimeout(() => {
      const newMockContacts = [
        {
          id: Math.random().toString(36).substr(2, 9),
          name: 'Jane Doe',
          phone: '+91 98765 11111',
          imported: true,
          hasDetails: false,
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          name: 'John Smith',
          phone: '+91 98765 22222',
          imported: true,
          hasDetails: false,
        }
      ];
      
      importContacts(newMockContacts);
      setSuccess(true);
      
      setTimeout(() => {
        router.back();
      }, 2000);
    }, 1500);
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Animated.View entering={SlideInUp.springify()} style={styles.successContent}>
          <Users color={Colors.primary} size={64} style={styles.successIcon} />
          <Text style={styles.successTitle}>Contacts imported!</Text>
          <Text style={styles.successSubtitle}>2 contacts have been added. You can add details to them later.</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X color={Colors.text} size={28} />
        </Pressable>
      </View>

      <Animated.View entering={FadeIn} style={styles.content}>
        <View style={styles.iconContainer}>
          <Users color={Colors.primary} size={48} />
        </View>
        
        <Text style={styles.title}>Bring your contacts with you.</Text>
        <Text style={styles.subtitle}>Import your existing contacts and add details later.</Text>

        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Shield color={Colors.accent} size={24} />
          </View>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>Contacts Access</Text>
            <Text style={styles.permissionText}>
              Allow access to your contacts so you can import people you already know.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable 
            style={[styles.button, importing && styles.buttonDisabled]} 
            onPress={handleImport}
            disabled={importing}
          >
            <Text style={styles.buttonText}>{importing ? 'Importing...' : 'Allow Contacts Access'}</Text>
            {!importing && <ArrowRight color={Colors.text} size={20} />}
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    alignItems: 'flex-end',
  },
  closeBtn: {
    padding: 8,
  },
  content: {
    padding: 24,
    flex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.cardHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 18,
    marginBottom: 40,
    lineHeight: 26,
  },
  permissionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cardHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  permissionText: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    lineHeight: 26,
  }
});
