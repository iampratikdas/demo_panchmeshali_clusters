import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { User } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <User color={Colors.background} size={48} />
        </View>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>Settings and preferences will go here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 16,
  }
});
