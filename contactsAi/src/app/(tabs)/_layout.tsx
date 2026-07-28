import { Tabs } from 'expo-router';
import { Home, Search, Users, PlusCircle } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

function AddButton() {
  const router = useRouter();
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[styles.addButtonContainer, style]}>
      <Pressable 
        onPressIn={() => scale.value = withSpring(0.9)}
        onPressOut={() => scale.value = withSpring(1)}
        onPress={() => router.push('/add/name')}
        style={styles.addButton}
      >
        <PlusCircle color={Colors.text} size={32} />
      </Pressable>
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="add-placeholder"
        options={{
          title: '',
          tabBarIcon: () => <AddButton />,
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default navigation
            e.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

// Needed because User wasn't imported at top
import { User } from 'lucide-react-native';

const styles = StyleSheet.create({
  addButtonContainer: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  }
});
