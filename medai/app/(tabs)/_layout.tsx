import { Tabs } from 'expo-router';
import {
  BeakerIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  HomeIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import {
  BeakerIcon as BeakerIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  HomeIcon as HomeIconSolid,
  UserIcon as UserIconSolid,
} from 'react-native-heroicons/solid';
import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 88,
          paddingTop: 8,
          paddingBottom: 24,
          paddingHorizontal: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <HomeIconSolid color={color} size={size} />
            ) : (
              <HomeIcon color={color} size={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <DocumentTextIconSolid color={color} size={size} />
            ) : (
              <DocumentTextIcon color={color} size={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="medicines"
        options={{
          title: 'Medicines',
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <BeakerIconSolid color={color} size={size} />
            ) : (
              <BeakerIcon color={color} size={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <ChatBubbleLeftRightIconSolid color={color} size={size} />
            ) : (
              <ChatBubbleLeftRightIcon color={color} size={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <UserIconSolid color={color} size={size} />
            ) : (
              <UserIcon color={color} size={size} />
            ),
        }}
      />
    </Tabs>
  );
}
