import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MapPin, Phone, User, CheckCircle2 } from 'lucide-react-native';
import { Contact } from '../data/contacts';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';

interface PersonCardProps {
  person: Contact;
  delay?: number;
  showMatch?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PersonCard: React.FC<PersonCardProps> = ({ person, delay = 0, showMatch }) => {
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    router.push(`/person/${person.id}`);
  };

  return (
    <Animated.View entering={FadeIn.delay(delay).springify()}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.card, animatedStyle]}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User color={Colors.text} size={24} />
            </View>
            {showMatch && (
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{showMatch}% match</Text>
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{person.name}</Text>
            {person.location && (
              <View style={styles.row}>
                <MapPin color={Colors.accent} size={14} />
                <Text style={styles.location}>{person.location}</Text>
              </View>
            )}
            {!person.hasDetails && (
              <View style={styles.row}>
                <Phone color={Colors.textMuted} size={14} />
                <Text style={styles.phone}>{person.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {person.hasDetails && person.relationship && (
          <View style={styles.relationshipContainer}>
            <Text style={styles.relationship}>{person.relationship}</Text>
          </View>
        )}

        {!person.hasDetails && person.imported && (
          <View style={styles.needsDetails}>
            <Text style={styles.needsDetailsText}>No additional information yet.</Text>
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.cardHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  matchBadge: {
    position: 'absolute',
    bottom: -8,
    left: -10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  matchText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  location: {
    color: Colors.textMuted,
    fontSize: 14,
    marginLeft: 4,
  },
  phone: {
    color: Colors.textMuted,
    fontSize: 14,
    marginLeft: 4,
  },
  relationshipContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  relationship: {
    color: Colors.warning,
    fontSize: 14,
    fontWeight: '500',
  },
  needsDetails: {
    marginTop: 12,
    backgroundColor: Colors.cardHighlight,
    padding: 8,
    borderRadius: 8,
  },
  needsDetailsText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  }
});
